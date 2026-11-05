/**
 * js/api.js
 * Centraliza a comunicação assíncrona com o JSON Server (porta 3000)
 * usando fetch() com tratamento de erros padronizado (IDs 22 e 23).
 */

const API_BASE_URL = 'http://localhost:3000';

const Api = {
  /**
   * Função auxiliar genérica para requisições HTTP na API fake.
   * Por quê: evita repetição de try/catch e cabeçalhos JSON em cada módulo.
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
    }
    return response.json();
  },

  // --- Rotas de Sistemas ---
  listarSistemas() {
    return this.request('/sistemas');
  },

  buscarSistemaPorId(id) {
    return this.request(`/sistemas/${encodeURIComponent(id)}`);
  },

  criarSistema(novoSistema) {
    return this.request('/sistemas', {
      method: 'POST',
      body: JSON.stringify(novoSistema),
    });
  },

  atualizarSistema(id, dadosParciais) {
    return this.request(`/sistemas/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(dadosParciais),
    });
  },

  // --- Rotas de Usuários ---
  listarUsuarios() {
    return this.request('/usuarios');
  },

  cadastrarUsuario(novoUsuario) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(novoUsuario),
    });
  },

  // --- Rotas de Avaliações ---
  listarAvaliacoes() {
    return this.request('/avaliacoes');
  },

  listarAvaliacoesPorSistema(sistemaId) {
    return this.request(`/avaliacoes?sistemaId=${encodeURIComponent(sistemaId)}`);
  },

  listarAvaliacoesPorUsuario(usuarioId) {
    return this.request(`/avaliacoes?usuarioId=${encodeURIComponent(usuarioId)}`);
  },

  listarAvaliacoesPendentes() {
    return this.request('/avaliacoes?statusModeracao=PENDENTE');
  },

  criarAvaliacao(novaAvaliacao) {
    return this.request('/avaliacoes', {
      method: 'POST',
      body: JSON.stringify(novaAvaliacao),
    });
  },

  moderarAvaliacao(id, statusModeracao) {
    return this.request(`/avaliacoes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ statusModeracao }),
    });
  },

  // --- Rotas de Sugestões ---
  listarSugestoes() {
    return this.request('/sugestoes');
  },

  criarSugestao(novaSugestao) {
    return this.request('/sugestoes', {
      method: 'POST',
      body: JSON.stringify(novaSugestao),
    });
  },

  moderarSugestao(id, statusSugestao) {
    return this.request(`/sugestoes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ statusSugestao }),
    });
  },
};

window.Api = Api;
