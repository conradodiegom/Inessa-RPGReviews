# inessa-rpg-reviews

### **Autor:** Conrado

Este projeto tem como objetivo implementar progressivamente e de forma didática uma aplicação web onde jogadores e mestres de RPG de mesa podem registrar os sistemas que já jogaram, avaliá-los com nota e review, e explorar as avaliações de outros usuários em uma vitrine de perfil.

O frontend da aplicação foi desenvolvido com HTML, CSS e JavaScript e o backend foi simulado pela implementação de uma API Fake, usando o JSON Server.

## 📚 Documentação do Projeto

Para entender as regras de negócio, o escopo e a arquitetura técnica da aplicação, consulte os documentos abaixo:

- [📄 Product Requirements Document (PRD)](./docs/prd.md) - Visão geral, atores e histórias de usuário.
- [🛠️ Especificação Técnica (Architecture)](./docs/architecture.md) - Diagrama de banco de dados (DER), dicionário de dados e rotas da API (JSON Server).

## 🎨 Design

- [🖼️ Protótipo no Stitch](https://stitch.google.com/projects/6829441051223243915) - Telas da aplicação nas versões mobile e desktop.
- [🎨 Protótipo no Figma](https://www.figma.com/design/irXklBepiUmCvuS6FGtal6/Sem-t%C3%ADtulo?node-id=0-1) - Telas de alta fidelidade Mobile e Desktop do sistema.

## 💻 Tecnologias e Dependências

- **Framework CSS:** MaterializeCSS 1.0.0 (via CDN)
- **JavaScript:**
  - **jQuery 3.7.1 + jQuery Mask Plugin 1.14.16** - para manipulação do DOM, interatividade e máscaras de formulário.
  - **JSON Server 0.17.4** - para simular uma API REST (`db.json` na porta `3000`).
  - **D&D 5e API** - API pública (`https://www.dnd5eapi.co/api`) para consumir dados de referência de RPG (classes e magias do SRD).

### Por que MaterializeCSS?

- **Componentes prontos que o projeto realmente usa:** cards (sistemas e reviews), modal (formulário de avaliação), tabs (perfil do usuário e painel de moderação), chips (filtros de gênero e mecânica), badges, toasts e campos de formulário com mensagens de validação.
- **Layout responsivo mobile-first:** o grid de 12 colunas com classes como `s12 m6 l4` permite adaptar o catálogo de sistemas de 1 coluna no celular para 3 no desktop, sem escrever CSS de layout do zero.
- **Componentes JavaScript do próprio framework:** modal, tabs e toasts, que dão interatividade com pouco código.
- **Personalização por variáveis:** as cores e fontes do design system (*Grimório Editorial* em pergaminho `#FAF6F0`, carmesim `#7C1D1D` e âmbar `#FEB300`) são organizadas em variáveis CSS (`:root`), mantendo a identidade visual consistente em todas as telas.
- **Material Design:** padrão visual conhecido e familiar ao usuário, com boa legibilidade em formulários, listas e cards, que são a base deste projeto.
- **Curva de aprendizado baixa:** documentação simples e adotada como referência na disciplina (exemplo Roubank), o que facilita o desenvolvimento progressivo.

### Por que a D&D 5e API?

- **Tema alinhado ao projeto:** o Inessa RPG Reviews é sobre sistemas de RPG, e a API fornece dados de referência do D&D 5e (classes, magias, monstros, raças e equipamentos).
- **Gratuita e sem autenticação:** não exige chave de API, o que simplifica o desenvolvimento e evita expor credenciais no front-end.
- **REST com JSON:** fácil de consumir com `fetch`, sem backend próprio.
- **Uso no projeto:** na página do sistema "Dungeons & Dragons 5e" (`pages/sistema.html?id=4`), a seção "Conteúdo de Referência Oficial (SRD 5e)" lista classes e magias vindas da API em tempo real, com mensagem de erro amigável caso a requisição falhe.

## ✅ Checklist | Indicadores de Desempenho (ID) dos Resultados de Aprendizagem (RA)

#### RA1 - Utilizar Frameworks CSS para estilização de elementos HTML e criação de layouts responsivos.

- [x] ID 01 - Prototipa interfaces adaptáveis para no mínimo os tamanhos de tela mobile e desktop, usando ferramentas de design tradicionais (Figma, Quant UX ou Sketch) ou IA (Stitch).
- [x] ID 02 - Implementa layout responsivo com Framework CSS (Bootstrap, Materialize, Tailwind + DaisyUI) usando Flexbox ou Grid do próprio framework.
- [x] ID 03 - Implementa layout responsivo com CSS puro, usando Flexbox ou Grid Layout.
- [x] ID 04 - Utiliza componentes prontos de um Framework CSS (ex.: card, button) e componentes JavaScript do framework (ex.: modal, carousel).
- [x] ID 05 - Cria layout fluido usando unidades relativas (vw, vh, %, em, rem) no lugar de unidades fixas (px).
- [x] ID 06 - Aplica um Design System consistente (cores, tipografia, padrões de componentes) em toda a aplicação.
- [ ] ID 07 - Utiliza Sass (SCSS) com ou sem framework, aplicando variáveis, mixins e funções para modularizar o código.
- [x] ID 08 - Aplica tipografia responsiva (media queries mobile first) ou tipografia fluida (função clamp() + unidades relativas).
- [x] ID 09 - Aplica técnicas de responsividade de imagens usando CSS (object-fit, containers com unidades relativas).
- [x] ID 10 - Otimiza imagens usando formatos modernos (WebP) e carregamento adaptativo (srcset, picture, ou parâmetros do Cloudinary).

#### RA2 - Realizar tratamento de formulários e aplicar validações customizadas no lado cliente.

- [x] ID 11 - Implementa validação HTML nativa (campos obrigatórios, tipos, limites de caracteres) com mensagens de erro/sucesso no lado cliente.
- [x] ID 12 - Aplica expressões regulares (REGEX) para validações customizadas (e-mail, telefone, datas, etc.)
- [x] ID 13 - Utiliza elementos de seleção em formulários (checkbox, radio, select) para coleta de dados.
- [x] ID 14 - Implementa leitura e escrita no Web Storage (localStorage/sessionStorage) para persistir dados localmente.

#### RA3 - Aplicar ferramentas para otimização do processo de desenvolvimento web.

- [x] ID 15 - Configura ambiente com Node.js e NPM para gerenciamento de pacotes e dependências.
- [x] ID 16 - Utiliza boas práticas de versionamento no Git/GitHub (branch main ou branches específicos, uso de .gitignore).
- [x] ID 17 - Mantém um README.md padronizado, conforme template da disciplina, com checklist preenchido.
- [x] ID 18 - Organiza arquivos do projeto de forma modular, seguindo padrão de exemplo fornecido.
- [x] ID 19 - Configura linters e formatadores (ESLint, Prettier) para manter qualidade e padronização do código.

#### RA4 - Aplicar bibliotecas de funções e componentes em JavaScript para aprimorar a interatividade de páginas web.

- [x] ID 20 - Utiliza jQuery para manipulação do DOM e interatividade (eventos, animações, manipulação de elementos)
- [x] ID 21 - Integra e configura um plugin jQuery relevante (ex.: jQuery Mask Plugin).

#### RA5 - Efetuar requisições assíncronas para uma API fake e APIs públicas, permitindo a obtenção e manipulação de dados dinamicamente.

- [x] ID 22 - Realiza requisições assíncronas para uma API fake (ex.: JSON Server) para persistir dados de um formulário.
- [x] ID 23 - Realiza requisições assíncronas para uma API fake para exibir dados na página.
- [x] ID 24 - Realiza requisições assíncronas para APIs públicas reais (OpenWeather, ViaCEP etc.), exibindo os dados e tratando erros.

## 🚀 Manual de Execução

1. Clonar o repositório com `git clone`
2. Abrir o projeto no editor de sua preferência
3. Instalar as dependências contidas no `package.json`:
   ```bash
   npm install
   ```
4. Executar a API Fake (JSON Server na porta `3000`):
   ```bash
   npm run api
   ```
5. Servir o frontend com o **Live Server** (VS Code) ou com `python3 -m http.server 5500` e acessar `http://localhost:5500`.

### 🔑 Credenciais de Teste (`db.json`)

- **Usuária Jogadora/Mestre:** `ana@email.com` | Senha: `senha_super_segura`
- **Administrador (Moderação):** `admin@inessarpgreviews.com` | Senha: `senha_super_segura`
