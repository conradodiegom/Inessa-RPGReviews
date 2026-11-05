/**
 * js/sugerir.js
 * Responsável pela Página de Sugerir Sistema (pages/sugerir.html - Etapa 7A):
 * - Aplica o plugin jQuery Mask Plugin (ID 21) no campo "Ano de Lançamento" (#sugestao-ano)
 *   restringindo a digitação a exatamente 4 dígitos numéricos ('0000').
 * - Realiza validação em tempo real com mensagens de erro e sucesso e expressão regular (ID 11 e ID 12).
 * - Envia a nova sugestão para o JSON Server via POST /sugestoes (ID 22) com
 *   statusSugestao: "PENDENTE" (US04).
 * - Exibe na barra lateral a lista de sugestões recentes (GET /sugestoes - ID 23).
 */

const PaginaSugerir = {
  regexAno: /^(19[7-9]\d|20[0-2]\d)$/,

  fallbackSugestoes: [
    {
      id: '1',
      usuarioId: '1',
      nomeSistema: 'Skyfall RPG',
      editora: 'Capitur / Mestre Pedrok',
      genero: 'Fantasia',
      statusSugestao: 'PENDENTE',
      data: '2026-03-16',
    },
    {
      id: '2',
      usuarioId: '3',
      nomeSistema: 'Old Dragon 2ª Edição',
      editora: 'Buró Brasil',
      genero: 'Fantasia',
      statusSugestao: 'APROVADA',
      data: '2026-03-10',
    },
  ],

  async init() {
    this.aplicarMascaraJquery();
    this.configurarEventos();
    await this.carregarSugestoesRecentes();
  },

  /**
   * Aplica o jQuery Mask Plugin no campo #sugestao-ano (ID 21).
   * Garante que o usuário digite apenas 4 algarismos numéricos (formato AAAA).
   */
  aplicarMascaraJquery() {
    const $campoAno = $('#sugestao-ano');
    if ($campoAno.length > 0 && typeof $campoAno.mask === 'function') {
      $campoAno.mask('0000', {
        placeholder: 'ex: 2024',
      });
    }
  },

  /**
   * Busca as sugestões cadastradas no JSON Server (GET /sugestoes) para exibir na lateral (ID 23).
   */
  async carregarSugestoesRecentes() {
    let lista = [];
    try {
      const resposta = await Api.listarSugestoes();
      if (Array.isArray(resposta)) {
        lista = resposta;
      }
    } catch (erro) {
      lista = [...this.fallbackSugestoes];
    }

    // Mescla sugestões gravadas localmente caso o JSON Server esteja offline
    const locais = JSON.parse(localStorage.getItem('inessa_rpg_sugestoes_locais') || '[]');
    locais.forEach((sLocal) => {
      if (!lista.some((item) => String(item.id) === String(sLocal.id))) {
        lista.push(sLocal);
      }
    });

    this.renderizarSugestoesRecentes(lista);
  },

  renderizarSugestoesRecentes(lista) {
    const $container = $('#recent-suggestions-list');
    $container.empty();

    const recentes = [...lista].reverse().slice(0, 4);
    if (recentes.length === 0) {
      $container.html('<p style="font-size: 0.8125rem; color: var(--color-text-muted); margin: 0;">Nenhuma sugestão na fila ainda.</p>');
      return;
    }

    recentes.forEach((s) => {
      let badgeClass = 'moderation-pill--pendente';
      let badgeLabel = 'PENDENTE';
      if (s.statusSugestao === 'APROVADA') {
        badgeClass = 'moderation-pill--aprovada';
        badgeLabel = 'CATALOGADO';
      } else if (s.statusSugestao === 'REJEITADA') {
        badgeClass = 'moderation-pill--rejeitada';
        badgeLabel = 'REJEITADO';
      }

      $container.append(`
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.625rem 0.75rem; border-radius: var(--radius-md); background-color: var(--color-bg-surface);">
          <div style="min-width: 0;">
            <p style="font-family: var(--font-heading); font-size: 0.875rem; font-weight: 700; color: var(--color-text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${s.nomeSistema}
            </p>
            <p style="font-size: 0.75rem; color: var(--color-text-secondary); margin: 0;">
              ${s.editora} • ${s.genero}
            </p>
          </div>
          <span class="moderation-pill ${badgeClass}" style="flex-shrink: 0;">
            ${badgeLabel}
          </span>
        </div>
      `);
    });
  },

  /**
   * Valida os campos do formulário de sugestão com mensagens visuais de erro e sucesso (ID 11 e ID 12).
   */
  validarCampoNome() {
    const $input = $('#sugestao-nome');
    const $box = $('#box-sugestao-nome');
    const $helper = $('#helper-sugestao-nome');
    const valor = ($input.val() || '').trim();

    if (valor.length < 2) {
      $input[0].setCustomValidity('Informe o nome oficial do sistema (mínimo 2 caracteres).');
      $box.removeClass('is-valid').addClass('is-invalid');
      $helper.removeClass('is-success').addClass('is-error').text('O nome do sistema deve ter pelo menos 2 caracteres.');
      return false;
    }

    $input[0].setCustomValidity('');
    $box.removeClass('is-invalid').addClass('is-valid');
    $helper.removeClass('is-error').addClass('is-success').text('Título válido para catalogação.');
    return true;
  },

  validarCampoEditora() {
    const $input = $('#sugestao-editora');
    const $box = $('#box-sugestao-editora');
    const $helper = $('#helper-sugestao-editora');
    const valor = ($input.val() || '').trim();

    if (valor.length < 2) {
      $input[0].setCustomValidity('Informe a editora ou criador independente.');
      $box.removeClass('is-valid').addClass('is-invalid');
      $helper.removeClass('is-success').addClass('is-error').text('Informe o nome da editora ou autor responsável.');
      return false;
    }

    $input[0].setCustomValidity('');
    $box.removeClass('is-invalid').addClass('is-valid');
    $helper.removeClass('is-error').addClass('is-success').text('Editora/autor válido.');
    return true;
  },

  validarCampoAno() {
    const $input = $('#sugestao-ano');
    const $box = $('#box-sugestao-ano');
    const $helper = $('#helper-sugestao-ano');
    const valor = ($input.val() || '').trim();

    if (!this.regexAno.test(valor)) {
      $input[0].setCustomValidity('Digite um ano válido com 4 dígitos (entre 1970 e 2029).');
      $box.removeClass('is-valid').addClass('is-invalid');
      $helper
        .removeClass('is-success')
        .addClass('is-error')
        .text('Ano inválido: digite exatamente 4 dígitos entre 1970 e 2026 (ex: 2024).');
      return false;
    }

    $input[0].setCustomValidity('');
    $box.removeClass('is-invalid').addClass('is-valid');
    $helper.removeClass('is-error').addClass('is-success').text(`Ano ${valor} validado com sucesso.`);
    return true;
  },

  exibirBanner(tipo, mensagem) {
    const $banner = $('#sugestao-feedback-banner');
    const $icone = $('#sugestao-feedback-icon');
    const $texto = $('#sugestao-feedback-text');

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
   * Processa o envio da sugestão de sistema (POST /sugestoes - ID 22).
   */
  async processarEnvioSugestao(evento) {
    evento.preventDefault();

    const usuario = Auth.obterUsuarioLogado();
    if (!usuario) {
      this.exibirBanner('erro', 'Você precisa estar logado para sugerir um novo sistema ao catálogo!');
      if (window.M && M.toast) {
        M.toast({ html: '<span>Faça login para enviar sugestões de sistemas!</span>', displayLength: 3000 });
      }
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
      return;
    }

    const nomeOk = this.validarCampoNome();
    const editoraOk = this.validarCampoEditora();
    const anoOk = this.validarCampoAno();
    const genero = $('#sugestao-genero').val();
    const mecanica = $('#sugestao-mecanica').val() || 'd20';
    const diretrizesOk = $('#sugestao-diretrizes').is(':checked');

    if (!nomeOk || !editoraOk || !anoOk || !genero) {
      this.exibirBanner('erro', 'Preencha todos os campos obrigatórios corretamente (Nome, Editora, Gênero e Ano de 4 dígitos).');
      return;
    }

    if (!diretrizesOk) {
      this.exibirBanner('erro', 'Confirme o aceite das diretrizes editoriais antes de enviar.');
      return;
    }

    // Objeto fiel à estrutura de "sugestoes" definida em docs/architecture.md
    const novaSugestao = {
      usuarioId: String(usuario.id),
      nomeSistema: $('#sugestao-nome').val().trim(),
      editora: $('#sugestao-editora').val().trim(),
      genero,
      ano: Number($('#sugestao-ano').val().trim()),
      mecanica,
      statusSugestao: 'PENDENTE',
      data: new Date().toISOString().split('T')[0],
    };

    const $btnSubmit = $('#btn-submit-sugestao');
    $btnSubmit.prop('disabled', true);

    try {
      await Api.criarSugestao(novaSugestao);
    } catch (erro) {
      console.warn('JSON Server offline ao enviar sugestão. Salvando no cache local:', erro);
      const locais = JSON.parse(localStorage.getItem('inessa_rpg_sugestoes_locais') || '[]');
      locais.push({
        id: String(Date.now()),
        ...novaSugestao,
      });
      localStorage.setItem('inessa_rpg_sugestoes_locais', JSON.stringify(locais));
    } finally {
      $btnSubmit.prop('disabled', false);
    }

    this.exibirBanner(
      'sucesso',
      `O tomo "${novaSugestao.nomeSistema}" foi enviado para a curadoria com status PENDENTE! O Administrador poderá aprová-lo no Painel de Moderação.`
    );

    if (window.M && M.toast) {
      M.toast({
        html: `<span>Sugestão <strong>${novaSugestao.nomeSistema}</strong> enviada para curadoria!</span>`,
        displayLength: 3500,
      });
    }

    $('#form-sugerir-sistema')[0].reset();
    $('.auth-input-box').removeClass('is-valid is-invalid');
    await this.carregarSugestoesRecentes();
  },

  configurarEventos() {
    $('#sugestao-nome').on('input blur', () => this.validarCampoNome());
    $('#sugestao-editora').on('input blur', () => this.validarCampoEditora());
    $('#sugestao-ano').on('input blur', () => this.validarCampoAno());

    $('#btn-limpar-sugestao').on('click', () => {
      $('.auth-input-box').removeClass('is-valid is-invalid');
      $('#sugestao-feedback-banner').removeClass('is-visible');
    });

    $('#form-sugerir-sistema').on('submit', (evento) => {
      this.processarEnvioSugestao(evento);
    });
  },
};

$(document).ready(() => {
  PaginaSugerir.init();
});

window.PaginaSugerir = PaginaSugerir;
