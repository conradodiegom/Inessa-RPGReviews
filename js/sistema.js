/**
 * js/sistema.js
 * Responsável pela Página do Sistema (pages/sistema.html):
 * - Lê o parâmetro ?id= da URL e carrega os dados do sistema via JSON Server (ID 23).
 * - Busca todas as avaliações vinculadas ao sistema e filtra APENAS as com
 *   statusModeracao === "APROVADA" (Regra de Negócio Crítica).
 * - Calcula dinamicamente a nota média, o perfil dos votantes (Mestres vs Jogadores)
 *   e a distribuição percentual de estrelas (5 a 1).
 * - Quando o sistema é "Dungeons & Dragons 5e", consome a API pública oficial
 *   https://www.dnd5eapi.co/api (classes e magias) com tratamento de erro amigável (ID 24).
 */

const PaginaSistema = {
  sistemaId: '1',
  sistemaAtual: null,
  usuariosMap: {},
  avaliacoesAprovadas: [],
  filtroReviewAtual: 'RECENTES',
  abaDndAtual: 'classes',

  /**
   * Metadados visuais complementares (autores, tags de ambientação e capas)
   * alinhados ao protótipo do Figma.
   */
  detalhesExtrasSistemas: {
    'Ordem Paranormal': {
      webp: '../img/ordem-paranormal.webp',
      png: '../img/ordem-paranormal.png',
      selo: 'TTRPG Brasileiro',
      autores: 'Cellbit, Felipe Della Corte & Silvia Sala',
      mecanicaLabel: 'd20 Customizado',
      tags: [
        { icone: 'visibility', texto: 'Terror Investigativo' },
        { icone: 'auto_fix_high', texto: 'Sobrenatural' },
        { icone: 'gps_fixed', texto: 'Combate Tático' },
      ],
    },
    'Tormenta20': {
      webp: '../img/tormenta20.webp',
      png: '../img/tormenta20.png',
      selo: 'TTRPG Brasileiro',
      autores: 'Leonelo Caldela, Guilherme Dei Svaldi & J.M. Trevisan',
      mecanicaLabel: 'Sistema d20',
      tags: [
        { icone: 'shield', texto: 'Alta Fantasia' },
        { icone: 'bolt', texto: 'Heroico' },
        { icone: 'groups', texto: 'Cenário Arton' },
      ],
    },
    'Dungeons & Dragons 5e': {
      webp: '../img/dnd5e.webp',
      png: '../img/dnd5e.png',
      selo: 'Clássico Internacional',
      autores: 'Jeremy Crawford & Mike Mearls',
      mecanicaLabel: 'd20 System (SRD 5.1)',
      tags: [
        { icone: 'auto_awesome', texto: 'Fantasia Heroica' },
        { icone: 'explore', texto: 'Exploração de Masmorras' },
        { icone: 'menu_book', texto: 'SRD Oficial' },
      ],
    },
    'Call of Cthulhu 7e': {
      webp: '../img/monster-week.webp',
      png: '../img/monster-week.png',
      selo: 'Horror Cósmico',
      autores: 'Sandy Petersen, Paul Fricker & Mike Mason',
      mecanicaLabel: 'Basic Roleplaying (d100)',
      tags: [
        { icone: 'search', texto: 'Investigação Oculta' },
        { icone: 'psychology', texto: 'Sanidade' },
        { icone: 'history_edu', texto: 'Anos 1920' },
      ],
    },
    'Vampiro: A Máscara 5ª': {
      webp: '../img/vampiro5e.webp',
      png: '../img/vampiro5e.png',
      selo: 'Mundo das Trevas',
      autores: 'Kenneth Hite, Karim Muammar & Martin Ericsson',
      mecanicaLabel: 'Storyteller (Dice Pool)',
      tags: [
        { icone: 'nightlight_round', texto: 'Horror Pessoal' },
        { icone: 'theater_comedy', texto: 'Intriga Política' },
        { icone: 'water_drop', texto: 'Dados de Fome' },
      ],
    },
    'Blades in the Dark': {
      webp: '../img/blades.webp',
      png: '../img/blades.png',
      selo: 'Indie Premiado',
      autores: 'John Harper',
      mecanicaLabel: 'Forged in the Dark (PbtA)',
      tags: [
        { icone: 'schedule', texto: 'Relógios de Progresso' },
        { icone: 'history', texto: 'Flashbacks' },
        { icone: 'location_city', texto: 'Fantasia Industrial' },
      ],
    },
    'Pathfinder 2e': {
      webp: '../img/pathfinder2e.webp',
      png: '../img/pathfinder2e.png',
      selo: 'Fantasia Tática',
      autores: 'Logan Bonner, Jason Bulmahn & Mark Seifter',
      mecanicaLabel: 'd20 (3 Ações)',
      tags: [
        { icone: 'grid_on', texto: 'Combate Tático' },
        { icone: 'tune', texto: 'Alta Customização' },
        { icone: 'public', texto: 'Golarion' },
      ],
    },
    'Monster of the Week': {
      webp: '../img/monster-week.webp',
      png: '../img/monster-week.png',
      selo: 'Ficção Sobrenatural',
      autores: 'Michael Sands',
      mecanicaLabel: 'Powered by the Apocalypse',
      tags: [
        { icone: 'search', texto: 'Caça a Monstros' },
        { icone: 'record_voice_over', texto: 'Foco Narrativo' },
        { icone: 'bolt', texto: 'Mistério Semanal' },
      ],
    },
    'Cyberpunk RED': {
      webp: '../img/cyberpunk-red.webp',
      png: '../img/cyberpunk-red.png',
      selo: 'Futuro Sombrio',
      autores: 'Mike Pondsmith',
      mecanicaLabel: 'Interlock / Narrativo',
      tags: [
        { icone: 'memory', texto: 'Cyberware' },
        { icone: 'terminal', texto: 'Netrunning' },
        { icone: 'Apartment', texto: 'Night City' },
      ],
    },
  },

  /**
   * Fallback caso o JSON Server esteja desligado no momento do teste.
   */
  fallbackSistemas: {
    '1': { id: '1', nome: 'Ordem Paranormal', editora: 'Jambô Editora', ano: 2022, genero: 'Terror', mecanica: 'd20', notaMedia: 4.7 },
    '2': { id: '2', nome: 'Tormenta20', editora: 'Jambô Editora', ano: 2020, genero: 'Fantasia', mecanica: 'd20', notaMedia: 4.8 },
    '3': { id: '3', nome: 'Call of Cthulhu 7e', editora: 'Chaosium / New Order', ano: 2014, genero: 'Terror', mecanica: 'd100', notaMedia: 4.6 },
    '4': { id: '4', nome: 'Dungeons & Dragons 5e', editora: 'Wizards of the Coast', ano: 2014, genero: 'Fantasia Heroica', mecanica: 'd20', notaMedia: 4.5 },
    '5': { id: '5', nome: 'Vampiro: A Máscara 5ª', editora: 'Galápagos Jogos', ano: 2018, genero: 'Horror Pessoal', mecanica: 'Dice Pool', notaMedia: 4.4 },
    '6': { id: '6', nome: 'Blades in the Dark', editora: 'Buró Brasil', ano: 2017, genero: 'Fantasia Urbana', mecanica: 'PbtA', notaMedia: 4.7 },
    '7': { id: '7', nome: 'Pathfinder 2e', editora: 'New Order Editora', ano: 2019, genero: 'Alta Fantasia', mecanica: 'd20', notaMedia: 4.6 },
    '8': { id: '8', nome: 'Monster of the Week', editora: 'Retropunk', ano: 2015, genero: 'Investigação', mecanica: 'PbtA', notaMedia: 4.3 },
    '9': { id: '9', nome: 'Cyberpunk RED', editora: 'Devir', ano: 2020, genero: 'Cyberpunk', mecanica: 'Narrativo', notaMedia: 4.2 },
  },

  fallbackAvaliacoes: [
    {
      id: '1',
      usuarioId: '1',
      sistemaId: '1',
      nota: 5,
      texto: 'O sistema de Sanidade e Investigação funciona muito bem na mesa. A adaptação do d20 para combate tático contra criaturas de Sangue e Morte é visceral. Recomendo muito para quem quer misturar horror investigativo com ação.',
      papel: 'MESTRE',
      statusConsumo: 'JOGOU',
      statusModeracao: 'APROVADA',
      data: '2026-03-16',
    },
    {
      id: '2',
      usuarioId: '3',
      sistemaId: '1',
      nota: 4,
      texto: 'Joguei uma campanha de 8 sessões como Ocultista. A progressão de rituais é muito divertida e visualmente inspiradora. Só achei o combate um pouco letal demais nos primeiros níveis, mas faz parte do terror!',
      papel: 'JOGADOR',
      statusConsumo: 'JOGANDO',
      statusModeracao: 'APROVADA',
      data: '2026-03-18',
    },
    {
      id: '4',
      usuarioId: '3',
      sistemaId: '4',
      nota: 5,
      texto: 'Porta de entrada clássica para o RPG de fantasia medieval. Fácil de ensinar para iniciantes e cheio de material de referência no SRD.',
      papel: 'MESTRE',
      statusConsumo: 'JOGOU',
      statusModeracao: 'APROVADA',
      data: '2026-03-22',
    },
  ],

  async init() {
    const params = new URLSearchParams(window.location.search);
    this.sistemaId = params.get('id') || '1';

    this.configurarEventos();
    await this.carregarDadosSistema();
  },

  /**
   * Busca sistema, usuários e avaliações no JSON Server (ID 23).
   */
  async carregarDadosSistema() {
    try {
      const [sistema, usuarios, avaliacoes] = await Promise.all([
        Api.buscarSistemaPorId(this.sistemaId),
        Api.listarUsuarios(),
        Api.listarAvaliacoesPorSistema(this.sistemaId),
      ]);

      this.sistemaAtual = sistema;
      usuarios.forEach((u) => {
        this.usuariosMap[u.id] = u.nome;
      });

      // REGRA DE NEGÓCIO CRÍTICA: Somente avaliações com statusModeracao === "APROVADA"
      // entram na exibição pública e no cálculo de estatísticas!
      this.avaliacoesAprovadas = (avaliacoes || []).filter(
        (av) => av.statusModeracao === 'APROVADA'
      );
      $('#system-api-warning').hide();
    } catch (erro) {
      console.warn('JSON Server offline. Carregando dados de segurança para a página do sistema:', erro);
      const sistemasLocais = JSON.parse(localStorage.getItem('inessa_rpg_sistemas_locais') || '[]');
      const sistemaLocal = sistemasLocais.find((s) => String(s.id) === String(this.sistemaId));
      this.sistemaAtual =
        sistemaLocal || this.fallbackSistemas[this.sistemaId] || this.fallbackSistemas['1'];
      this.usuariosMap = {
        '1': 'Ana Mestra',
        '2': 'Admin Poço Penumbra',
        '3': 'Lucas Valente',
      };
      this.avaliacoesAprovadas = this.fallbackAvaliacoes.filter(
        (av) => av.sistemaId === String(this.sistemaAtual.id) && av.statusModeracao === 'APROVADA'
      );
      $('#system-api-warning').fadeIn(200);
    }

    // Sincroniza avaliações aprovadas e notaMedia salvas no localStorage pelo Painel Admin
    try {
      const avLocais = JSON.parse(localStorage.getItem('inessa_rpg_avaliacoes_locais') || '[]');
      avLocais.forEach((avLocal) => {
        if (
          String(avLocal.sistemaId) === String(this.sistemaAtual.id) &&
          avLocal.statusModeracao === 'APROVADA' &&
          !this.avaliacoesAprovadas.some((a) => String(a.id) === String(avLocal.id))
        ) {
          this.avaliacoesAprovadas.push(avLocal);
        }
      });

      const notasSalvas = JSON.parse(localStorage.getItem('inessa_rpg_notas_sistemas') || '{}');
      if (notasSalvas[String(this.sistemaAtual.id)] !== undefined) {
        this.sistemaAtual.notaMedia = Number(notasSalvas[String(this.sistemaAtual.id)]);
      }
    } catch (e) {
      // Ignora erro de parse
    }

    this.renderizarCabecalhoSistema();
    this.renderizarEstatisticas();
    this.renderizarListaReviews();

    // Verifica se o sistema é "Dungeons & Dragons 5e" para exibir a seção da API pública (ID 24)
    if (this.ehSistemaDnd5e()) {
      $('#dnd5e-reference-section').show();
      await this.carregarDadosDnd5eApi(this.abaDndAtual);
    } else {
      $('#dnd5e-reference-section').hide();
    }
  },

  ehSistemaDnd5e() {
    if (!this.sistemaAtual || !this.sistemaAtual.nome) return false;
    const nomeLower = this.sistemaAtual.nome.toLowerCase();
    return nomeLower.includes('dungeons & dragons') || nomeLower.includes('d&d 5e');
  },

  /**
   * Preenche o Card de Identificação do Sistema (Ficha Técnica).
   */
  renderizarCabecalhoSistema() {
    const s = this.sistemaAtual;
    if (!s) return;

    document.title = `${s.nome} — Inessa RPG Reviews`;

    const extra = this.detalhesExtrasSistemas[s.nome] || {
      webp: '../img/dnd5e.webp',
      png: '../img/dnd5e.png',
      selo: 'Catálogo Oficial',
      autores: s.editora,
      mecanicaLabel: s.mecanica,
      tags: [
        { icone: 'category', texto: s.genero },
        { icone: 'casino', texto: s.mecanica },
      ],
    };

    $('#system-cover-webp').attr('srcset', extra.webp);
    $('#system-cover-img').attr('src', extra.png).attr('alt', `Capa de ${s.nome}`);
    $('#system-eyebrow-text').text(extra.selo);
    $('#system-title').text(s.nome);
    $('#system-authors').html(`Por <strong>${extra.autores}</strong>`);
    $('#system-publisher-pill').text(s.editora);
    $('#system-year-pill').text(s.ano);
    $('#system-mechanic-pill').text(extra.mecanicaLabel || s.mecanica);

    const $tagsContainer = $('#system-tags-container');
    $tagsContainer.empty();
    extra.tags.forEach((tag) => {
      $tagsContainer.append(`
        <span class="system-tag-chip">
          <i class="material-icons" aria-hidden="true">${tag.icone}</i>
          <span>${tag.texto}</span>
        </span>
      `);
    });
  },

  /**
   * Calcula e renderiza a nota média, perfil Mestres vs Jogadores e
   * barras horizontais de 5 a 1 estrelas a partir das avaliações APROVADAS.
   */
  renderizarEstatisticas() {
    const aprovadas = this.avaliacoesAprovadas;
    const total = aprovadas.length;

    // Nota média calculada a partir das avaliações aprovadas (ou usa a notaMedia do sistema se ainda não houver avaliações)
    const mediaCalculada =
      total > 0
        ? aprovadas.reduce((soma, av) => soma + Number(av.nota || 0), 0) / total
        : Number(this.sistemaAtual.notaMedia || 0);

    const mediaFormatada = mediaCalculada.toFixed(1);
    $('#stats-average-score').text(mediaFormatada);
    $('#stats-total-count').html(`${total} ${total === 1 ? 'aprovada' : 'aprovadas'}`);
    $('#stats-stars-icons').html(this.gerarEstrelasHtml(mediaCalculada));

    let classificacaoTexto = 'Sem avaliações suficientes';
    if (mediaCalculada >= 4.5) classificacaoTexto = 'Classificação Excelente';
    else if (mediaCalculada >= 3.8) classificacaoTexto = 'Muito Bem Avaliado';
    else if (mediaCalculada >= 3.0) classificacaoTexto = 'Avaliação Positiva';
    else if (total > 0) classificacaoTexto = 'Opiniões Mistas';
    $('#stats-rating-label').text(classificacaoTexto);

    // Proporção de Mestres vs Jogadores
    const qtdMestres = aprovadas.filter((av) => av.papel === 'MESTRE').length;
    const pctMestres = total > 0 ? Math.round((qtdMestres / total) * 100) : 35;
    const pctJogadores = total > 0 ? 100 - pctMestres : 65;

    $('#voter-gm-pct').text(`${pctMestres}%`);
    $('#voter-player-pct').text(`${pctJogadores}%`);
    $('#voter-bar-gm').css('width', `${pctMestres}%`);
    $('#voter-bar-player').css('width', `${pctJogadores}%`);

    // Barras de distribuição de 5 a 1 estrelas
    const $barsContainer = $('#star-distribution-bars');
    $barsContainer.empty();

    for (let estrela = 5; estrela >= 1; estrela -= 1) {
      const qtdEstrela = aprovadas.filter((av) => Number(av.nota) === estrela).length;
      const percentual = total > 0 ? Math.round((qtdEstrela / total) * 100) : 0;

      $barsContainer.append(`
        <div class="star-bars__row">
          <div class="star-bars__label">
            <span>${estrela}</span>
            <i class="material-icons" aria-hidden="true">star</i>
          </div>
          <div class="star-bars__track" role="progressbar" aria-valuenow="${percentual}" aria-valuemin="0" aria-valuemax="100">
            <div class="star-bars__fill" style="width: ${percentual}%;"></div>
          </div>
          <div class="star-bars__pct">${percentual}%</div>
        </div>
      `);
    }
  },

  /**
   * Formata datas ISO (YYYY-MM-DD) para formato amigável em português ("16 de Março de 2026").
   */
  formatarDataPtBr(dataIso) {
    if (!dataIso) return 'Data recente';
    const partes = dataIso.split('-');
    if (partes.length !== 3) return dataIso;
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const ano = partes[0];
    const mesIndice = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    return `${dia} de ${meses[mesIndice] || partes[1]} de ${ano}`;
  },

  gerarEstrelasHtml(nota) {
    const n = Number(nota) || 0;
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      if (n >= i - 0.2) html += '<i class="material-icons" aria-hidden="true">star</i>';
      else if (n >= i - 0.7) html += '<i class="material-icons" aria-hidden="true">star_half</i>';
      else html += '<i class="material-icons" aria-hidden="true">star_border</i>';
    }
    return html;
  },

  /**
   * Renderiza a lista de reviews APROVADAS aplicando o chip de filtro selecionado
   * (Mais recentes, Mais curtidas, Apenas Mestres ou Apenas Jogadores).
   */
  renderizarListaReviews() {
    const $container = $('#approved-reviews-list');
    $container.empty();

    let lista = [...this.avaliacoesAprovadas];

    if (this.filtroReviewAtual === 'MESTRES') {
      lista = lista.filter((av) => av.papel === 'MESTRE');
    } else if (this.filtroReviewAtual === 'JOGADORES') {
      lista = lista.filter((av) => av.papel === 'JOGADOR');
    } else if (this.filtroReviewAtual === 'CURTIDAS') {
      lista.sort((a, b) => Number(b.nota) - Number(a.nota));
    } else {
      // Mais recentes (ordena por data decrescente)
      lista.sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
    }

    if (lista.length === 0) {
      $container.html(`
        <div class="review-card" style="text-align: center; padding: 2rem 1rem;">
          <i class="material-icons" style="font-size: 2.25rem; color: var(--color-text-muted);">rate_review</i>
          <h3 style="margin-top: 0.5rem;">Nenhuma resenha aprovada neste filtro</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem; margin-bottom: 0;">
            Seja o primeiro a avaliar este sistema! Lembre-se: novas avaliações passam pela moderação antes de ficarem públicas.
          </p>
        </div>
      `);
      return;
    }

    lista.forEach((av, idx) => {
      const nomeAutor = this.usuariosMap[av.usuarioId] || `Aventureiro #${av.usuarioId}`;
      const inicial = nomeAutor.trim().charAt(0).toUpperCase();
      const ehMestre = av.papel === 'MESTRE';
      const badgeClasse = ehMestre ? 'review-card__role-badge--gm' : 'review-card__role-badge--player';
      const badgeIcone = ehMestre ? 'shield' : 'person';
      const badgeTexto = ehMestre ? 'MESTRE' : 'JOGADOR(A)';
      const curtidasBase = 24 + (idx + 1) * 19;
      const comentariosBase = 2 + (idx + 1) * 3;

      const cardHtml = `
        <article class="review-card">
          <div class="review-card__header">
            <div class="review-card__author">
              <div class="review-card__avatar" aria-hidden="true">${inicial}</div>
              <div>
                <h3 class="review-card__author-name">${nomeAutor}</h3>
                <span class="review-card__role-badge ${badgeClasse}">
                  <i class="material-icons" style="font-size: 0.75rem;">${badgeIcone}</i>
                  <span>${badgeTexto}</span>
                </span>
                <p class="review-card__date">${this.formatarDataPtBr(av.data)}</p>
              </div>
            </div>
            <div class="review-card__stars" aria-label="Nota ${av.nota} de 5">
              ${this.gerarEstrelasHtml(av.nota)}
            </div>
          </div>

          <p class="review-card__text">${av.texto || 'Avaliação registrada sem comentário em texto.'}</p>

          <div class="review-card__footer">
            <div class="review-card__actions">
              <button type="button" class="review-action-btn js-like-review" data-likes="${curtidasBase}">
                <i class="material-icons">favorite_border</i>
                <span class="js-like-count">${curtidasBase}</span>
              </button>
              <span class="review-action-btn" style="cursor: default;">
                <i class="material-icons">chat_bubble_outline</i>
                <span>${comentariosBase}</span>
              </span>
            </div>
            <button type="button" class="review-action-btn js-share-review" title="Copiar link da resenha">
              <i class="material-icons">share</i>
            </button>
          </div>
        </article>
      `;

      $container.append(cardHtml);
    });
  },

  /**
   * Consome a API pública oficial D&D 5e (https://www.dnd5eapi.co/api) (ID 24).
   * Exibe classes ou magias do SRD e trata erros de rede com mensagem amigável.
   */
  async carregarDadosDnd5eApi(recurso = 'classes') {
    const $loading = $('#dnd-api-loading');
    const $erro = $('#dnd-api-error');
    const $grid = $('#dnd-api-grid');
    const $detalhe = $('#dnd-api-detail-box');

    $erro.hide();
    $detalhe.hide();
    $grid.empty();
    $loading.show();

    try {
      const resposta = await fetch(`https://www.dnd5eapi.co/api/${recurso}`);
      if (!resposta.ok) {
        throw new Error(`Status HTTP ${resposta.status}`);
      }
      const dados = await resposta.json();
      const itens = (dados.results || []).slice(0, 12);

      $loading.hide();

      itens.forEach((item) => {
        const icone = recurso === 'classes' ? 'shield' : 'auto_fix_high';
        $grid.append(`
          <button
            type="button"
            class="dnd-ref-item js-dnd-item"
            data-url="https://www.dnd5eapi.co${item.url}"
            data-name="${item.name}"
          >
            <span>${item.name}</span>
            <i class="material-icons" style="font-size: 1rem; color: var(--color-primary);">${icone}</i>
          </button>
        `);
      });
    } catch (erro) {
      console.error('Erro ao consultar a D&D 5e API:', erro);
      $loading.hide();
      $erro.fadeIn(200);
    }
  },

  /**
   * Busca os detalhes de uma classe ou magia específica na D&D 5e API quando clicada.
   */
  async carregarDetalheItemDnd(url, nomeFallback) {
    const $detalhe = $('#dnd-api-detail-box');
    $detalhe.show().html('<p style="margin:0; font-size: 0.8125rem;">Consultando grimório SRD da D&D 5e API...</p>');

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error('Falha ao buscar detalhe do item');
      const item = await resposta.json();

      if (item.hit_die) {
        // É uma Classe de D&D 5e
        const proficiencias = (item.proficiencies || []).slice(0, 4).map((p) => p.name).join(', ');
        $detalhe.html(`
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong style="font-family: var(--font-heading); font-size: 1rem; color: var(--color-primary-deep);">
              Classe: ${item.name}
            </strong>
            <span class="meta-pill meta-pill--mechanic">Dado de Vida: d${item.hit_die}</span>
          </div>
          <p style="margin: 0.375rem 0 0 0; font-size: 0.8125rem; color: var(--color-text-secondary);">
            <strong>Proficiências iniciais:</strong> ${proficiencias || 'Consulte o Livro do Jogador'}.
          </p>
        `);
      } else {
        // É uma Magia (Spell) de D&D 5e
        const descricaoCurta = Array.isArray(item.desc) ? item.desc[0] : 'Magia oficial do SRD 5e.';
        $detalhe.html(`
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <strong style="font-family: var(--font-heading); font-size: 1rem; color: var(--color-primary-deep);">
              Magia: ${item.name}
            </strong>
            <span class="meta-pill meta-pill--mechanic">
              Círculo ${item.level ?? 0} • ${item.school ? item.school.name : 'Arcana'}
            </span>
          </div>
          <p style="margin: 0.375rem 0 0 0; font-size: 0.8125rem; color: var(--color-text-secondary);">
            <strong>Alcance:</strong> ${item.range || 'Variável'} | <strong>Tempo de Conjuração:</strong> ${item.casting_time || '1 ação'}<br>
            ${descricaoCurta}
          </p>
        `);
      }
    } catch (erro) {
      $detalhe.html(`
        <p style="margin: 0; font-size: 0.8125rem; color: var(--color-danger);">
          Não foi possível carregar os detalhes de <strong>${nomeFallback}</strong> no momento. Verifique sua conexão e tente novamente.
        </p>
      `);
    }
  },

  configurarEventos() {
    // Chips de filtro das reviews (Mais recentes, Mais curtidas, Apenas Mestres, Apenas Jogadores)
    $('#review-filter-chips').on('click', '.js-review-filter', (evento) => {
      const $chip = $(evento.currentTarget);
      $('#review-filter-chips .js-review-filter').removeClass('active');
      $chip.addClass('active');
      this.filtroReviewAtual = $chip.data('filter');
      this.renderizarListaReviews();
    });

    // Interação de curtir review com jQuery
    $('#approved-reviews-list').on('click', '.js-like-review', (evento) => {
      const $btn = $(evento.currentTarget);
      const $contador = $btn.find('.js-like-count');
      const $icone = $btn.find('i.material-icons');
      let likes = parseInt($contador.text(), 10) || 0;

      if ($btn.hasClass('liked')) {
        $btn.removeClass('liked');
        $icone.text('favorite_border');
        likes -= 1;
      } else {
        $btn.addClass('liked');
        $icone.text('favorite');
        likes += 1;
      }
      $contador.text(likes);
    });

    // Botão de compartilhar review
    $('#approved-reviews-list').on('click', '.js-share-review', () => {
      if (window.M && M.toast) {
        M.toast({ html: 'Link da avaliação copiado!', displayLength: 2500 });
      }
    });

    // Abas da seção D&D 5e API (Classes vs Magias)
    $('.js-dnd-tab').on('click', (evento) => {
      const $btn = $(evento.currentTarget);
      $('.js-dnd-tab').removeClass('active');
      $btn.addClass('active');
      this.abaDndAtual = $btn.data('endpoint');
      this.carregarDadosDnd5eApi(this.abaDndAtual);
    });

    // Clique em uma classe ou magia da D&D 5e API
    $('#dnd-api-grid').on('click', '.js-dnd-item', (evento) => {
      const $item = $(evento.currentTarget);
      this.carregarDetalheItemDnd($item.data('url'), $item.data('name'));
    });

    // Botão de tentar novamente caso a D&D 5e API falhe
    $('#btn-retry-dnd-api').on('click', () => {
      this.carregarDadosDnd5eApi(this.abaDndAtual);
    });
  },
};

$(document).ready(() => {
  PaginaSistema.init();
});

window.PaginaSistema = PaginaSistema;
