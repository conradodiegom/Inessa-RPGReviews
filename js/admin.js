/**
 * js/admin.js — Etapa 7B: Painel do Administrador (Moderação)
 *
 * Responsabilidades:
 * 1. Proteger o acesso ao painel verificando se o usuário logado possui
 *    `tipo === "ADMIN"` via `Auth.obterUsuarioLogado()` / `Auth.ehAdmin()` (RN02).
 * 2. Carregar sistemas, usuários, avaliações e sugestões da API Fake (JSON Server)
 *    com fallback resiliente caso o servidor esteja offline.
 * 3. Exibir métricas em tempo real e alternar entre as abas:
 *    - "Reviews pendentes" (US06)
 *    - "Sugestões" (US07)
 *    - "Cadastrar Sistema" (US08)
 * 4. Aprovar ou rejeitar avaliações via `PATCH /avaliacoes/:id` e recalcular
 *    automaticamente a `notaMedia` do sistema correspondente via `PATCH /sistemas/:id`
 *    considerando apenas avaliações com `statusModeracao === "APROVADA"` (RN01).
 * 5. Aprovar ou rejeitar sugestões via `PATCH /sugestoes/:id` e, ao aprovar,
 *    publicar automaticamente o sistema no catálogo via `POST /sistemas` (US07/US08).
 *
 * Indicadores cobertos:
 * - ID 04: Componentes interativos e toasts do MaterializeCSS
 * - ID 14: Controle de sessão administrativa via localStorage
 * - ID 20: Manipulação do DOM, abas e eventos delegados com jQuery
 * - ID 22 e ID 23: Requisições GET, POST e PATCH no JSON Server via fetch
 */

