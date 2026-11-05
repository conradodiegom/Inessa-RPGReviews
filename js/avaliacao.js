/**
 * js/avaliacao.js
 * Responsável pelo Formulário de Avaliação (Modal do Materialize - Etapa 5):
 * - Gerencia a abertura e inicialização do modal #modal-avaliacao (Materialize Modal).
 * - Implementa seletor interativo de 1 a 5 estrelas (nota obrigatória).
 * - Implementa controles de formulário exigidos pelo ID 13:
 *   - Radio buttons para papel na mesa ("JOGADOR" ou "MESTRE").
 *   - Select para status de consumo ("JOGOU", "JOGANDO", "QUERO_JOGAR").
 *   - Checkbox para marcação de spoilers de aventuras oficiais.
 * - Valida a resenha em texto (opcional segundo RN03 do PRD, mas exige mínimo
 *   de 20 caracteres caso preenchida) com mensagens de erro e sucesso (ID 11).
 * - Envia os dados via POST /avaliacoes para o JSON Server (ID 22) garantindo que
 *   toda avaliação nasça com statusModeracao: "PENDENTE" (Regra de Negócio RN01).
 */

const ModalAvaliacao = {
  notaSelecionada: 0,
  sistemaAlvo: null,
  listaSistemas: [],

  descricoesNotas: {
    0: 'Toque nas estrelas (1 a 5) para classificar este sistema',
    1: '1.0 — Falha Crítica (Não recomendo para a mesa)',
    2: '2.0 — Abaixo do esperado (Regras truncadas)',
    3: '3.0 — Bom sistema (Diverte na campanha certa)',
    4: '4.0 — Excelente! Muito recomendado para o grupo',
    5: '5.0 — Obra-Prima! Sucesso Crítico (d20 Natural)',
  },

  capasPorNome: {
    'Ordem Paranormal': 'ordem-paranormal',
    'Tormenta20': 'tormenta20',
    'Dungeons & Dragons 5e': 'dnd5e',
    'Call of Cthulhu 7e': 'monster-week',
    'Vampiro: A Máscara 5ª': 'vampiro5e',
    'Blades in the Dark': 'blades',
    'Pathfinder 2e': 'pathfinder2e',
    'Monster of the Week': 'monster-week',
    'Cyberpunk RED': 'cyberpunk-red',
  },

  sistemasFallback: [
    { id: '1', nome: 'Ordem Paranormal', editora: 'Jambô Editora', ano: 2022, genero: 'Terror', mecanica: 'd20' },
    { id: '2', nome: 'Tormenta20', editora: 'Jambô Editora', ano: 2020, genero: 'Fantasia', mecanica: 'd20' },
    { id: '3', nome: 'Call of Cthulhu 7e', editora: 'Chaosium / New Order', ano: 2014, genero: 'Terror', mecanica: 'd100' },
    { id: '4', nome: 'Dungeons & Dragons 5e', editora: 'Wizards of the Coast', ano: 2014, genero: 'Fantasia Heroica', mecanica: 'd20' },
    { id: '5', nome: 'Vampiro: A Máscara 5ª', editora: 'Galápagos Jogos', ano: 2018, genero: 'Horror Pessoal', mecanica: 'Dice Pool' },
    { id: '6', nome: 'Blades in the Dark', editora: 'Buró Brasil', ano: 2017, genero: 'Fantasia Urbana', mecanica: 'PbtA' },
    { id: '7', nome: 'Pathfinder 2e', editora: 'New Order Editora', ano: 2019, genero: 'Alta Fantasia', mecanica: 'd20' },
    { id: '8', nome: 'Monster of the Week', editora: 'Retropunk', ano: 2015, genero: 'Investigação', mecanica: 'PbtA' },
    { id: '9', nome: 'Cyberpunk RED', editora: 'Devir', ano: 2020, genero: 'Cyberpunk', mecanica: 'Narrativo' },
  ],

  /**
   * Retorna o prefixo relativo para imagens dependendo se estamos na raiz ou em /pages/.
   */
  obterPrefixoImg() {
    return window.location.pathname.includes('/pages/') ? '../img/' : 'img/';
  },

  /**
   * Retorna o caminho para a página de login dependendo do diretório atual.
   */
  obterCaminhoLogin() {
    return window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
  },

  init() {
    this.garantirHtmlModal();
    this.inicializarMaterializeModal();
    this.configurarEventos();
  },

  /**
   * Caso a página atual não possua o HTML de #modal-avaliacao declarado estaticamente,
   * injeta a estrutura semântica no final do body para permitir avaliar de qualquer tela.
   */
  garantirHtmlModal() {
    if (document.getElementById('modal-avaliacao')) return;

    const prefixoImg = this.obterPrefixoImg();
    const modalHtml = `
      <div id="modal-avaliacao" class="modal inessa-review-modal" role="dialog" aria-labelledby="modal-review-system-title" aria-modal="true">
        <div class="inessa-review-modal__accent-bar" aria-hidden="true"></div>

        <!-- Cabeçalho do Modal (Frame 1:2033 / 1:898) -->
        <header class="inessa-review-modal__header">
          <div class="inessa-review-modal__sys-info">
            <div class="inessa-review-modal__cover">
              <img id="modal-review-cover" src="${prefixoImg}ordem-paranormal.png" alt="Capa do sistema" class="img-cover">
            </div>
            <div style="flex: 1 1 auto; min-width: 0;">
              <span class="inessa-review-modal__eyebrow">
                <i class="material-icons" aria-hidden="true">auto_awesome</i>
                <span>AVALIANDO SISTEMA</span>
              </span>
              <h2 id="modal-review-system-title" class="inessa-review-modal__title">Ordem Paranormal</h2>
              <p id="modal-review-system-meta" class="inessa-review-modal__meta">Jambô Editora • 2022 • d20</p>

              <!-- Seletor de sistema exibido quando o modal é aberto fora da página de um sistema específico -->
              <div id="modal-system-picker-wrap" style="display: none; margin-top: 0.5rem;">
                <label for="avaliacao-sistema-select" class="sr-only">Escolha o sistema para avaliar</label>
                <select id="avaliacao-sistema-select" class="browser-default" style="height: 2.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-bg-chip); background: var(--color-bg-card); padding: 0 0.5rem; font-family: var(--font-heading); font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); width: 100%; max-width: 20rem;">
                </select>
              </div>
            </div>
          </div>

          <button type="button" class="inessa-review-modal__close modal-close" aria-label="Fechar formulário de avaliação" title="Fechar">
            <i class="material-icons" aria-hidden="true">close</i>
          </button>
        </header>

        <!-- Formulário de Avaliação (Frames 1:895 e 1:1880) -->
        <form id="form-avaliacao" novalidate>
          <div class="inessa-review-modal__body">

            <!-- Alerta de Feedback (Erro ou Sucesso) -->
            <div id="avaliacao-feedback-banner" class="auth-alert" role="alert">
              <i id="avaliacao-feedback-icon" class="material-icons" aria-hidden="true">info</i>
              <span id="avaliacao-feedback-text"></span>
            </div>

            <!-- SEÇÃO 1: CLASSIFICAÇÃO GERAL EM ESTRELAS (1 a 5) -->
            <section class="review-stars-section" aria-labelledby="label-nota-estrelas">
              <div>
                <div class="review-field-label-row">
                  <label id="label-nota-estrelas" class="review-field-label" for="avaliacao-nota">
                    Sua Nota Geral *
                  </label>
                  <span class="review-field-badge">Obrigatório</span>
                </div>

                <!-- Grupo interativo de 1 a 5 estrelas -->
                <div id="review-stars-group" class="review-stars-interactive" role="radiogroup" aria-label="Classificação de 1 a 5 estrelas">
                  <button type="button" class="review-star-btn js-star-btn" data-star="1" aria-label="1 estrela">
                    <i class="material-icons" aria-hidden="true">star</i>
                  </button>
                  <button type="button" class="review-star-btn js-star-btn" data-star="2" aria-label="2 estrelas">
                    <i class="material-icons" aria-hidden="true">star</i>
                  </button>
                  <button type="button" class="review-star-btn js-star-btn" data-star="3" aria-label="3 estrelas">
                    <i class="material-icons" aria-hidden="true">star</i>
                  </button>
                  <button type="button" class="review-star-btn js-star-btn" data-star="4" aria-label="4 estrelas">
                    <i class="material-icons" aria-hidden="true">star</i>
                  </button>
                  <button type="button" class="review-star-btn js-star-btn" data-star="5" aria-label="5 estrelas">
                    <i class="material-icons" aria-hidden="true">star</i>
                  </button>
                </div>

                <!-- Input numérico oculto para validação HTML5 nativa (ID 11) -->
                <input type="number" id="avaliacao-nota" name="nota" min="1" max="5" required class="sr-only" tabindex="-1">
              </div>

              <div class="review-stars-summary">
                <div>
                  <span id="review-score-numeric" class="review-stars-summary__score">0.0</span>
                  <span class="review-stars-summary__max">/ 5.0</span>
                </div>
                <p id="review-score-desc" class="review-stars-summary__desc">
                  <i class="material-icons" style="font-size: 0.95rem; color: var(--color-accent);" aria-hidden="true">stars</i>
                  <span>Toque nas estrelas (1 a 5) para classificar este sistema</span>
                </p>
              </div>
            </section>

            <!-- SEÇÃO 2: GRID DE PAPEL NA MESA (RADIO) & STATUS DA EXPERIÊNCIA (SELECT) (ID 13) -->
            <div class="review-role-status-grid">

              <!-- Papel na Mesa (Radio Buttons: JOGADOR ou MESTRE) -->
              <div>
                <div class="review-field-label-row">
                  <span class="review-field-label">Joguei como: *</span>
                  <span style="font-family: var(--font-heading); font-size: 0.6875rem; color: var(--color-text-muted);">Papel principal</span>
                </div>

                <div class="review-role-cards" role="radiogroup" aria-label="Papel na mesa">
                  <label class="review-role-card is-selected" id="card-papel-jogador">
                    <input type="radio" name="papel" value="JOGADOR" checked required>
                    <i class="material-icons" aria-hidden="true">person</i>
                    <span class="review-role-card__title">Jogador(a)</span>
                  </label>

                  <label class="review-role-card" id="card-papel-mestre">
                    <input type="radio" name="papel" value="MESTRE" required>
                    <i class="material-icons" aria-hidden="true">shield</i>
                    <span class="review-role-card__title">Mestre</span>
                  </label>
                </div>
              </div>

              <!-- Status da Experiência (Select: JOGOU, JOGANDO, QUERO_JOGAR) -->
              <div>
                <div class="review-field-label-row">
                  <label class="review-field-label" for="avaliacao-status">Status da sua experiência: *</label>
                </div>

                <div class="review-select-wrap">
                  <select id="avaliacao-status" name="statusConsumo" class="browser-default" required>
                    <option value="JOGOU" selected>Já joguei (campanha ou one-shot)</option>
                    <option value="JOGANDO">Jogando atualmente (mesa ativa)</option>
                    <option value="QUERO_JOGAR">Quero jogar (Lista de Desejos)</option>
                  </select>
                </div>
              </div>

            </div>

            <!-- SEÇÃO 3: TEXTAREA DE RESENHA COM BARRA DE FORMATAÇÃO E VALIDAÇÃO (ID 11) -->
            <div>
              <div class="review-field-label-row">
                <label class="review-field-label" for="avaliacao-texto">
                  Sua Resenha / Crônica da Mesa
                </label>
                <span class="review-field-badge review-field-badge--optional">
                  Opcional (mín. 20 caracteres se preenchido)
                </span>
              </div>

              <div class="review-textarea-card">
                <!-- Barra de formatação rápida (Frame 1:2120) -->
                <div class="review-toolbar" role="toolbar" aria-label="Formatação rápida do texto">
                  <button type="button" class="review-toolbar__btn js-format-btn" data-format="bold" title="Negrito">
                    <i class="material-icons" aria-hidden="true">format_bold</i>
                  </button>
                  <button type="button" class="review-toolbar__btn js-format-btn" data-format="italic" title="Itálico">
                    <i class="material-icons" aria-hidden="true">format_italic</i>
                  </button>
                  <button type="button" class="review-toolbar__btn js-format-btn" data-format="quote" title="Destaque / Citação">
                    <i class="material-icons" aria-hidden="true">format_quote</i>
                  </button>
                  <span class="review-toolbar__divider" aria-hidden="true"></span>
                  <span class="review-toolbar__hint">Dica: avalie mecânicas, ambientação e curva de aprendizado</span>
                </div>

                <textarea
                  id="avaliacao-texto"
                  name="texto"
                  class="review-textarea-input"
                  maxlength="1000"
                  placeholder="Compartilhe como foi narrar ou jogar: o que achou das regras, letalidade do combate, fluidez investigativa e qualidade do material gráfico? Dê dicas para futuros mestres..."
                ></textarea>

                <div class="review-textarea-footer">
                  <span id="avaliacao-texto-helper" class="auth-field-helper">
                    Deixe em branco para avaliar apenas com estrelas ou escreva no mínimo 20 caracteres.
                  </span>
                  <span id="avaliacao-char-counter" style="font-weight: 700; flex-shrink: 0;">0 / 1000</span>
                </div>
              </div>
            </div>

            <!-- SEÇÃO 4: CHECKBOX DE SPOILERS (ID 13) -->
            <label class="review-spoiler-box" for="avaliacao-spoiler">
              <input type="checkbox" id="avaliacao-spoiler" name="spoiler" value="SIM">
              <span>
                <span class="review-spoiler-box__title">Esta resenha contém spoilers de aventuras oficiais</span>
                <span class="review-spoiler-box__desc">
                  Marque caso seu texto revele segredos de tramas prontas, reviravoltas ou mistérios importantes do cenário.
                </span>
              </span>
            </label>

            <!-- SEÇÃO 5: DIRETRIZ DA GUILDA & AVISO DE MODERAÇÃO PRÉVIA (RN01) -->
            <div class="review-guild-guideline">
              <span class="review-guild-guideline__icon" aria-hidden="true">
                <i class="material-icons" style="font-size: 1.15rem;">verified_user</i>
              </span>
              <div>
                <h3 class="review-guild-guideline__title">Diretrizes da Guilda &amp; Moderação Prévia</h3>
                <p class="review-guild-guideline__desc">
                  Toda avaliação nasce com status <strong>PENDENTE</strong>. Ela é salva imediatamente na sua vitrine pessoal e passa a integrar a nota média pública do sistema assim que aprovada pelo Administrador.
                </p>
              </div>
            </div>

          </div>

          <!-- RODAPÉ DE AÇÕES DO MODAL (Frame 1:2156) -->
          <footer class="inessa-review-modal__footer">
            <button type="button" class="btn-inessa btn-inessa--ghost modal-close">
              Cancelar
            </button>
            <button type="submit" id="btn-submit-avaliacao" class="btn-inessa btn-inessa--primary" style="padding: 0.7rem 1.35rem;">
              <i class="material-icons" style="font-size: 1.1rem; color: var(--color-accent);" aria-hidden="true">send</i>
              <span>Publicar Avaliação</span>
            </button>
          </footer>
        </form>
      </div>
    `;

    $('body').append(modalHtml);
  },

  /**
   * Inicializa o componente Modal do MaterializeCSS.
   */
  inicializarMaterializeModal() {
    const modalElem = document.getElementById('modal-avaliacao');
    if (modalElem && window.M && M.Modal) {
      M.Modal.init(modalElem, {
        dismissible: true,
        opacity: 0.65,
        inDuration: 220,
        outDuration: 180,
      });
    }
  },

  /**
   * Carrega a lista de sistemas disponíveis para popular o cabeçalho do modal.
   */
  async carregarSistemasDisponiveis() {
    let base = [...this.sistemasFallback];
    try {
      const sistemas = await Api.listarSistemas();
      if (Array.isArray(sistemas) && sistemas.length > 0) {
        base = sistemas;
      }
    } catch (erro) {
      // Usa fallback silencioso caso o JSON Server esteja desligado
    }

    try {
      const locais = JSON.parse(localStorage.getItem('inessa_rpg_sistemas_locais') || '[]');
      locais.forEach((sLocal) => {
        if (!base.some((s) => String(s.id) === String(sLocal.id) || s.nome === sLocal.nome)) {
          base.push(sLocal);
        }
      });
    } catch (e) {
      // Ignora erro de parse
    }

    this.listaSistemas = base;
    return this.listaSistemas;
  },

  /**
   * Abre o modal de avaliação configurando o sistema alvo e o status inicial.
   * @param {Object} opcoes - { statusInicial: 'JOGOU' | 'JOGANDO' | 'QUERO_JOGAR' }
   */
  async abrirModal(opcoes = {}) {
    // Regra de negócio: apenas usuários cadastrados e logados podem registrar avaliações (US02/US03)
    const usuario = Auth.obterUsuarioLogado();
    if (!usuario) {
      if (window.M && M.toast) {
        M.toast({
          html: 'Faça login ou crie sua conta para avaliar sistemas na Taverna!',
          displayLength: 3200,
        });
      }
      setTimeout(() => {
        window.location.href = this.obterCaminhoLogin();
      }, 900);
      return;
    }

    await this.carregarSistemasDisponiveis();

    // Verifica se estamos na Página do Sistema (window.PaginaSistema.sistemaAtual)
    if (window.PaginaSistema && window.PaginaSistema.sistemaAtual) {
      this.sistemaAlvo = window.PaginaSistema.sistemaAtual;
      $('#modal-system-picker-wrap').hide();
    } else {
      // Se aberto a partir do Catálogo/Home, permite escolher o sistema no cabeçalho do modal
      this.sistemaAlvo = this.listaSistemas[0];
      const $selectSistema = $('#avaliacao-sistema-select');
      $selectSistema.empty();
      this.listaSistemas.forEach((s) => {
        $selectSistema.append(`<option value="${s.id}">${s.nome} (${s.editora})</option>`);
      });
      $('#modal-system-picker-wrap').show();
    }

    this.atualizarCabecalhoSistemaModal(this.sistemaAlvo);
    this.resetarFormulario(opcoes.statusInicial || 'JOGOU');

    const modalElem = document.getElementById('modal-avaliacao');
    if (modalElem && window.M && M.Modal) {
      const instancia = M.Modal.getInstance(modalElem) || M.Modal.init(modalElem);
      instancia.open();
    }
  },

  /**
   * Atualiza capa, título e metadados do sistema exibido no topo do modal.
   */
  atualizarCabecalhoSistemaModal(sistema) {
    if (!sistema) return;
    const prefixoImg = this.obterPrefixoImg();
    const slugCapa = this.capasPorNome[sistema.nome] || 'ordem-paranormal';

    $('#modal-review-cover')
      .attr('src', `${prefixoImg}${slugCapa}.png`)
      .attr('alt', `Capa de ${sistema.nome}`);
    $('#modal-review-system-title').text(sistema.nome);
    $('#modal-review-system-meta').text(
      `${sistema.editora} • ${sistema.ano} • ${sistema.mecanica}`
    );
  },

  /**
   * Limpa os campos do formulário de avaliação ao abrir o modal.
   */
  resetarFormulario(statusInicial = 'JOGOU') {
    this.definirNotaEstrelas(0);
    $('#avaliacao-feedback-banner').removeClass('is-visible auth-alert--error auth-alert--success');

    // Pré-seleciona o papel preferido salvo no localStorage (ou JOGADOR por padrão)
    const papelPreferido = localStorage.getItem('inessa_rpg_papel_preferido') || 'JOGADOR';
    $(`input[name="papel"][value="${papelPreferido}"]`).prop('checked', true).trigger('change');

    $('#avaliacao-status').val(statusInicial);
    $('#avaliacao-texto').val('');
    $('#avaliacao-spoiler').prop('checked', false);
    $('#avaliacao-char-counter').text('0 / 1000');
    $('#avaliacao-texto-helper')
      .removeClass('is-error is-success')
      .text('Deixe em branco para avaliar apenas com estrelas ou escreva no mínimo 20 caracteres.');
  },

  /**
   * Atualiza o estado visual das 5 estrelas e o resumo numérico da nota.
   */
  definirNotaEstrelas(nota) {
    this.notaSelecionada = Number(nota) || 0;
    $('#avaliacao-nota').val(this.notaSelecionada > 0 ? this.notaSelecionada : '');

    $('#review-stars-group .js-star-btn').each((_, btn) => {
      const $btn = $(btn);
      const valorEstrela = Number($btn.data('star'));
      $btn.toggleClass('is-active', valorEstrela <= this.notaSelecionada);
      $btn.removeClass('is-hover');
    });

    const notaFormatada = this.notaSelecionada > 0 ? this.notaSelecionada.toFixed(1) : '0.0';
    $('#review-score-numeric').text(notaFormatada);

    const descTexto = this.descricoesNotas[this.notaSelecionada] || this.descricoesNotas[0];
    $('#review-score-desc span').text(descTexto);
  },

  /**
   * Valida o comprimento da resenha (opcional, mas se preenchida exige >= 20 caracteres - RN03 e ID 11).
   */
  validarTextoResenha() {
    const $textarea = $('#avaliacao-texto');
    const $helper = $('#avaliacao-texto-helper');
    const texto = ($textarea.val() || '').trim();
    const tamanho = texto.length;

    $('#avaliacao-char-counter').text(`${tamanho} / 1000`);

    if (tamanho === 0) {
      $textarea[0].setCustomValidity('');
      $helper
        .removeClass('is-error is-success')
        .text('Deixe em branco para avaliar apenas com estrelas ou escreva no mínimo 20 caracteres.');
      return true;
    }

    if (tamanho < 20) {
      const faltam = 20 - tamanho;
      $textarea[0].setCustomValidity(`A resenha deve ter pelo menos 20 caracteres (faltam ${faltam}).`);
      $helper
        .removeClass('is-success')
        .addClass('is-error')
        .text(`Resenha muito curta: digite mais ${faltam} caractere(s) ou deixe em branco.`);
      return false;
    }

    $textarea[0].setCustomValidity('');
    $helper
      .removeClass('is-error')
      .addClass('is-success')
      .text('Crônica válida! Excelente detalhamento para a comunidade.');
    return true;
  },

  exibirFeedback(tipo, mensagem) {
    const $banner = $('#avaliacao-feedback-banner');
    const $icone = $('#avaliacao-feedback-icon');
    const $texto = $('#avaliacao-feedback-text');

    $banner.removeClass('auth-alert--error auth-alert--success');
    if (tipo === 'erro') {
      $banner.addClass('auth-alert--error is-visible');
      $icone.text('error_outline');
    } else {
      $banner.addClass('auth-alert--success is-visible');
      $icone.text('check_circle');
    }
    $texto.text(mensagem);
  },

  /**
   * Submete a avaliação para o JSON Server (POST /avaliacoes) (ID 22).
   */
  async processarEnvioAvaliacao(evento) {
    evento.preventDefault();

    const usuario = Auth.obterUsuarioLogado();
    if (!usuario) {
      this.exibirFeedback('erro', 'Sua sessão expirou. Faça login novamente para enviar sua avaliação.');
      return;
    }

    // 1. Valida se o usuário selecionou de 1 a 5 estrelas
    if (this.notaSelecionada < 1 || this.notaSelecionada > 5) {
      this.exibirFeedback('erro', 'Por favor, selecione uma nota de 1 a 5 estrelas para o sistema.');
      return;
    }

    // 2. Valida o texto da resenha (opcional, mas mínimo de 20 caracteres se preenchido - RN03)
    if (!this.validarTextoResenha()) {
      this.exibirFeedback(
        'erro',
        'A resenha em texto precisa ter no mínimo 20 caracteres (ou deixe o campo em branco para avaliar apenas com nota).'
      );
      return;
    }

    const papel = $('input[name="papel"]:checked').val() || 'JOGADOR';
    const statusConsumo = $('#avaliacao-status').val() || 'JOGOU';
    const contemSpoiler = $('#avaliacao-spoiler').is(':checked');
    let textoFinal = ($('#avaliacao-texto').val() || '').trim();

    if (contemSpoiler && textoFinal.length > 0 && !textoFinal.startsWith('[SPOILER]')) {
      textoFinal = `[SPOILER] ${textoFinal}`;
    }

    // Objeto estritamente fiel ao modelo de dados de docs/architecture.md
    const novaAvaliacao = {
      usuarioId: String(usuario.id),
      sistemaId: String(this.sistemaAlvo ? this.sistemaAlvo.id : '1'),
      nota: Number(this.notaSelecionada),
      texto: textoFinal,
      papel,
      statusConsumo,
      statusModeracao: 'PENDENTE', // Regra de Negócio RN01: toda avaliação nasce PENDENTE
      data: new Date().toISOString().split('T')[0],
    };

    const $btnSubmit = $('#btn-submit-avaliacao');
    $btnSubmit.prop('disabled', true);

    try {
      await Api.criarAvaliacao(novaAvaliacao);
    } catch (erro) {
      console.warn('JSON Server offline ao gravar avaliação. Salvando no cache local de demonstração:', erro);
      const avaliacoesLocais = JSON.parse(localStorage.getItem('inessa_rpg_avaliacoes_locais') || '[]');
      avaliacoesLocais.push({
        id: String(Date.now()),
        ...novaAvaliacao,
      });
      localStorage.setItem('inessa_rpg_avaliacoes_locais', JSON.stringify(avaliacoesLocais));
    } finally {
      $btnSubmit.prop('disabled', false);
    }

    this.exibirFeedback(
      'sucesso',
      'Avaliação enviada com sucesso! Ela está com status PENDENTE aguardando aprovação do Administrador e já aparece na sua vitrine.'
    );

    if (window.M && M.toast) {
      M.toast({
        html: 'Avaliação registrada! Status: PENDENTE de moderação.',
        displayLength: 3500,
      });
    }

    setTimeout(() => {
      const modalElem = document.getElementById('modal-avaliacao');
      if (modalElem && window.M && M.Modal) {
        const instancia = M.Modal.getInstance(modalElem);
        if (instancia) instancia.close();
      }
    }, 1400);
  },

  configurarEventos() {
    // Intercepta qualquer botão .js-open-review-modal (no Header, Hero Card, Rodapé ou Bottom Nav)
    $(document).on('click', '.js-open-review-modal', (evento) => {
      evento.preventDefault();
      this.abrirModal({ statusInicial: 'JOGOU' });
    });

    // Botão "+ ADICIONAR À LISTA DE DESEJOS" abre o modal já com "QUERO_JOGAR" selecionado
    $(document).on('click', '#btn-add-wishlist', (evento) => {
      evento.preventDefault();
      this.abrirModal({ statusInicial: 'QUERO_JOGAR' });
    });

    // Troca de sistema quando o modal é aberto fora de pages/sistema.html
    $(document).on('change', '#avaliacao-sistema-select', (evento) => {
      const idEscolhido = String($(evento.currentTarget).val());
      const encontrado = this.listaSistemas.find((s) => String(s.id) === idEscolhido);
      if (encontrado) {
        this.sistemaAlvo = encontrado;
        this.atualizarCabecalhoSistemaModal(encontrado);
      }
    });

    // Interação de hover e clique nas 5 estrelas
    $(document).on('mouseenter', '#review-stars-group .js-star-btn', (evento) => {
      const estrelaHover = Number($(evento.currentTarget).data('star'));
      $('#review-stars-group .js-star-btn').each((_, btn) => {
        const $btn = $(btn);
        const valor = Number($btn.data('star'));
        $btn.toggleClass('is-hover', valor <= estrelaHover);
      });
      const desc = this.descricoesNotas[estrelaHover] || this.descricoesNotas[0];
      $('#review-score-desc span').text(desc);
    });

    $(document).on('mouseleave', '#review-stars-group', () => {
      $('#review-stars-group .js-star-btn').removeClass('is-hover');
      const desc = this.descricoesNotas[this.notaSelecionada] || this.descricoesNotas[0];
      $('#review-score-desc span').text(desc);
    });

    $(document).on('click', '#review-stars-group .js-star-btn', (evento) => {
      const notaClicada = Number($(evento.currentTarget).data('star'));
      this.definirNotaEstrelas(notaClicada);
    });

    // Estilização dos cards de Radio Button (Papel na Mesa: JOGADOR vs MESTRE)
    $(document).on('change', 'input[name="papel"]', (evento) => {
      const valor = $(evento.currentTarget).val();
      $('.review-role-card').removeClass('is-selected');
      if (valor === 'MESTRE') {
        $('#card-papel-mestre').addClass('is-selected');
      } else {
        $('#card-papel-jogador').addClass('is-selected');
      }
    });

    // Barra de formatação rápida do Textarea (Negrito, Itálico, Citação)
    $(document).on('click', '.js-format-btn', (evento) => {
      const formato = $(evento.currentTarget).data('format');
      const $textarea = $('#avaliacao-texto');
      const textoAtual = $textarea.val() || '';

      let snippet = '';
      if (formato === 'bold') snippet = '**destaque**';
      else if (formato === 'italic') snippet = '*ênfase*';
      else if (formato === 'quote') snippet = '\n> "Momento épico na mesa..."\n';

      $textarea.val(textoAtual + (textoAtual.length > 0 ? ' ' : '') + snippet);
      $textarea.trigger('input').trigger('focus');
    });

    // Contador de caracteres e validação em tempo real da resenha
    $(document).on('input', '#avaliacao-texto', () => {
      this.validarTextoResenha();
    });

    // Envio do formulário de avaliação
    $(document).on('submit', '#form-avaliacao', (evento) => {
      this.processarEnvioAvaliacao(evento);
    });
  },
};

$(document).ready(() => {
  ModalAvaliacao.init();
});

window.ModalAvaliacao = ModalAvaliacao;
