/**
 * js/perfil.js
 * Responsável pela Página de Perfil / Vitrine do Usuário (pages/perfil.html - Etapa 6):
 * - Lê a sessão ativa no localStorage via Auth.obterUsuarioLogado() (ID 14).
 * - Consome GET /avaliacoes?usuarioId=... e GET /sistemas no JSON Server (ID 23).
 * - Organiza a vitrine pessoal nas 3 abas exigidas pelo PRD (US03):
 *   - "Jogando" (statusConsumo === "JOGANDO")
 *   - "Já joguei" (statusConsumo === "JOGOU")
 *   - "Quero jogar" (statusConsumo === "QUERO_JOGAR")
 * - Exibe em cada card a nota dada pelo usuário (1 a 5 estrelas), o papel na mesa
 *   ("JOGADOR" ou "MESTRE"), o trecho da resenha e o status de moderação ("PENDENTE" ou "APROVADA").
 */

const PaginaPerfil = {
  usuarioExibido: null,
  sistemasMap: {},
  avaliacoesUsuario: [],
  abaStatusAtual: 'JOGANDO',
  filtroPapelAtual: 'TODOS',
  ordenacaoAtual: 'RECENTES', // 'RECENTES' ou 'MAIOR_NOTA'

  capasPorSistema: {
    'Ordem Paranormal': { webp: '../img/ordem-paranormal.webp', png: '../img/ordem-paranormal.png' },
    'Tormenta20': { webp: '../img/tormenta20.webp', png: '../img/tormenta20.png' },
    'Dungeons & Dragons 5e': { webp: '../img/dnd5e.webp', png: '../img/dnd5e.png' },
    'Call of Cthulhu 7e': { webp: '../img/monster-week.webp', png: '../img/monster-week.png' },
    'Vampiro: A Máscara 5ª': { webp: '../img/vampiro5e.webp', png: '../img/vampiro5e.png' },
    'Blades in the Dark': { webp: '../img/blades.webp', png: '../img/blades.png' },
    'Pathfinder 2e': { webp: '../img/pathfinder2e.webp', png: '../img/pathfinder2e.png' },
    'Monster of the Week': { webp: '../img/monster-week.webp', png: '../img/monster-week.png' },
    'Cyberpunk RED': { webp: '../img/cyberpunk-red.webp', png: '../img/cyberpunk-red.png' },
  },

  fallbackSistemas: [
    { id: '1', nome: 'Ordem Paranormal', editora: 'Jambô Editora', ano: 2022, genero: 'Terror', mecanica: 'd20', notaMedia: 4.7 },
    { id: '2', nome: 'Tormenta20', editora: 'Jambô Editora', ano: 2020, genero: 'Fantasia', mecanica: 'd20', notaMedia: 4.8 },
    { id: '3', nome: 'Call of Cthulhu 7e', editora: 'Chaosium / New Order', ano: 2014, genero: 'Terror', mecanica: 'd100', notaMedia: 4.6 },
    { id: '4', nome: 'Dungeons & Dragons 5e', editora: 'Wizards of the Coast', ano: 2014, genero: 'Fantasia Heroica', mecanica: 'd20', notaMedia: 4.5 },
    { id: '5', nome: 'Vampiro: A Máscara 5ª', editora: 'Galápagos Jogos', ano: 2018, genero: 'Horror Pessoal', mecanica: 'Dice Pool', notaMedia: 4.4 },
    { id: '6', nome: 'Blades in the Dark', editora: 'Buró Brasil', ano: 2017, genero: 'Fantasia Urbana', mecanica: 'PbtA', notaMedia: 4.7 },
    { id: '7', nome: 'Pathfinder 2e', editora: 'New Order Editora', ano: 2019, genero: 'Alta Fantasia', mecanica: 'd20', notaMedia: 4.6 },
    { id: '8', nome: 'Monster of the Week', editora: 'Retropunk', ano: 2015, genero: 'Investigação', mecanica: 'PbtA', notaMedia: 4.3 },
    { id: '9', nome: 'Cyberpunk RED', editora: 'Devir', ano: 2020, genero: 'Cyberpunk', mecanica: 'Narrativo', notaMedia: 4.2 },
  ],

  fallbackAvaliacoesAna: [
    {
      id: '1',
      usuarioId: '1',
      sistemaId: '1',
      nota: 5,
      texto: 'Ótima atmosfera de horror investigativo, o sistema de sanidade e rituais engaja demais a mesa. Recomendo mestrar!',
      papel: 'MESTRE',
      statusConsumo: 'JOGOU',
      statusModeracao: 'APROVADA',
      data: '2026-03-16',
    },
    {
      id: '3',
      usuarioId: '1',
      sistemaId: '2',
      nota: 5,
      texto: 'O cenário de Arton está incrível na edição Jogo do Ano. Customização de personagens com poderes gerais é excelente.',
      papel: 'JOGADOR',
      statusConsumo: 'JOGANDO',
      statusModeracao: 'APROVADA',
      data: '2026-03-20',
    },
    {
      id: '5',
      usuarioId: '1',
      sistemaId: '6',
      nota: 5,
      texto: 'A mecânica de Flashback e os relógios de progresso mudaram minha forma de mestrar golpes e cenas de ação.',
      papel: 'MESTRE',
      statusConsumo: 'QUERO_JOGAR',
      statusModeracao: 'APROVADA',
      data: '2026-03-25',
    },
  ],

  async init() {
    this.definirUsuarioDaVitrine();
    this.configurarEventos();
    await this.carregarDadosVitrine();
  },

  /**
   * Identifica o usuário logado no localStorage (ID 14).
   * Caso o visitante abra a página sem login, exibe a vitrine demonstrativa de Ana Mestra (id: "1")
   * com um aviso convidando-o a entrar na própria conta.
   */
  definirUsuarioDaVitrine() {
    const usuarioLogado = Auth.obterUsuarioLogado();

    if (usuarioLogado) {
      this.usuarioExibido = usuarioLogado;
      $('#profile-guest-notice').hide();
    } else {
      this.usuarioExibido = {
        id: '1',
        nome: 'Ana Mestra',
        email: 'ana@email.com',
        tipo: 'USUARIO',
      };
      $('#profile-guest-notice').css('display', 'flex');
    }

    this.renderizarCabecalhoUsuario();
  },

  /**
   * Atualiza o cartão principal do perfil com nome, iniciais, e-mail e papel predominante.
   */
  renderizarCabecalhoUsuario() {
    const u = this.usuarioExibido;
    if (!u) return;

    const iniciais = (u.nome || 'A')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');

    $('#profile-avatar-initials').text(iniciais);
    $('#profile-user-name').text(u.nome);

    const cargoGuilda = u.tipo === 'ADMIN' ? 'Moderador(a) da Guilda (ADMIN)' : 'Membro da Taverna Brasileira';
    $('#profile-user-handle').text(`${u.email} • ${cargoGuilda}`);

    const papelSalvo = localStorage.getItem('inessa_rpg_papel_preferido') || 'MESTRE';
    $('#profile-role-badge-text').text(u.tipo === 'ADMIN' ? 'ADMIN' : papelSalvo);
  },

  /**
   * Busca sistemas e avaliações do usuário na API JSON Server (ID 23).
   */
  async carregarDadosVitrine() {
    const usuarioId = String(this.usuarioExibido.id);

    try {
      const [sistemas, avaliacoesApi] = await Promise.all([
        Api.listarSistemas(),
        Api.listarAvaliacoesPorUsuario(usuarioId),
      ]);

      (sistemas || []).forEach((s) => {
        this.sistemasMap[String(s.id)] = s;
      });

      this.avaliacoesUsuario = Array.isArray(avaliacoesApi) ? avaliacoesApi : [];
    } catch (erro) {
      console.warn('JSON Server offline ao carregar perfil. Utilizando dados locais de segurança:', erro);
      this.fallbackSistemas.forEach((s) => {
        this.sistemasMap[String(s.id)] = s;
      });
      this.avaliacoesUsuario =
        usuarioId === '1'
          ? [...this.fallbackAvaliacoesAna]
          : [];
    }

    // Mescla sistemas cadastrados localmente pelo Admin
    try {
      const sistemasLocais = JSON.parse(localStorage.getItem('inessa_rpg_sistemas_locais') || '[]');
      sistemasLocais.forEach((s) => {
        this.sistemasMap[String(s.id)] = s;
      });
    } catch (e) {
      // Ignora erro de parse
    }

    // Mescla eventuais avaliações gravadas em cache local durante modo offline
    const avaliacoesLocais = JSON.parse(localStorage.getItem('inessa_rpg_avaliacoes_locais') || '[]');
    const locaisDoUsuario = avaliacoesLocais.filter((av) => String(av.usuarioId) === usuarioId);
    locaisDoUsuario.forEach((avLocal) => {
      const jaExiste = this.avaliacoesUsuario.some((a) => String(a.id) === String(avLocal.id));
      if (!jaExiste) {
        this.avaliacoesUsuario.push(avLocal);
      }
    });

    this.atualizarEstatisticasEContadores();
    this.renderizarCardsVitrine();
  },

  /**
   * Atualiza os 4 indicadores da grade de estatísticas e os contadores das 3 abas.
   */
  atualizarEstatisticasEContadores() {
    const todas = this.avaliacoesUsuario;
    const total = todas.length;

    const somaNotas = todas.reduce((acc, av) => acc + Number(av.nota || 0), 0);
    const mediaDada = total > 0 ? (somaNotas / total).toFixed(1) : '0.0';

    const qtdMestre = todas.filter((av) => av.papel === 'MESTRE').length;
    const qtdJogador = todas.filter((av) => av.papel === 'JOGADOR').length;

    $('#stat-total-systems').text(total);
    $('#stat-avg-rating').text(mediaDada);
    $('#stat-count-gm').text(qtdMestre);
    $('#stat-count-player').text(qtdJogador);

    // Contadores por aba de statusConsumo
    const qtdJogando = todas.filter((av) => av.statusConsumo === 'JOGANDO').length;
    const qtdJogou = todas.filter((av) => av.statusConsumo === 'JOGOU').length;
    const qtdQuero = todas.filter((av) => av.statusConsumo === 'QUERO_JOGAR').length;

    $('#count-tab-jogando').text(qtdJogando);
    $('#count-tab-jogou').text(qtdJogou);
    $('#count-tab-quero').text(qtdQuero);

    // Atualiza o badge do avatar conforme o papel mais frequente do usuário
    if (this.usuarioExibido.tipo !== 'ADMIN' && total > 0) {
      $('#profile-role-badge-text').text(qtdMestre >= qtdJogador ? 'MESTRE' : 'JOGADOR');
    }
  },

  gerarEstrelasHtml(nota) {
    const n = Number(nota) || 0;
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      html += `<i class="material-icons" aria-hidden="true">${i <= n ? 'star' : 'star_border'}</i>`;
    }
    return html;
  },

  formatarDataCurta(dataIso) {
    if (!dataIso) return 'Data recente';
    const partes = String(dataIso).split('-');
    if (partes.length !== 3) return dataIso;
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const ano = partes[0];
    const mes = meses[parseInt(partes[1], 10) - 1] || partes[1];
    const dia = parseInt(partes[2], 10);
    return `Avaliado em ${dia} ${mes} ${ano}`;
  },

  /**
   * Renderiza os cards de sistemas da aba selecionada ("JOGANDO", "JOGOU" ou "QUERO_JOGAR").
   */
  renderizarCardsVitrine() {
    const $grid = $('#profile-showcase-grid');
    $grid.empty();

    // 1. Filtra pela aba ativa de statusConsumo
    let lista = this.avaliacoesUsuario.filter(
      (av) => av.statusConsumo === this.abaStatusAtual
    );

    // 2. Filtra pelo chip de papel (TODOS, MESTRE ou JOGADOR)
    if (this.filtroPapelAtual !== 'TODOS') {
      lista = lista.filter((av) => av.papel === this.filtroPapelAtual);
    }

    // 3. Ordena (Mais recentes vs Maior nota)
    if (this.ordenacaoAtual === 'MAIOR_NOTA') {
      lista.sort((a, b) => Number(b.nota) - Number(a.nota));
    } else {
      lista.sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
    }

    if (lista.length === 0) {
      const nomesAbas = {
        JOGANDO: 'Jogando atualmente',
        JOGOU: 'Já joguei',
        QUERO_JOGAR: 'Quero jogar',
      };
      const nomeAba = nomesAbas[this.abaStatusAtual] || this.abaStatusAtual;

      $grid.html(`
        <div class="showcase-card" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1.25rem; align-items: center;">
          <i class="material-icons" style="font-size: 2.5rem; color: var(--color-primary);">collections_bookmark</i>
          <h3 style="margin: 0.25rem 0 0 0; font-size: 1.1rem;">Nenhum sistema na aba "${nomeAba}"</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem; max-width: 28rem; margin: 0;">
            Registre uma nova avaliação e escolha o status <strong>${nomeAba}</strong> para organizar sua estante de RPG!
          </p>
          <button type="button" class="btn-inessa btn-inessa--primary js-open-review-modal" style="margin-top: 0.5rem;">
            <i class="material-icons" style="font-size: 1rem; color: var(--color-accent);">add</i>
            <span>Adicionar Sistema à Vitrine</span>
          </button>
        </div>
      `);
      return;
    }

    lista.forEach((av) => {
      const sistema = this.sistemasMap[String(av.sistemaId)] || {
        id: av.sistemaId,
        nome: `Sistema #${av.sistemaId}`,
        editora: 'Editora de RPG',
        genero: 'RPG de Mesa',
        mecanica: 'd20',
      };

      const capa = this.capasPorSistema[sistema.nome] || {
        webp: '../img/ordem-paranormal.webp',
        png: '../img/ordem-paranormal.png',
      };

      const ehMestre = av.papel === 'MESTRE';
      const roleBadgeClass = ehMestre
        ? 'review-card__role-badge--gm'
        : 'review-card__role-badge--player';
      const roleIcon = ehMestre ? 'shield' : 'person';
      const roleLabel = ehMestre ? 'MESTRE' : 'JOGADOR(A)';

      // Selo de status de moderação (APROVADA, PENDENTE ou REJEITADA)
      let modClass = 'moderation-pill--pendente';
      let modIcon = 'schedule';
      let modTexto = 'Moderação Pendente';

      if (av.statusModeracao === 'APROVADA') {
        modClass = 'moderation-pill--aprovada';
        modIcon = 'verified';
        modTexto = 'Publicada (Aprovada)';
      } else if (av.statusModeracao === 'REJEITADA') {
        modClass = 'moderation-pill--rejeitada';
        modIcon = 'cancel';
        modTexto = 'Rejeitada pela Moderação';
      }

      const notaFormatada = Number(av.nota || 0).toFixed(1);
      const textoResenha =
        av.texto && av.texto.trim().length > 0
          ? av.texto
          : 'Avaliação registrada apenas com classificação em estrelas.';

      const cardHtml = `
        <article class="showcase-card">
          <div class="showcase-card__top">
            <a href="sistema.html?id=${sistema.id}" class="showcase-card__cover">
              <picture>
                <source srcset="${capa.webp}" type="image/webp">
                <img src="${capa.png}" alt="Capa de ${sistema.nome}" class="img-cover" loading="lazy">
              </picture>
            </a>

            <div class="showcase-card__info">
              <div class="showcase-card__title-row">
                <h2 class="showcase-card__title">
                  <a href="sistema.html?id=${sistema.id}">${sistema.nome}</a>
                </h2>
                <span class="review-card__role-badge ${roleBadgeClass}" style="flex-shrink: 0;">
                  <i class="material-icons" style="font-size: 0.75rem;">${roleIcon}</i>
                  <span>${roleLabel}</span>
                </span>
              </div>

              <p class="showcase-card__meta">
                ${sistema.editora} • ${sistema.genero} (${sistema.mecanica})
              </p>

              <div class="showcase-card__rating-row" aria-label="Sua nota: ${notaFormatada} de 5">
                <span class="showcase-card__stars">
                  ${this.gerarEstrelasHtml(av.nota)}
                </span>
                <span class="showcase-card__score">${notaFormatada}</span>
              </div>

              <p class="showcase-card__date">${this.formatarDataCurta(av.data)}</p>
            </div>
          </div>

          <div class="showcase-card__quote">
            <i class="material-icons" aria-hidden="true">format_quote</i>
            <p class="showcase-card__quote-text">${textoResenha}</p>
          </div>

          <div class="showcase-card__footer">
            <span class="moderation-pill ${modClass}">
              <i class="material-icons" aria-hidden="true">${modIcon}</i>
              <span>${modTexto}</span>
            </span>

            <a href="sistema.html?id=${sistema.id}" class="showcase-card__link">
              <span>Ver Sistema</span>
              <i class="material-icons" style="font-size: 1rem;" aria-hidden="true">chevron_right</i>
            </a>
          </div>
        </article>
      `;

      $grid.append(cardHtml);
    });
  },

  configurarEventos() {
    // Alternância entre as 3 abas da Vitrine: Jogando, Já joguei e Quero jogar
    $('.js-profile-tab').on('click', (evento) => {
      const $aba = $(evento.currentTarget);
      $('.js-profile-tab').removeClass('active').attr('aria-selected', 'false');
      $aba.addClass('active').attr('aria-selected', 'true');

      this.abaStatusAtual = $aba.data('status');
      this.renderizarCardsVitrine();
    });

    // Filtro por papel (Todos, Como Mestre, Como Jogador)
    $('#profile-role-filters').on('click', '.js-profile-role-chip', (evento) => {
      const $chip = $(evento.currentTarget);
      $('#profile-role-filters .js-profile-role-chip').removeClass('active');
      $chip.addClass('active');

      this.filtroPapelAtual = $chip.data('role');
      this.renderizarCardsVitrine();
    });

    // Alternar ordenação (Mais recentes vs Maior nota)
    $('#btn-sort-showcase').on('click', () => {
      if (this.ordenacaoAtual === 'RECENTES') {
        this.ordenacaoAtual = 'MAIOR_NOTA';
        $('#sort-showcase-label').text('Maior nota');
      } else {
        this.ordenacaoAtual = 'RECENTES';
        $('#sort-showcase-label').text('Mais recentes');
      }
      this.renderizarCardsVitrine();
    });

    // Botão Compartilhar Vitrine
    $('#btn-share-profile').on('click', () => {
      if (window.M && M.toast) {
        M.toast({
          html: `Link da vitrine de ${this.usuarioExibido.nome} copiado para a área de transferência!`,
          displayLength: 2800,
        });
      }
    });

    // Momento de Deleite: Rolar Dado da Sorte (d20) (Frame 1:2993)
    $('#btn-roll-lucky-d20').on('click', () => {
      const resultadoD20 = Math.floor(Math.random() * 20) + 1;
      const sistemasLista = Object.values(this.sistemasMap);
      const sorteado =
        sistemasLista.length > 0
          ? sistemasLista[Math.floor(Math.random() * sistemasLista.length)]
          : { id: '1', nome: 'Ordem Paranormal' };

      const critico = resultadoD20 === 20 ? 'SUCESSO CRÍTICO! ' : '';
      if (window.M && M.toast) {
        // Envolvemos o texto em um <span> único porque o .toast do Materialize usa display: flex,
        // o que colapsaria espaços entre nós de texto e tags <strong> filhas diretas.
        M.toast({
          html: `<span>🎲 Rolagem d20: <strong>${resultadoD20}</strong>! ${critico}O grimório recomenda jogar <strong>${sorteado.nome}</strong>!</span>`,
          displayLength: 4000,
        });
      }
    });

    // Recarrega a vitrine automaticamente após o usuário publicar uma avaliação no modal
    $(document).on('submit', '#form-avaliacao', () => {
      setTimeout(() => {
        this.carregarDadosVitrine();
      }, 600);
    });
  },
};

$(document).ready(() => {
  PaginaPerfil.init();
});

window.PaginaPerfil = PaginaPerfil;
