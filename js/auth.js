/**
 * js/auth.js
 * Gerencia a sessão do usuário no localStorage (ID 14), atualiza a Navbar/Rodapé
 * dinamicamente com jQuery (ID 20) e implementa a tela de Cadastro e Login (Etapa 4)
 * com validação HTML5 nativa + REGEX de e-mail e senha (IDs 11 e 12) e persistência
 * no JSON Server via POST /usuarios (ID 22).
 */

const STORAGE_KEY_SESSAO = 'inessa_usuario_logado';

/**
 * Expressões Regulares (REGEX) para validações customizadas no lado cliente (ID 12):
 * - REGEX_EMAIL: valida formato padrão usuario@dominio.tld
 * - REGEX_SENHA: exige ao menos 6 caracteres, contendo letras ou números/símbolos sem espaços
 * - REGEX_NOME: exige ao menos 3 caracteres alfabéticos (nome do aventureiro)
 */
const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGEX_SENHA = /^[^\s]{6,40}$/;
const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']{3,60}$/;

const Auth = {
  /**
   * Usuários de fallback caso o JSON Server esteja desligado no momento do teste.
   */
  usuariosFallback: [
    { id: '1', nome: 'Ana Mestra', email: 'ana@email.com', senha: 'senha_super_segura', tipo: 'USUARIO' },
    { id: '2', nome: 'Admin Poço Penumbra', email: 'admin@inessarpgreviews.com', senha: 'senha_super_segura', tipo: 'ADMIN' },
    { id: '3', nome: 'Lucas Valente', email: 'lucas@email.com', senha: 'senha_super_segura', tipo: 'USUARIO' },
  ],

  /**
   * Lê os dados do usuário autenticado salvos no localStorage (ID 14).
   */
  obterUsuarioLogado() {
    try {
      const dados = localStorage.getItem(STORAGE_KEY_SESSAO);
      return dados ? JSON.parse(dados) : null;
    } catch (erro) {
      console.error('Erro ao ler sessão do localStorage:', erro);
      return null;
    }
  },

  obterUsuarioSessao() {
    return this.obterUsuarioLogado();
  },

  /**
   * Salva o objeto do usuário autenticado no localStorage (ID 14).
   */
  salvarSessao(usuario) {
    const sessaoSegura = {
      id: String(usuario.id),
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo || 'USUARIO',
      papelPreferencial: usuario.papelPreferencial || 'MESTRE',
    };
    localStorage.setItem(STORAGE_KEY_SESSAO, JSON.stringify(sessaoSegura));
  },

  /**
   * Remove a sessão do usuário e redireciona para a página inicial.
   */
  encerrarSessao() {
    localStorage.removeItem(STORAGE_KEY_SESSAO);
    window.location.href = this.obterPrefixoRota() + 'index.html';
  },

  /**
   * Verifica se o usuário logado possui perfil de Administrador.
   */
  ehAdmin() {
    const usuario = this.obterUsuarioLogado();
    return Boolean(usuario && usuario.tipo === 'ADMIN');
  },

  obterPrefixoRota() {
    return window.location.pathname.includes('/pages/') ? '../' : '';
  },

  /**
   * Atualiza os elementos de navegação conforme o estado de login (Visitante, Usuário ou Admin).
   */
  atualizarInterfaceSessao() {
    const usuario = this.obterUsuarioLogado();
    const prefixo = this.obterPrefixoRota();
    const $acoesVisitante = $('#nav-guest-actions');
    const $acoesUsuario = $('#nav-user-actions');
    const $itemAdmin = $('.nav-admin-only');
    const $iniciaisAvatar = $('.js-user-initials');
    const $nomeUsuario = $('#nav-user-name');

    if (usuario) {
      $acoesVisitante.hide();
      $acoesUsuario.css('display', 'flex');

      const inicial = usuario.nome ? usuario.nome.trim().charAt(0).toUpperCase() : 'U';
      $iniciaisAvatar.text(inicial);
      $nomeUsuario.text(usuario.nome.split(' ')[0]);

      if (usuario.tipo === 'ADMIN') {
        $itemAdmin.show();
      } else {
        $itemAdmin.hide();
      }
    } else {
      $acoesVisitante.css('display', 'flex');
      $acoesUsuario.hide();
      $itemAdmin.hide();
      $iniciaisAvatar.html('<i class="material-icons" style="font-size: 1.1rem;">person_outline</i>');
    }

    $('#btn-logout').off('click').on('click', (evento) => {
      evento.preventDefault();
      this.encerrarSessao();
    });

    $('#header-search-form').off('submit').on('submit', (evento) => {
      evento.preventDefault();
      const termo = $('#header-search-input').val().trim();
      if (termo) {
        window.location.href = `${prefixo}index.html?q=${encodeURIComponent(termo)}`;
      }
    });
  },

  /**
   * Atualiza visualmente um campo customizado com mensagem de erro ou sucesso (ID 11).
   */
  definirEstadoCampo($input, valido, mensagem) {
    const $box = $input.closest('.auth-input-box');
    const $helper = $input.closest('.auth-field-group').find('.auth-field-helper');

    if (valido) {
      $box.removeClass('is-invalid').addClass('is-valid');
      $helper.removeClass('is-error').addClass('is-success').text(mensagem);
    } else {
      $box.removeClass('is-valid').addClass('is-invalid');
      $helper.removeClass('is-success').addClass('is-error').text(mensagem);
    }
  },

  /**
   * Valida um campo individualmente combinando HTML5 Constraint Validation API (ID 11)
   * e Expressões Regulares REGEX (ID 12).
   */
  validarCampo($input) {
    const elemento = $input[0];
    const valor = ($input.val() || '').trim();
    const tipoValidacao = $input.data('validate');

    // 1. Validação HTML5 nativa (required, minlength, maxlength, type)
    if (elemento && elemento.validity && elemento.validity.valueMissing) {
      this.definirEstadoCampo($input, false, 'Este campo é obrigatório.');
      return false;
    }

    // 2. Validação customizada com REGEX (ID 12)
    if (tipoValidacao === 'email') {
      if (!REGEX_EMAIL.test(valor)) {
        this.definirEstadoCampo($input, false, 'Formato de e-mail inválido (ex: aventureiro@email.com).');
        return false;
      }
      this.definirEstadoCampo($input, true, 'E-mail válido e verificado.');
      return true;
    }

    if (tipoValidacao === 'senha') {
      if (!REGEX_SENHA.test(valor)) {
        this.definirEstadoCampo($input, false, 'A senha deve ter no mínimo 6 caracteres e não conter espaços.');
        return false;
      }
      this.definirEstadoCampo($input, true, 'Formato de senha seguro.');
      return true;
    }

    if (tipoValidacao === 'nome') {
      if (!REGEX_NOME.test(valor)) {
        this.definirEstadoCampo($input, false, 'Informe seu nome ou título (mínimo de 3 letras).');
        return false;
      }
      this.definirEstadoCampo($input, true, 'Nome de aventureiro válido!');
      return true;
    }

    return true;
  },

  /**
   * Inicializa os eventos e formulários caso estejamos na página pages/login.html.
   */
  inicializarPaginaLogin() {
    if ($('#auth-page-container').length === 0) return;

    // Se a URL tiver #cadastro, abre diretamente a aba "Criar Conta"
    if (window.location.hash === '#cadastro') {
      this.alternarAba('cadastro');
    }

    // Alternância entre abas "Entrar" e "Criar Conta"
    $('.js-auth-tab').on('click', (evento) => {
      const aba = $(evento.currentTarget).data('tab');
      this.alternarAba(aba);
    });

    // Alternância de pílulas de Perfil Preferencial (Mestre vs Jogador)
    $('.js-role-pill').on('click', (evento) => {
      const $pill = $(evento.currentTarget);
      const $grupo = $pill.closest('.auth-role-strip__pills');
      $grupo.find('.js-role-pill').removeClass('active');
      $pill.addClass('active');
      const papel = $pill.data('role');
      $('#login-preferred-role, #register-preferred-role').val(papel);
    });

    // Botão de mostrar/ocultar senha (olho)
    $('.js-toggle-password').on('click', (evento) => {
      const $btn = $(evento.currentTarget);
      const $input = $btn.closest('.auth-input-box').find('input');
      const $icon = $btn.find('i.material-icons');

      if ($input.attr('type') === 'password') {
        $input.attr('type', 'text');
        $icon.text('visibility_off');
      } else {
        $input.attr('type', 'password');
        $icon.text('visibility');
      }
    });

    // Validação em tempo real (blur / input) para feedback imediato (IDs 11 e 12)
    $('#form-login input[data-validate], #form-register input[data-validate]').on('blur input', (evento) => {
      this.validarCampo($(evento.currentTarget));
    });

    // Atalhos didáticos de preenchimento rápido (Usuária Ana Mestra ou Admin)
    $('.js-quick-fill').on('click', (evento) => {
      const $btn = $(evento.currentTarget);
      const email = $btn.data('email');
      const senha = $btn.data('senha');
      this.alternarAba('login');
      $('#login-email').val(email).trigger('input');
      $('#login-password').val(senha).trigger('input');
    });

    // Submissão do Formulário de Login (US02)
    $('#form-login').on('submit', async (evento) => {
      evento.preventDefault();
      const emailValido = this.validarCampo($('#login-email'));
      const senhaValida = this.validarCampo($('#login-password'));

      if (!emailValido || !senhaValida) return;

      const email = $('#login-email').val().trim().toLowerCase();
      const senha = $('#login-password').val().trim();
      const papelPreferencial = $('#login-preferred-role').val() || 'MESTRE';
      const $feedback = $('#auth-global-feedback');

      $feedback.hide();

      let listaUsuarios = [];
      try {
        listaUsuarios = await Api.listarUsuarios();
      } catch (erro) {
        console.warn('JSON Server offline no login; consultando lista local:', erro);
        listaUsuarios = this.usuariosFallback;
      }

      const usuarioEncontrado = listaUsuarios.find(
        (u) => (u.email || '').toLowerCase() === email && u.senha === senha
      );

      if (!usuarioEncontrado) {
        $feedback
          .css({ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' })
          .html('<strong>Credenciais inválidas:</strong> E-mail ou senha não conferem no grimório.')
          .fadeIn(200);
        return;
      }

      this.salvarSessao({ ...usuarioEncontrado, papelPreferencial });

      $feedback
        .css({ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' })
        .html(`<strong>Bem-vindo(a), ${usuarioEncontrado.nome}!</strong> Redirecionando para sua vitrine...`)
        .fadeIn(200);

      setTimeout(() => {
        window.location.href = usuarioEncontrado.tipo === 'ADMIN' ? 'admin.html' : 'perfil.html';
      }, 700);
    });

    // Submissão do Formulário de Cadastro (US01 - POST /usuarios no JSON Server - ID 22)
    $('#form-register').on('submit', async (evento) => {
      evento.preventDefault();
      const nomeValido = this.validarCampo($('#register-name'));
      const emailValido = this.validarCampo($('#register-email'));
      const senhaValida = this.validarCampo($('#register-password'));
      const termosAceitos = $('#register-terms').is(':checked');
      const $feedback = $('#auth-global-feedback');

      if (!nomeValido || !emailValido || !senhaValida) return;

      if (!termosAceitos) {
        $feedback
          .css({ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' })
          .html('<strong>Atenção:</strong> Confirme o Código de Conduta do Aventureiro para criar sua conta.')
          .fadeIn(200);
        return;
      }

      const novoUsuarioPayload = {
        nome: $('#register-name').val().trim(),
        email: $('#register-email').val().trim().toLowerCase(),
        senha: $('#register-password').val().trim(),
        tipo: 'USUARIO',
      };

      const papelPreferencial = $('input[name="registerRole"]:checked').val() || 'JOGADOR';

      try {
        // Verifica se já existe usuário com o mesmo e-mail na API
        const existentes = await Api.listarUsuarios();
        if (existentes.some((u) => (u.email || '').toLowerCase() === novoUsuarioPayload.email)) {
          this.definirEstadoCampo($('#register-email'), false, 'Este e-mail já está cadastrado.');
          return;
        }

        // Persiste no JSON Server via POST /usuarios (ID 22)
        const usuarioCriado = await Api.cadastrarUsuario(novoUsuarioPayload);
        this.salvarSessao({ ...usuarioCriado, papelPreferencial });

        $feedback
          .css({ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' })
          .html(`<strong>Conta criada com sucesso!</strong> Bem-vindo(a) à guilda, ${usuarioCriado.nome}!`)
          .fadeIn(200);

        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 800);
      } catch (erro) {
        console.warn('JSON Server indisponível ao cadastrar; salvando sessão localmente:', erro);
        const usuarioLocal = {
          id: String(Date.now()),
          ...novoUsuarioPayload,
          papelPreferencial,
        };
        this.salvarSessao(usuarioLocal);

        $feedback
          .css({ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' })
          .html(`<strong>Conta registrada na sessão local!</strong> Redirecionando para sua vitrine...`)
          .fadeIn(200);

        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 800);
      }
    });
  },

  alternarAba(aba) {
    $('.js-auth-tab').removeClass('active');
    $(`.js-auth-tab[data-tab="${aba}"]`).addClass('active');
    $('#auth-global-feedback').hide();

    if (aba === 'cadastro') {
      $('#view-login').hide();
      $('#view-register').fadeIn(180);
    } else {
      $('#view-register').hide();
      $('#view-login').fadeIn(180);
    }
  },
};

$(document).ready(() => {
  Auth.atualizarInterfaceSessao();
  Auth.inicializarPaginaLogin();
});

window.Auth = Auth;