(function ($) {
  'use strict';

  const STORAGE_KEY_AVALIACOES_LOCAIS = 'inessa_rpg_avaliacoes_locais';
  const STORAGE_KEY_SUGESTOES_LOCAIS = 'inessa_rpg_sugestoes_locais';
  const STORAGE_KEY_SISTEMAS_LOCAIS = 'inessa_rpg_sistemas_locais';
  const STORAGE_KEY_NOTAS_SISTEMAS = 'inessa_rpg_notas_sistemas';

  const CAPAS_POR_NOME = {
    'Ordem Paranormal': { webp: '../img/ordem-paranormal.webp', png: '../img/ordem-paranormal.png' },
    'Tormenta20': { webp: '../img/tormenta20.webp', png: '../img/tormenta20.png' },
    'Call of Cthulhu 7e': { webp: '../img/monster-week.webp', png: '../img/monster-week.png' },
    'Dungeons & Dragons 5e': { webp: '../img/dnd5e.webp', png: '../img/dnd5e.png' },
    'Vampiro: A Máscara 5ª': { webp: '../img/vampiro5e.webp', png: '../img/vampiro5e.png' },
    'Blades in the Dark': { webp: '../img/blades.webp', png: '../img/blades.png' },
    'Pathfinder 2e': { webp: '../img/pathfinder2e.webp', png: '../img/pathfinder2e.png' },
    'Monster of the Week': { webp: '../img/monster-week.webp', png: '../img/monster-week.png' },
    'Cyberpunk RED': { webp: '../img/cyberpunk-red.webp', png: '../img/cyberpunk-red.png' },
  };

  const FALLBACK_SISTEMAS = [
    { id: '1', nome: 'Ordem Paranormal', editora: 'Jambô Editora', ano: 2022, genero: 'Terror', mecanica: 'd20', notaMedia: 4.7 },
    { id: '2', nome: 'Tormenta20', editora: 'Jambô Editora', ano: 2020, genero: 'Fantasia', mecanica: 'd20', notaMedia: 4.8 },
    { id: '3', nome: 'Call of Cthulhu 7e', editora: 'Chaosium / New Order', ano: 2014, genero: 'Terror', mecanica: 'd100', notaMedia: 4.6 },
    { id: '4', nome: 'Dungeons & Dragons 5e', editora: 'Wizards of the Coast', ano: 2014, genero: 'Fantasia Heroica', mecanica: 'd20', notaMedia: 4.5 },
    { id: '5', nome: 'Vampiro: A Máscara 5ª', editora: 'Galápagos Jogos', ano: 2018, genero: 'Horror Pessoal', mecanica: 'Dice Pool', notaMedia: 4.4 },
    { id: '6', nome: 'Blades in the Dark', editora: 'Buró Brasil', ano: 2017, genero: 'Fantasia Urbana', mecanica: 'PbtA', notaMedia: 4.7 },
    { id: '7', nome: 'Pathfinder 2e', editora: 'New Order Editora', ano: 2019, genero: 'Alta Fantasia', mecanica: 'd20', notaMedia: 4.6 },
    { id: '8', nome: 'Monster of the Week', editora: 'Retropunk', ano: 2015, genero: 'Investigação', mecanica: 'PbtA', notaMedia: 4.3 },
    { id: '9', nome: 'Cyberpunk RED', editora: 'Devir', ano: 2020, genero: 'Cyberpunk', mecanica: 'Narrativo', notaMedia: 4.2 },
  ];

  const FALLBACK_USUARIOS = [
    { id: '1', nome: 'Ana Mestra', email: 'ana@email.com', tipo: 'USUARIO' },
    { id: '2', nome: 'Admin Poço Penumbra', email: 'admin@inessarpgreviews.com', tipo: 'ADMIN' },
    { id: '3', nome: 'Lucas Valente', email: 'lucas@email.com', tipo: 'USUARIO' },
  ];

  const FALLBACK_AVALIACOES = [
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
      id: '2',
      usuarioId: '3',
      sistemaId: '1',
      nota: 4,
      texto: 'Muito divertido criar agentes da Ordo Realitas. Em níveis altos o combate fica bem letal.',
      papel: 'JOGADOR',
      statusConsumo: 'JOGANDO',
      statusModeracao: 'APROVADA',
      data: '2026-03-18',
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
      id: '4',
      usuarioId: '3',
      sistemaId: '4',
      nota: 5,
      texto: 'Porta de entrada clássica para o RPG de fantasia medieval. Fácil de ensinar para iniciantes e cheio de material de referência.',
      papel: 'MESTRE',
      statusConsumo: 'JOGOU',
      statusModeracao: 'APROVADA',
      data: '2026-03-22',
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
    {
      id: '6',
      usuarioId: '3',
      sistemaId: '1',
      nota: 5,
      texto: 'Joguei uma campanha de seis meses em Carpazinha e foi inesquecível! Aguardando aprovação da moderação.',
      papel: 'JOGADOR',
      statusConsumo: 'JOGOU',
      statusModeracao: 'PENDENTE',
      data: '2026-04-01',
    },
  ];

  const FALLBACK_SUGESTOES = [
    {
      id: '1',
      usuarioId: '1',
      nomeSistema: 'Skyfall RPG',
      editora: 'Capitur / Mestre Pedrok',
      genero: 'Fantasia',
      ano: 2024,
      mecanica: 'd20',
      statusSugestao: 'PENDENTE',
      data: '2026-03-16',
    },
  ];

  const state = {
    sistemas: [],
    usuarios: [],
    avaliacoes: [],
    sugestoes: [],
    abaAtiva: 'REVIEWS',
    filtroStatusReviews: 'PENDENTE',
    filtroStatusSugestoes: 'PENDENTE',
  };

  /**
   * Escapa caracteres especiais HTML para evitar XSS ao renderizar textos.
   */
  function escaparHtml(texto) {
    return String(texto || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Formata datas ISO YYYY-MM-DD para o padrão brasileiro DD/MM/AAAA.
   */
  function formatarDataBr(dataIso) {
    if (!dataIso) return 'Recente';
    const partes = String(dataIso).split('-');
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  /**
   * Obtém a capa do sistema pelo nome (com fallback para D&D 5e).
   */
  function obterCapaSistema(sistema) {
    if (sistema && sistema.nome && CAPAS_POR_NOME[sistema.nome]) {
      return CAPAS_POR_NOME[sistema.nome];
    }
    return {
      webp: '../img/dnd5e.webp',
      png: '../img/dnd5e.png',
    };
  }

  /**
   * Gera as 5 estrelas visuais da nota (1 a 5).
   */
  function renderizarEstrelas(nota) {
    const notaInt = Math.max(1, Math.min(5, Math.round(Number(nota) || 5)));
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      const cor = i <= notaInt ? 'var(--color-accent)' : 'rgba(22, 19, 17, 0.18)';
      html += `<i class="material-icons" style="font-size: 1rem; color: ${cor};" aria-hidden="true">star</i>`;
    }
    return html;
  }

  /**
   * Mescla itens vindos da API com itens salvos localmente no localStorage.
   */
  function mesclarComLocalStorage(listaApi, storageKey) {
    let locais = [];
    try {
      const bruto = localStorage.getItem(storageKey);
      locais = bruto ? JSON.parse(bruto) : [];
    } catch (erro) {
      locais = [];
    }

    const mapa = new Map();
    (Array.isArray(listaApi) ? listaApi : []).forEach((item) => {
      mapa.set(String(item.id), item);
    });
    (Array.isArray(locais) ? locais : []).forEach((item) => {
      if (!mapa.has(String(item.id))) {
        mapa.set(String(item.id), item);
      } else {
        mapa.set(String(item.id), { ...mapa.get(String(item.id)), ...item });
      }
    });

    return Array.from(mapa.values());
  }

  /**
   * Atualiza um item também no cache local do localStorage caso exista.
   */
  function atualizarItemNoLocalStorage(storageKey, id, novosCampos) {
    try {
      const bruto = localStorage.getItem(storageKey);
      if (!bruto) return;
      const lista = JSON.parse(bruto);
      if (!Array.isArray(lista)) return;
      const atualizada = lista.map((item) =>
        String(item.id) === String(id) ? { ...item, ...novosCampos } : item
      );
      localStorage.setItem(storageKey, JSON.stringify(atualizada));
    } catch (erro) {
      // Ignora erro de storage
    }
  }

  /**
   * Verifica se o usuário atual possui permissão de Administrador (RN02).
   * Usa Auth.obterUsuarioLogado() definido em js/auth.js.
   */
  function verificarPermissaoAdmin() {
    const usuario =
      window.Auth && typeof window.Auth.obterUsuarioLogado === 'function'
        ? window.Auth.obterUsuarioLogado()
        : null;

    const ehAdmin = Boolean(usuario && usuario.tipo === 'ADMIN');

    if (!ehAdmin) {
      $('#admin-dashboard-content').hide();
      $('#admin-access-denied').fadeIn(200);
      return false;
    }

    $('#admin-access-denied').hide();
    $('#admin-dashboard-content').css('display', 'flex');
    $('#admin-active-name').text(`Admin: ${usuario.nome}`);
    return true;
  }

  /**
   * Salva um novo sistema no cache local do localStorage para garantir que apareça
   * no Catálogo mesmo caso o JSON Server seja reiniciado ou esteja offline.
   */
  function salvarSistemaNoLocalStorage(sistema) {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY_SISTEMAS_LOCAIS);
      const lista = bruto ? JSON.parse(bruto) : [];
      const semDuplicata = (Array.isArray(lista) ? lista : []).filter(
        (s) =>
          String(s.id) !== String(sistema.id) &&
          String(s.nome || '').trim().toLowerCase() !== String(sistema.nome || '').trim().toLowerCase()
      );
      semDuplicata.push(sistema);
      localStorage.setItem(STORAGE_KEY_SISTEMAS_LOCAIS, JSON.stringify(semDuplicata));
    } catch (erro) {
      // Ignora erro de storage
    }
  }

  /**
   * Salva a notaMedia recalculada de um sistema no localStorage.
   */
  function salvarNotaSistemaNoLocalStorage(sistemaId, novaMedia) {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY_NOTAS_SISTEMAS);
      const mapaNotas = bruto ? JSON.parse(bruto) : {};
      mapaNotas[String(sistemaId)] = novaMedia;
      localStorage.setItem(STORAGE_KEY_NOTAS_SISTEMAS, JSON.stringify(mapaNotas));
      atualizarItemNoLocalStorage(STORAGE_KEY_SISTEMAS_LOCAIS, sistemaId, { notaMedia: novaMedia });
    } catch (erro) {
      // Ignora erro de storage
    }
  }

  /**
   * Carrega todos os dados necessários para o painel de moderação.
   */
  async function carregarDadosPainel() {
    const [resSistemas, resUsuarios, resAvaliacoes, resSugestoes] = await Promise.allSettled([
      window.Api.listarSistemas(),
      window.Api.listarUsuarios(),
      window.Api.listarAvaliacoes(),
      window.Api.listarSugestoes(),
    ]);

    const sistemasBase =
      resSistemas.status === 'fulfilled' && Array.isArray(resSistemas.value) && resSistemas.value.length > 0
        ? resSistemas.value
        : [...FALLBACK_SISTEMAS];

    state.sistemas = mesclarComLocalStorage(sistemasBase, STORAGE_KEY_SISTEMAS_LOCAIS);

    try {
      const notasSalvas = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTAS_SISTEMAS) || '{}');
      state.sistemas.forEach((sis) => {
        if (notasSalvas[String(sis.id)] !== undefined) {
          sis.notaMedia = Number(notasSalvas[String(sis.id)]);
        }
      });
    } catch (e) {
      // Ignora erro de parse
    }

    state.usuarios =
      resUsuarios.status === 'fulfilled' && Array.isArray(resUsuarios.value) && resUsuarios.value.length > 0
        ? resUsuarios.value
        : [...FALLBACK_USUARIOS];

    const avaliacoesBase =
      resAvaliacoes.status === 'fulfilled' && Array.isArray(resAvaliacoes.value) && resAvaliacoes.value.length > 0
        ? resAvaliacoes.value
        : [...FALLBACK_AVALIACOES];

    const sugestoesBase =
      resSugestoes.status === 'fulfilled' && Array.isArray(resSugestoes.value) && resSugestoes.value.length > 0
        ? resSugestoes.value
        : [...FALLBACK_SUGESTOES];

    state.avaliacoes = mesclarComLocalStorage(avaliacoesBase, STORAGE_KEY_AVALIACOES_LOCAIS);
    state.sugestoes = mesclarComLocalStorage(sugestoesBase, STORAGE_KEY_SUGESTOES_LOCAIS);

    atualizarMetricasEContadores();
    renderizarFilaAvaliacoes();
    renderizarFilaSugestoes();
  }

  /**
   * Atualiza os 4 cards superiores de métricas e os contadores das abas.
   */
  function atualizarMetricasEContadores() {
    const totalReviewsPendentes = state.avaliacoes.filter(
      (a) => a.statusModeracao === 'PENDENTE'
    ).length;

    const totalReviewsAprovadas = state.avaliacoes.filter(
      (a) => a.statusModeracao === 'APROVADA'
    ).length;

    const totalSugestoesPendentes = state.sugestoes.filter(
      (s) => s.statusSugestao === 'PENDENTE'
    ).length;

    $('#metric-pending-reviews').text(totalReviewsPendentes);
    $('#metric-pending-suggestions').text(totalSugestoesPendentes);
    $('#metric-total-systems').text(state.sistemas.length);
    $('#metric-approved-reviews').text(totalReviewsAprovadas);

    $('#tab-count-reviews').text(totalReviewsPendentes);
    $('#tab-count-sugestoes').text(totalSugestoesPendentes);
  }

  /**
   * Renderiza a lista de avaliações de acordo com o chip de status selecionado.
   */
  function renderizarFilaAvaliacoes() {
    const $container = $('#admin-reviews-list');
    $container.empty();

    const listaFiltrada = state.avaliacoes.filter((av) => {
      if (state.filtroStatusReviews === 'TODAS') return true;
      return av.statusModeracao === state.filtroStatusReviews;
    });

    if (listaFiltrada.length === 0) {
      $container.html(`
        <div class="profile-empty-state">
          <div class="profile-empty-state__icon">
            <i class="material-icons" aria-hidden="true">fact_check</i>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Nenhuma avaliação encontrada neste filtro</h3>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0;">
            A fila de curadoria para o status <strong>${escaparHtml(state.filtroStatusReviews)}</strong> está limpa!
          </p>
        </div>
      `);
      return;
    }

    const htmlCards = listaFiltrada
      .map((av) => {
        const sistema = state.sistemas.find((s) => String(s.id) === String(av.sistemaId)) || {
          id: av.sistemaId,
          nome: `Sistema #${av.sistemaId}`,
          editora: 'Editora RPG',
          notaMedia: 0,
        };
        const autor = state.usuarios.find((u) => String(u.id) === String(av.usuarioId)) || {
          nome: av.autorNome || `Aventureiro #${av.usuarioId}`,
          email: 'membro@guilda.com',
        };

        const capa = obterCapaSistema(sistema);
        const papelLabel = av.papel === 'MESTRE' ? 'Mestre (GM)' : 'Jogador';
        const statusMod = av.statusModeracao || 'PENDENTE';

        let pillClass = 'admin-mod-card__status-pill--pending';
        let pillLabel = 'PENDENTE DE MODERAÇÃO';
        if (statusMod === 'APROVADA') {
          pillClass = 'admin-mod-card__status-pill--approved';
          pillLabel = 'APROVADA PUBLICAMENTE';
        } else if (statusMod === 'REJEITADA') {
          pillClass = 'admin-mod-card__status-pill--rejected';
          pillLabel = 'REJEITADA PELA CURADORIA';
        }

        const spoilerTag = av.contemSpoiler
          ? `<span class="inessa-badge" style="background: var(--color-danger-bg); color: var(--color-danger);">Contém Spoiler</span>`
          : '';

        return `
          <article class="admin-mod-card" data-review-id="${escaparHtml(av.id)}">
            <div class="admin-mod-card__header">
              <div class="admin-mod-card__meta">
                <span class="admin-mod-card__status-pill ${pillClass}">
                  <i class="material-icons" style="font-size: 0.9rem;" aria-hidden="true">shield</i>
                  <span>${pillLabel}</span>
                </span>
                <span style="font-size: 0.8125rem; color: var(--color-text-secondary);">
                  Enviada por <strong>${escaparHtml(autor.nome)}</strong> em ${formatarDataBr(av.data)}
                </span>
                ${spoilerTag}
              </div>

              <div style="display: inline-flex; align-items: center; gap: 0.25rem;" title="Nota atribuída: ${escaparHtml(av.nota)} de 5">
                ${renderizarEstrelas(av.nota)}
                <strong style="margin-left: 0.35rem; font-size: 0.9rem;">${Number(av.nota).toFixed(1)}</strong>
              </div>
            </div>

            <div class="admin-mod-card__body">
              <picture>
                <source srcset="${capa.webp}" type="image/webp">
                <img
                  src="${capa.png}"
                  alt="Capa de ${escaparHtml(sistema.nome)}"
                  class="admin-mod-card__cover"
                  loading="lazy"
                >
              </picture>

              <div class="admin-mod-card__content">
                <h3 class="admin-mod-card__sys-title">
                  <a href="sistema.html?id=${encodeURIComponent(sistema.id)}" style="color: inherit;">
                    ${escaparHtml(sistema.nome)}
                  </a>
                </h3>
                <p class="admin-mod-card__tags">
                  Papel: <strong>${papelLabel}</strong> • Status de consumo: <strong>${escaparHtml(av.statusConsumo || 'JOGOU')}</strong> • Nota Média Atual do Sistema: <strong class="js-sys-avg-label" data-sys-id="${escaparHtml(sistema.id)}">${Number(sistema.notaMedia || 0).toFixed(1)}</strong>
                </p>
                <blockquote class="admin-mod-card__quote">
                  "${escaparHtml(av.texto)}"
                </blockquote>
              </div>
            </div>

            <div class="admin-mod-card__footer">
              <span class="admin-mod-card__impact-note">
                <i class="material-icons" style="font-size: 0.95rem; vertical-align: middle; color: var(--color-primary);" aria-hidden="true">calculate</i>
                Aprovar ou rejeitar recalcula automaticamente a <code>notaMedia</code> de <strong>${escaparHtml(sistema.nome)}</strong>.
              </span>

              <div class="admin-mod-card__actions">
                <button
                  type="button"
                  class="btn-admin-reject js-btn-reject-review"
                  data-id="${escaparHtml(av.id)}"
                  ${statusMod === 'REJEITADA' ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
                >
                  <i class="material-icons" style="font-size: 1rem;" aria-hidden="true">close</i>
                  <span>Rejeitar</span>
                </button>
                <button
                  type="button"
                  class="btn-admin-approve js-btn-approve-review"
                  data-id="${escaparHtml(av.id)}"
                  ${statusMod === 'APROVADA' ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
                >
                  <i class="material-icons" style="font-size: 1rem;" aria-hidden="true">check</i>
                  <span>Aprovar Review</span>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    $container.html(htmlCards);
  }

  /**
   * Recalcula a notaMedia de um sistema considerando SOMENTE avaliações com
   * statusModeracao === "APROVADA" (RN01) e persiste via PATCH /sistemas/:id.
   */
  async function recalcularEPersistirNotaMedia(sistemaId) {
    const avaliacoesAprovadasDoSistema = state.avaliacoes.filter(
      (av) =>
        String(av.sistemaId) === String(sistemaId) &&
        av.statusModeracao === 'APROVADA'
    );

    let novaMedia = 0;
    if (avaliacoesAprovadasDoSistema.length > 0) {
      const soma = avaliacoesAprovadasDoSistema.reduce(
        (acc, item) => acc + Number(item.nota || 0),
        0
      );
      novaMedia = Number((soma / avaliacoesAprovadasDoSistema.length).toFixed(1));
    }

    const idx = state.sistemas.findIndex((s) => String(s.id) === String(sistemaId));
    if (idx !== -1) {
      state.sistemas[idx].notaMedia = novaMedia;
    }

    salvarNotaSistemaNoLocalStorage(sistemaId, novaMedia);

    try {
      await window.Api.atualizarSistema(sistemaId, { notaMedia: novaMedia });
    } catch (erroApi) {
      console.warn('JSON Server offline ao atualizar notaMedia; atualizado em memória:', erroApi.message);
    }

    return novaMedia;
  }

  /**
   * Modera uma avaliação (APROVADA ou REJEITADA) e recalcula a nota média do sistema.
   */
  async function moderarAvaliacao(idAvaliacao, novoStatus) {
    const avaliacao = state.avaliacoes.find((a) => String(a.id) === String(idAvaliacao));
    if (!avaliacao) return;

    avaliacao.statusModeracao = novoStatus;
    atualizarItemNoLocalStorage(STORAGE_KEY_AVALIACOES_LOCAIS, idAvaliacao, {
      statusModeracao: novoStatus,
    });

    try {
      await window.Api.moderarAvaliacao(idAvaliacao, novoStatus);
    } catch (erroApi) {
      console.warn('JSON Server offline ao moderar avaliação; salvo localmente:', erroApi.message);
    }

    const novaMedia = await recalcularEPersistirNotaMedia(avaliacao.sistemaId);
    const sistema = state.sistemas.find((s) => String(s.id) === String(avaliacao.sistemaId));
    const nomeSistema = sistema ? sistema.nome : `Sistema #${avaliacao.sistemaId}`;

    atualizarMetricasEContadores();
    renderizarFilaAvaliacoes();

    if (window.M && M.toast) {
      const verbo = novoStatus === 'APROVADA' ? 'aprovada' : 'rejeitada';
      M.toast({
        html: `<span>Review <strong>${verbo}</strong>! Nova média de <strong>${escaparHtml(nomeSistema)}</strong>: <strong>${novaMedia.toFixed(1)} ★</strong></span>`,
        classes: 'rounded',
        displayLength: 4000,
      });
    }
  }

  /**
   * Renderiza a fila de sugestões de sistemas enviados pelos usuários (US07).
   */
  function renderizarFilaSugestoes() {
    const $container = $('#admin-sugestoes-list');
    $container.empty();

    const listaFiltrada = state.sugestoes.filter((sug) => {
      if (state.filtroStatusSugestoes === 'TODAS') return true;
      return (sug.statusSugestao || 'PENDENTE') === state.filtroStatusSugestoes;
    });

    if (listaFiltrada.length === 0) {
      $container.html(`
        <div class="profile-empty-state">
          <div class="profile-empty-state__icon">
            <i class="material-icons" aria-hidden="true">auto_stories</i>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Nenhuma sugestão encontrada neste filtro</h3>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0;">
            Não há sugestões com status <strong>${escaparHtml(state.filtroStatusSugestoes)}</strong> no momento.
          </p>
        </div>
      `);
      return;
    }

    const htmlCards = listaFiltrada
      .map((sug) => {
        const autor = state.usuarios.find((u) => String(u.id) === String(sug.usuarioId)) || {
          nome: `Aventureiro #${sug.usuarioId || '1'}`,
        };
        const statusSug = sug.statusSugestao || 'PENDENTE';

        let pillClass = 'admin-mod-card__status-pill--pending';
        let pillLabel = 'SUGESTÃO PENDENTE';
        if (statusSug === 'APROVADA') {
          pillClass = 'admin-mod-card__status-pill--approved';
          pillLabel = 'APROVADA & CATALOGADA';
        } else if (statusSug === 'REJEITADA') {
          pillClass = 'admin-mod-card__status-pill--rejected';
          pillLabel = 'SUGESTÃO ARQUIVADA';
        }

        return `
          <article class="admin-mod-card" data-sugestao-id="${escaparHtml(sug.id)}">
            <div class="admin-mod-card__header">
              <div class="admin-mod-card__meta">
                <span class="admin-mod-card__status-pill ${pillClass}">
                  <i class="material-icons" style="font-size: 0.9rem;" aria-hidden="true">library_books</i>
                  <span>${pillLabel}</span>
                </span>
                <span style="font-size: 0.8125rem; color: var(--color-text-secondary);">
                  Sugerido por <strong>${escaparHtml(autor.nome)}</strong> em ${formatarDataBr(sug.data)}
                </span>
              </div>

              <span class="inessa-badge">${escaparHtml(sug.genero || 'Fantasia')}</span>
            </div>

            <div class="admin-mod-card__content">
              <h3 class="admin-mod-card__sys-title">${escaparHtml(sug.nomeSistema)}</h3>
              <p class="admin-mod-card__tags">
                Editora: <strong>${escaparHtml(sug.editora)}</strong> • Ano: <strong>${escaparHtml(sug.ano || 2024)}</strong> • Mecânica principal: <strong>${escaparHtml(sug.mecanica || 'd20')}</strong>
              </p>
              ${
                sug.justificativa
                  ? `<blockquote class="admin-mod-card__quote">"${escaparHtml(sug.justificativa)}"</blockquote>`
                  : ''
              }
            </div>

            <div class="admin-mod-card__footer">
              <span class="admin-mod-card__impact-note">
                <i class="material-icons" style="font-size: 0.95rem; vertical-align: middle; color: var(--color-teal);" aria-hidden="true">published_with_changes</i>
                Aprovar adiciona automaticamente <strong>${escaparHtml(sug.nomeSistema)}</strong> ao catálogo oficial (<code>POST /sistemas</code>).
              </span>

              <div class="admin-mod-card__actions">
                <button
                  type="button"
                  class="btn-admin-reject js-btn-reject-sugestao"
                  data-id="${escaparHtml(sug.id)}"
                  ${statusSug === 'REJEITADA' ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
                >
                  <i class="material-icons" style="font-size: 1rem;" aria-hidden="true">close</i>
                  <span>Rejeitar</span>
                </button>
                <button
                  type="button"
                  class="btn-admin-approve js-btn-approve-sugestao"
                  data-id="${escaparHtml(sug.id)}"
                  ${statusSug === 'APROVADA' ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
                >
                  <i class="material-icons" style="font-size: 1rem;" aria-hidden="true">check</i>
                  <span>Aprovar &amp; Publicar</span>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    $container.html(htmlCards);
  }

  /**
   * Modera uma sugestão de sistema (US07). Se aprovada, publica no catálogo (US08).
   */
  async function moderarSugestao(idSugestao, novoStatus) {
    const sugestao = state.sugestoes.find((s) => String(s.id) === String(idSugestao));
    if (!sugestao) return;

    sugestao.statusSugestao = novoStatus;
    atualizarItemNoLocalStorage(STORAGE_KEY_SUGESTOES_LOCAIS, idSugestao, {
      statusSugestao: novoStatus,
    });

    try {
      await window.Api.moderarSugestao(idSugestao, novoStatus);
    } catch (erroApi) {
      console.warn('JSON Server offline ao moderar sugestão; atualizado localmente:', erroApi.message);
    }

    if (novoStatus === 'APROVADA') {
      const jaExiste = state.sistemas.some(
        (s) => s.nome.trim().toLowerCase() === String(sugestao.nomeSistema || '').trim().toLowerCase()
      );

      if (!jaExiste) {
        const novoSistemaPayload = {
          nome: String(sugestao.nomeSistema || '').trim(),
          editora: String(sugestao.editora || 'Editora Independente').trim(),
          ano: Number(sugestao.ano) || 2024,
          genero: sugestao.genero || 'Fantasia',
          mecanica: sugestao.mecanica || 'd20',
          notaMedia: 0,
        };

        let sistemaRegistrado = null;
        try {
          sistemaRegistrado = await window.Api.criarSistema(novoSistemaPayload);
        } catch (erroPost) {
          sistemaRegistrado = {
            id: String(Date.now()),
            ...novoSistemaPayload,
          };
        }
        state.sistemas.push(sistemaRegistrado);
        salvarSistemaNoLocalStorage(sistemaRegistrado);
      }
    }

    atualizarMetricasEContadores();
    renderizarFilaSugestoes();

    if (window.M && M.toast) {
      const msg =
        novoStatus === 'APROVADA'
          ? `<span>Sugestão aprovada! <strong>${escaparHtml(sugestao.nomeSistema)}</strong> foi publicado no <a href="../index.html#todos-sistemas" style="color: #feb300; font-weight: 700; text-decoration: underline;">Catálogo</a>!</span>`
          : `<span>Sugestão <strong>${escaparHtml(sugestao.nomeSistema)}</strong> arquivada.</span>`;
      M.toast({
        html: msg,
        classes: 'rounded',
        displayLength: 4500,
      });
    }
  }

  /**
   * Configura todos os eventos de clique e submissão da página de administração.
   */
  function configurarEventos() {
    // Botão de login rápido como Admin para facilitar avaliação/teste da banca (RN02)
    $('#btn-quick-admin-login').on('click', function () {
      const contaAdmin = {
        id: '2',
        nome: 'Admin Poço Penumbra',
        email: 'admin@inessarpgreviews.com',
        tipo: 'ADMIN',
      };
      if (window.Auth && typeof window.Auth.salvarSessao === 'function') {
        window.Auth.salvarSessao(contaAdmin);
        if (typeof window.Auth.atualizarInterfaceSessao === 'function') {
          window.Auth.atualizarInterfaceSessao();
        }
      } else {
        localStorage.setItem('inessa_usuario_logado', JSON.stringify(contaAdmin));
      }

      if (verificarPermissaoAdmin()) {
        carregarDadosPainel();
      }

      if (window.M && M.toast) {
        M.toast({
          html: '<span>Sessão iniciada como <strong>Admin Poço Penumbra</strong>!</span>',
          classes: 'rounded',
        });
      }
    });

    // Botão Atualizar Fila
    $('#btn-refresh-admin').on('click', function () {
      carregarDadosPainel();
      if (window.M && M.toast) {
        M.toast({
          html: '<span>Fila de moderação sincronizada com o servidor!</span>',
          classes: 'rounded',
        });
      }
    });

    // Alternância de Abas (Reviews pendentes | Sugestões | Cadastrar Sistema)
    $('.js-admin-tab').on('click', function () {
      const $btn = $(this);
      const aba = $btn.data('tab');
      state.abaAtiva = aba;

      $('.js-admin-tab').removeClass('active').attr('aria-selected', 'false');
      $btn.addClass('active').attr('aria-selected', 'true');

      $('#admin-view-reviews, #admin-view-sugestoes, #admin-view-cadastrar').hide();
      if (aba === 'REVIEWS') {
        $('#admin-view-reviews').fadeIn(180);
      } else if (aba === 'SUGESTOES') {
        $('#admin-view-sugestoes').fadeIn(180);
      } else if (aba === 'CADASTRAR') {
        $('#admin-view-cadastrar').fadeIn(180);
      }
    });

    // Chips de filtro de status das Avaliações
    $(document).on('click', '.js-admin-review-filter', function () {
      const $chip = $(this);
      state.filtroStatusReviews = $chip.data('status');
      $('.js-admin-review-filter').removeClass('active');
      $chip.addClass('active');
      renderizarFilaAvaliacoes();
    });

    // Chips de filtro de status das Sugestões
    $(document).on('click', '.js-admin-sugestao-filter', function () {
      const $chip = $(this);
      state.filtroStatusSugestoes = $chip.data('status');
      $('.js-admin-sugestao-filter').removeClass('active');
      $chip.addClass('active');
      renderizarFilaSugestoes();
    });

    // Aprovar ou Rejeitar Review (delegação jQuery)
    $(document).on('click', '.js-btn-approve-review', function () {
      const id = $(this).data('id');
      moderarAvaliacao(id, 'APROVADA');
    });

    $(document).on('click', '.js-btn-reject-review', function () {
      const id = $(this).data('id');
      moderarAvaliacao(id, 'REJEITADA');
    });

    // Aprovar ou Rejeitar Sugestão (delegação jQuery)
    $(document).on('click', '.js-btn-approve-sugestao', function () {
      const id = $(this).data('id');
      moderarSugestao(id, 'APROVADA');
    });

    $(document).on('click', '.js-btn-reject-sugestao', function () {
      const id = $(this).data('id');
      moderarSugestao(id, 'REJEITADA');
    });

    // Formulário de cadastro manual de novo sistema pelo Admin (US08)
    $('#form-admin-novo-sistema').on('submit', async function (evento) {
      evento.preventDefault();

      const nome = ($('#admin-sys-nome').val() || '').trim();
      const editora = ($('#admin-sys-editora').val() || '').trim();
      const genero = $('#admin-sys-genero').val() || 'Fantasia';
      const mecanica = $('#admin-sys-mecanica').val() || 'd20';
      const ano = Number($('#admin-sys-ano').val()) || 2024;

      if (nome.length < 2 || editora.length < 2) {
        if (window.M && M.toast) {
          M.toast({
            html: '<span>Preencha o nome do sistema e a editora corretamente.</span>',
            classes: 'rounded',
          });
        }
        return;
      }

      const payload = {
        nome,
        editora,
        ano,
        genero,
        mecanica,
        notaMedia: 0,
      };

      let sistemaCriado = null;
      try {
        sistemaCriado = await window.Api.criarSistema(payload);
      } catch (erroApi) {
        sistemaCriado = {
          id: String(Date.now()),
          ...payload,
        };
      }

      state.sistemas.push(sistemaCriado);
      salvarSistemaNoLocalStorage(sistemaCriado);

      atualizarMetricasEContadores();
      this.reset();
      $('#admin-sys-ano').val('2024');

      if (window.M && M.toast) {
        M.toast({
          html: `<span>Sistema <strong>${escaparHtml(nome)}</strong> publicado! <a href="../index.html#todos-sistemas" style="color: #feb300; font-weight: 700; text-decoration: underline; margin-left: 0.35rem;">Ver no Catálogo →</a></span>`,
          classes: 'rounded',
          displayLength: 4500,
        });
      }
    });
  }

  /**
   * Inicialização do módulo quando o DOM estiver pronto.
   */
  $(function () {
    configurarEventos();
    if (verificarPermissaoAdmin()) {
      carregarDadosPainel();
    }
  });
})(jQuery);
