# 📄 Product Requirements Document (PRD) - Inessa RPG Reviews

## 1. Identificação

- **Autor:** Conrado
- **Projeto:** Inessa RPG Reviews

## 2. Visão Geral e Objetivo

O **Inessa RPG Reviews** é uma aplicação web onde jogadores e mestres de RPG de mesa podem registrar quais sistemas já jogaram, avaliá-los com nota e review, e explorar as opiniões de outros usuários antes de decidir qual sistema experimentar em sua próxima mesa.

**Problema que resolve:** hoje não existe um espaço centralizado e voltado especificamente para RPG de mesa onde jogadores possam comparar sistemas (D&D, Ordem Paranormal, PbtA, sistemas autorais etc.) por meio de avaliações reais de quem jogou ou mestrou, nem acompanhar o próprio "histórico" de sistemas experimentados — algo já comum em outras mídias (filmes, jogos, livros), mas ausente no nicho de RPG de mesa.

## 3. Atores do Sistema

- **Visitante:** usuário não autenticado que navega pelo catálogo de sistemas e lê reviews públicas.
- **Usuário:** usuário autenticado que avalia sistemas, escreve reviews, marca status de consumo (jogando / já jogou / quero jogar), indica se jogou como jogador ou como mestre, e pode sugerir novos sistemas para o catálogo.
- **Administrador/Moderador:** responsável por cadastrar manualmente os sistemas de RPG no catálogo, avaliar as sugestões de sistema enviadas pelos usuários e moderar (aprovar ou rejeitar) as reviews antes de ficarem públicas.
- **O Sistema (backend/API):** ator invisível que persiste usuários, sistemas de RPG e avaliações, calculando a nota média de cada sistema a partir das avaliações aprovadas.

## 4. Histórias de Usuário e Escopo

Funcionalidades do MVP, descritas sob a perspectiva do usuário final.

### 👤 Épico 1: Autenticação e Perfil

- **US01 - Cadastro:** Como um Visitante, quero preencher um formulário com nome, e-mail e senha para criar minha conta no Inessa RPG Reviews.
  - *Critérios de Aceitação:* todos os campos são obrigatórios; e-mail validado por formato; senha com tamanho mínimo.
- **US02 - Login:** Como um Usuário, quero inserir e-mail e senha para acessar minha conta e minhas avaliações.
- **US03 - Vitrine de Perfil:** Como um Usuário logado, quero ver em meu perfil a lista de sistemas que já avaliei, separados por status (jogando, já jogou, quero jogar) e por papel (jogador ou mestre), para mostrar minha trajetória com RPG.

### 📚 Épico 2: Catálogo de Sistemas

- **US04 - Listar Sistemas:** Como um Visitante, quero ver uma lista com todos os sistemas de RPG cadastrados, para descobrir novos sistemas para jogar.
  - *Critérios de Aceitação:* cada item mostra nome, gênero/mecânica principal e nota média.
- **US05 - Página do Sistema:** Como um Visitante, quero abrir a página de um sistema específico para ver sua ficha (editora, ano, gênero, mecânica), a nota média e as reviews escritas pela comunidade.
- **US06 - Buscar/Filtrar Sistemas:** Como um Visitante, quero buscar sistemas por nome ou filtrar por gênero/mecânica, para encontrar sistemas parecidos com o que gosto.
- **US07 - Sugerir Sistema:** Como um Usuário logado, quero enviar uma sugestão de sistema que ainda não está no catálogo (nome, editora, gênero), para que o Administrador avalie e cadastre.
- **US08 - Cadastrar Sistema (Admin):** Como um Administrador, quero cadastrar manualmente um novo sistema no catálogo, a partir de uma sugestão aprovada ou por iniciativa própria.

### ⭐ Épico 3: Avaliações e Reviews

- **US09 - Avaliar um Sistema:** Como um Usuário logado, quero dar uma nota (1 a 5) e escrever uma review de texto para um sistema que já joguei.
  - *Critérios de Aceitação:* nota obrigatória e dentro do intervalo permitido; review é opcional, mas se preenchida deve ter um tamanho mínimo; a review entra com status "pendente" até ser moderada.
- **US10 - Marcar Status e Papel:** Como um Usuário logado, quero marcar, para cada sistema, se estou jogando atualmente, se já joguei ou se quero jogar, e se minha experiência foi como jogador ou como mestre.
- **US11 - Visualizar Avaliações da Comunidade:** Como um Visitante, quero ler as reviews aprovadas de outros usuários na página do sistema, para decidir se quero experimentá-lo.
- **US12 - Moderar Reviews:** Como um Administrador, quero ver a lista de reviews pendentes e aprová-las ou rejeitá-las, para manter a qualidade do conteúdo publicado.
  - *Critérios de Aceitação:* apenas reviews aprovadas contam para a nota média do sistema e aparecem publicamente.
