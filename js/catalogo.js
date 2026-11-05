/**
 * js/catalogo.js
 * Responsável pela tela inicial (Catálogo de Sistemas):
 * - Busca todos os sistemas da API fake (JSON Server) via fetch() (ID 23).
 * - Caso a API esteja offline, exibe alerta amigável e usa dados de fallback para não quebrar a tela.
 * - Renderiza o carrossel de "Mais Bem Avaliados" e o grid de "Todos os Sistemas".
 * - Aplica busca por texto e filtros acumulativos por Gênero e Mecânica usando jQuery (ID 20).
 * - Utiliza imagens modernas em WebP com fallback PNG via <picture> e object-fit (IDs 09 e 10).
 */

const Catalogo = {
  sistemas: [],
  avaliacoesAprovadas: [],
  filtroGenero: 'TODOS',
  filtroMecanica: 'TODAS',
  termoBusca: '',
  limiteExibicao: 15,

  /**
   * Mapeia metadados visuais (capas extraídas do Figma e badges de ranking)
   * sem alterar o contrato de campos da tabela "sistemas" no db.json.
   */
  mapaVisualSistemas: {
    'Tormenta20': {
      webp: 'img/tormenta20.webp',
      png: 'img/tormenta20.png',
      corFundo: '#4e0078',
      rankLabel: '#1 Top Geral',
      rankIcon: 'emoji_events',
      rankStyle: 'gold',
      tagStyle: 'purple',
      resenhasBase: '1.2k',
    },
    'Ordem Paranormal': {
      webp: 'img/ordem-paranormal.webp',
      png: 'img/ordem-paranormal.png',
      corFundo: '#003731',
      rankLabel: '#2 Comunidade',
      rankIcon: 'military_tech',
      rankStyle: 'silver',
      tagStyle: 'teal',
      resenhasBase: '2.4k',
    },
    'Call of Cthulhu 7e': {
      webp: 'img/monster-week.webp',
      png: 'img/monster-week.png',
      corFundo: '#2b2929',
      rankLabel: '#3 Clássico',
      rankIcon: 'auto_awesome',
      rankStyle: 'silver',
      tagStyle: 'purple',
      resenhasBase: '980',
    },
    'Dungeons & Dragons 5e': {
      webp: 'img/dnd5e.webp',
      png: 'img/dnd5e.png',
      corFundo: '#f4d9ff',
      resenhasBase: '3.8k',
    },
    'Vampiro: A Máscara 5ª': {
      webp: 'img/vampiro5e.webp',
      png: 'img/vampiro5e.png',
      corFundo: '#303030',
      resenhasBase: '850',
    },
    'Blades in the Dark': {
      webp: 'img/blades.webp',
      png: 'img/blades.png',
      corFundo: '#102630',
      resenhasBase: '620',
    },
    'Pathfinder 2e': {
      webp: 'img/pathfinder2e.webp',
      png: 'img/pathfinder2e.png',
      corFundo: '#f4d9ff',
      resenhasBase: '910',
    },
    'Monster of the Week': {
      webp: 'img/monster-week.webp',
      png: 'img/monster-week.png',
      corFundo: '#005047',
      resenhasBase: '340',
    },
    'Cyberpunk RED': {
      webp: 'img/cyberpunk-red.webp',
      png: 'img/cyberpunk-red.png',
      corFundo: '#ffdad6',
      resenhasBase: '490',
    },
  },

  /**
   * Dados locais de segurança caso o aluno abra o index.html sem rodar "npm run api" ainda,
   * mas sempre avisando na tela quando a API JSON Server não for encontrada.
   */
  sistemasFallback: [
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

  async init() {
    this.configurarEventos();
    this.lerParametrosUrl();
    await this.carregarDados();
  },

  /**
   * Lê parâmetro ?q= da URL caso o usuário tenha pesquisado pela barra superior.
   */
  lerParametrosUrl() {
    const params = new URLSearchParams(window.location.search);
    const buscaUrl = params.get('q');
    if (buscaUrl) {
      this.termoBusca = buscaUrl.trim();
      $('#catalog-search-input').val(this.termoBusca);
      $('#header-search-input').val(this.termoBusca);
      $('#btn-clear-search').css('display', 'inline-flex');
    }
  },

  /**
   * Busca os sistemas no JSON Server via fetch() (ID 23) e sincroniza com
   * sistemas/notas salvos no localStorage pelo Painel Admin.
   */
  async carregarDados() {
    const $alertaApi = $('#catalog-api-warning');
    let baseSistemas = [];
    try {
      const listaSistemas = await Api.listarSistemas();
      baseSistemas = Array.isArray(listaSistemas) ? listaSistemas : [];
      $alertaApi.hide();
    } catch (erro) {
      console.warn('JSON Server indisponível em localhost:3000. Exibindo dados de demonstração:', erro);
      baseSistemas = [...this.sistemasFallback];
      $alertaApi.fadeIn(200);
    }

    // Mescla sistemas cadastrados pelo Admin no localStorage (US07 / US08)
    let locais = [];
    let notasLocais = {};
    try {
      locais = JSON.parse(localStorage.getItem('inessa_rpg_sistemas_locais') || '[]');
      notasLocais = JSON.parse(localStorage.getItem('inessa_rpg_notas_sistemas') || '{}');
    } catch (e) {
      locais = [];
      notasLocais = {};
    }

    const mapa = new Map();
    baseSistemas.forEach((s) => mapa.set(String(s.id), { ...s }));
    (Array.isArray(locais) ? locais : []).forEach((sLocal) => {
      const jaExistePorNome = Array.from(mapa.values()).some(
        (existente) =>
          String(existente.id) !== String(sLocal.id) &&
          String(existente.nome || '').trim().toLowerCase() === String(sLocal.nome || '').trim().toLowerCase()
      );
      if (!jaExistePorNome) {
        mapa.set(String(sLocal.id), { ...(mapa.get(String(sLocal.id)) || {}), ...sLocal });
      }
    });

    const todos = Array.from(mapa.values()).map((sis) => {
      if (notasLocais[String(sis.id)] !== undefined) {
        return { ...sis, notaMedia: Number(notasLocais[String(sis.id)]) };
      }
      return sis;
    });

    // Coloca sistemas recém-cadastrados (id > 9) no topo da grade para visualização imediata
    const novos = todos.filter((s) => Number(s.id) > 9).reverse();
    const padrao = todos.filter((s) => !(Number(s.id) > 9));
    this.sistemas = [...novos, ...padrao];

    this.renderizarMaisBemAvaliados();
    this.renderizarTodosOsSistemas();
  },

  /**
   * Retorna metadados visuais (imagens WebP/PNG e cores) para qualquer sistema,
   * inclusive novos sistemas cadastrados manualmente pelo Admin.
   */
  obterVisualSistema(sistema) {
    return (
      this.mapaVisualSistemas[sistema.nome] || {
        webp: 'img/dnd5e.webp',
        png: 'img/dnd5e.png',
        corFundo: '#4e0078',
        rankLabel: 'Destaque',
        rankIcon: 'star',
        rankStyle: 'silver',
        tagStyle: 'purple',
        resenhasBase: 'Novo',
      }
    );
  },

  /**
   * Gera o HTML das 5 estrelas douradas proporcionalmente à notaMedia do sistema.
   */
  gerarEstrelasHtml(nota) {
    const notaNum = Number(nota) || 0;
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      if (notaNum >= i - 0.2) {
        html += '<i class="material-icons" aria-hidden="true">star</i>';
      } else if (notaNum >= i - 0.7) {
        html += '<i class="material-icons" aria-hidden="true">star_half</i>';
      } else {
        html += '<i class="material-icons" aria-hidden="true">star_border</i>';
      }
    }
    return html;
  },

  /**
   * Renderiza a seção "Mais Bem Avaliados" (Top 3 sistemas com maior notaMedia).
   * Utiliza <picture> com WebP + PNG (ID 10) e imagem com object-fit: cover (ID 09).
   */
  renderizarMaisBemAvaliados() {
    const $container = $('#featured-systems-carousel');
    $container.empty();

    const topSistemas = [...this.sistemas]
      .sort((a, b) => (Number(b.notaMedia) || 0) - (Number(a.notaMedia) || 0))
      .slice(0, 3);

    const ranksPadrao = ['#1 Top Geral', '#2 Comunidade', '#3 Clássico'];

    topSistemas.forEach((sistema, idx) => {
      const visual = this.obterVisualSistema(sistema);
      const rankTexto = visual.rankLabel || ranksPadrao[idx] || `#${idx + 1} Ranking`;
      const classeBadge = idx === 0 ? 'featured-card__rank-badge--gold' : 'featured-card__rank-badge--silver';
      const classeTag = visual.tagStyle === 'teal' ? 'featured-card__tag--teal' : 'featured-card__tag--purple';
      const notaFormatada = Number(sistema.notaMedia || 0).toFixed(1);

      const cardHtml = `
        <article class="featured-card">
          <div class="featured-card__media" style="background-color: ${visual.corFundo};">
            <picture>
              <source srcset="${visual.webp}" type="image/webp">
              <img src="${visual.png}" alt="Capa do sistema ${sistema.nome}" class="img-cover" loading="lazy">
            </picture>
            <div class="featured-card__gradient"></div>
            <div class="featured-card__rank-badge ${classeBadge}">
              <i class="material-icons" style="font-size: 0.85rem;">${visual.rankIcon || 'emoji_events'}</i>
              <span>${rankTexto}</span>
            </div>
            <div class="featured-card__tag ${classeTag}">
              ${sistema.genero} • ${sistema.mecanica}
            </div>
          </div>
          <div class="featured-card__body">
            <div>
              <h3 class="featured-card__title">${sistema.nome}</h3>
              <p class="featured-card__publisher">${sistema.editora}</p>
            </div>
            <div class="featured-card__footer">
              <div class="featured-card__rating">
                <i class="material-icons featured-card__star" aria-hidden="true">star</i>
                <span class="featured-card__score">${notaFormatada}</span>
                <span class="featured-card__count">(${visual.resenhasBase})</span>
              </div>
              <a
                href="pages/sistema.html?id=${encodeURIComponent(sistema.id)}"
                class="featured-card__cta"
                title="Ver detalhes de ${sistema.nome}"
                aria-label="Ver detalhes de ${sistema.nome}"
              >
                <i class="material-icons">arrow_forward</i>
              </a>
            </div>
          </div>
        </article>
      `;

      $container.append(cardHtml);
    });
  },

  /**
   * Filtra os sistemas por texto (nome, editora, gênero ou mecânica),
   * chip de gênero e chip de mecânica.
   */
  obterSistemasFiltrados() {
    const termo = this.termoBusca.toLowerCase();

    return this.sistemas.filter((sistema) => {
      const nome = (sistema.nome || '').toLowerCase();
      const editora = (sistema.editora || '').toLowerCase();
      const genero = (sistema.genero || '').toLowerCase();
      const mecanica = (sistema.mecanica || '').toLowerCase();

      const bateBusca =
        !termo ||
        nome.includes(termo) ||
        editora.includes(termo) ||
        genero.includes(termo) ||
        mecanica.includes(termo);

      // Correspondência flexível de gênero (ex.: chip "Fantasia" encontra "Fantasia Heroica", "Alta Fantasia", "Fantasia Urbana")
      const filtroGenLower = this.filtroGenero.toLowerCase();
      const bateGenero =
        this.filtroGenero === 'TODOS' ||
        genero.includes(filtroGenLower) ||
        (filtroGenLower === 'terror' && (genero.includes('terror') || genero.includes('horror')));

      // Correspondência de mecânica
      const filtroMecLower = this.filtroMecanica.toLowerCase();
      const bateMecanica =
        this.filtroMecanica === 'TODAS' ||
        mecanica.includes(filtroMecLower);

      return bateBusca && bateGenero && bateMecanica;
    });
  },

  /**
   * Renderiza o grid principal "Todos os Sistemas" e atualiza o contador.
   */
  renderizarTodosOsSistemas() {
    const $grid = $('#all-systems-grid');
    const $contador = $('#systems-counter');
    const $btnCarregarMais = $('#btn-load-more-systems');
    const $estadoVazio = $('#catalog-empty-state');

    const filtrados = this.obterSistemasFiltrados();
    const visiveis = filtrados.slice(0, this.limiteExibicao);

    $grid.empty();
    $contador.text(`${visiveis.length} exibidos`);

    if (filtrados.length === 0) {
      $estadoVazio.show();
      $btnCarregarMais.hide();
      return;
    }

    $estadoVazio.hide();

    visiveis.forEach((sistema) => {
      const visual = this.obterVisualSistema(sistema);
      const notaFormatada = Number(sistema.notaMedia || 0).toFixed(1);
      const estrelasHtml = this.gerarEstrelasHtml(sistema.notaMedia);
      // Rótulo curto para o badge de mecânica no canto da imagem conforme Figma ("Dice Pool" -> "Pool")
      const mecanicaCurta = sistema.mecanica === 'Dice Pool' ? 'Pool' : sistema.mecanica;

      const cardHtml = `
        <a
          href="pages/sistema.html?id=${encodeURIComponent(sistema.id)}"
          class="system-card"
          aria-label="Abrir página do sistema ${sistema.nome}"
        >
          <div class="system-card__media" style="background-color: ${visual.corFundo};">
            <picture>
              <source srcset="${visual.webp}" type="image/webp">
              <img src="${visual.png}" alt="Capa de ${sistema.nome}" class="img-cover" loading="lazy">
            </picture>
            <span class="system-card__mechanic-badge">${mecanicaCurta}</span>
          </div>
          <div class="system-card__body">
            <div>
              <span class="system-card__genre-pill">${sistema.genero}</span>
              <h3 class="system-card__title">${sistema.nome}</h3>
              <p class="system-card__publisher">${sistema.editora}</p>
            </div>
            <div>
              <div class="system-card__rating-row">
                <span class="system-card__stars" aria-label="Nota ${notaFormatada} de 5">
                  ${estrelasHtml}
                </span>
                <span class="system-card__score">${notaFormatada}</span>
              </div>
              <p class="system-card__reviews-count">${visual.resenhasBase} resenhas</p>
            </div>
          </div>
        </a>
      `;

      $grid.append(cardHtml);
    });

    // Exibe ou oculta o botão "Carregar mais sistemas"
    if (filtrados.length > this.limiteExibicao) {
      $btnCarregarMais.show();
    } else {
      $btnCarregarMais.hide();
    }
  },

  /**
   * Registra todos os eventos de busca e filtros com jQuery (ID 20).
   */
  configurarEventos() {
    // Busca em tempo real no input principal do catálogo
    $('#catalog-search-input').on('input', (evento) => {
      this.termoBusca = $(evento.currentTarget).val().trim();
      this.limiteExibicao = 9;
      if (this.termoBusca.length > 0) {
        $('#btn-clear-search').css('display', 'inline-flex');
      } else {
        $('#btn-clear-search').hide();
      }
      this.renderizarTodosOsSistemas();
    });

    // Sincroniza a busca da navbar desktop caso já estejamos na página inicial
    $('#header-search-input').on('input', (evento) => {
      const valor = $(evento.currentTarget).val();
      $('#catalog-search-input').val(valor).trigger('input');
    });

    // Botão de limpar busca
    $('#btn-clear-search').on('click', () => {
      this.termoBusca = '';
      $('#catalog-search-input').val('');
      $('#header-search-input').val('');
      $('#btn-clear-search').hide();
      this.renderizarTodosOsSistemas();
    });

    // Filtro por Chips de Gênero
    $('#genre-chips-container').on('click', '.js-genre-chip', (evento) => {
      const $chip = $(evento.currentTarget);
      const generoSelecionado = $chip.data('genre');

      $('#genre-chips-container .js-genre-chip').removeClass('active');
      $chip.addClass('active');

      this.filtroGenero = generoSelecionado;
      this.limiteExibicao = 9;
      this.renderizarTodosOsSistemas();
    });

    // Filtro por Chips de Mecânica (clicar novamente na mesma mecânica desmarca o filtro)
    $('#mechanic-chips-container').on('click', '.js-mechanic-chip', (evento) => {
      const $chip = $(evento.currentTarget);
      const mecanicaSelecionada = $chip.data('mechanic');

      if (this.filtroMecanica === mecanicaSelecionada) {
        this.filtroMecanica = 'TODAS';
        $chip.removeClass('active');
      } else {
        $('#mechanic-chips-container .js-mechanic-chip').removeClass('active');
        $chip.addClass('active');
        this.filtroMecanica = mecanicaSelecionada;
      }

      this.limiteExibicao = 9;
      this.renderizarTodosOsSistemas();
    });

    // Botão "CARREGAR MAIS SISTEMAS"
    $('#btn-load-more-systems').on('click', () => {
      this.limiteExibicao += 6;
      this.renderizarTodosOsSistemas();
    });

    // Botão de limpar todos os filtros no estado vazio
    $('#btn-reset-filters').on('click', () => {
      this.termoBusca = '';
      this.filtroGenero = 'TODOS';
      this.filtroMecanica = 'TODAS';
      this.limiteExibicao = 6;
      $('#catalog-search-input').val('');
      $('#header-search-input').val('');
      $('#btn-clear-search').hide();
      $('#genre-chips-container .js-genre-chip').removeClass('active').first().addClass('active');
      $('#mechanic-chips-container .js-mechanic-chip').removeClass('active');
      this.renderizarTodosOsSistemas();
    });
  },
};

$(document).ready(() => {
  Catalogo.init();
});

window.Catalogo = Catalogo;
