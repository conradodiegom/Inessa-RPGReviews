# inessa-rpg-reviews

### **Autor:** Conrado

Este projeto tem como objetivo implementar progressivamente e de forma didática uma aplicação web onde jogadores e mestres de RPG de mesa podem registrar os sistemas que já jogaram, avaliá-los com nota e review, e explorar as avaliações de outros usuários em uma vitrine de perfil.

O frontend da aplicação foi desenvolvido com HTML, CSS e JavaScript e o backend foi simulado pela implementação de uma API Fake, usando o JSON Server.

## 📚 Documentação do Projeto

Para entender as regras de negócio, o escopo e a arquitetura técnica da aplicação, consulte os documentos abaixo:

- [📄 Product Requirements Document (PRD)](./docs/prd.md) - Visão geral, atores e histórias de usuário.
- [🛠️ Especificação Técnica (Architecture)](./docs/architecture.md) - Diagrama de banco de dados (DER), dicionário de dados e rotas da API (JSON Server).

## 💻 Tecnologias e Dependências

- **Framework CSS:** MaterializeCSS
- **JavaScript:**
  - **JSON Server** - para simular uma API REST.

## ✅ Checklist | Indicadores de Desempenho (ID) dos Resultados de Aprendizagem (RA)

#### RA1 - Utilizar Frameworks CSS para estilização de elementos HTML e criação de layouts responsivos.

- [ ] ID 01 - Prototipa interfaces adaptáveis para no mínimo os tamanhos de tela mobile e desktop, usando ferramentas de design tradicionais (Figma, Quant UX ou Sketch) ou IA (Stitch).
- [ ] ID 02 - Implementa layout responsivo com Framework CSS (Bootstrap, Materialize, Tailwind + DaisyUI) usando Flexbox ou Grid do próprio framework.
- [ ] ID 03 - Implementa layout responsivo com CSS puro, usando Flexbox ou Grid Layout.
- [ ] ID 04 - Utiliza componentes prontos de um Framework CSS (ex.: card, button) e componentes JavaScript do framework (ex.: modal, carousel).
- [ ] ID 05 - Cria layout fluido usando unidades relativas (vw, vh, %, em, rem) no lugar de unidades fixas (px).
- [ ] ID 06 - Aplica um Design System consistente (cores, tipografia, padrões de componentes) em toda a aplicação.
- [ ] ID 07 - Utiliza Sass (SCSS) com ou sem framework, aplicando variáveis, mixins e funções para modularizar o código.
- [ ] ID 08 - Aplica tipografia responsiva (media queries mobile first) ou tipografia fluida (função clamp() + unidades relativas).
- [ ] ID 09 - Aplica técnicas de responsividade de imagens usando CSS (object-fit, containers com unidades relativas).
- [ ] ID 10 - Otimiza imagens usando formatos modernos (WebP) e carregamento adaptativo (srcset, picture, ou parâmetros do Cloudinary).

#### RA2 - Realizar tratamento de formulários e aplicar validações customizadas no lado cliente.

- [ ] ID 11 - Implementa validação HTML nativa (campos obrigatórios, tipos, limites de caracteres) com mensagens de erro/sucesso no lado cliente.
- [ ] ID 12 - Aplica expressões regulares (REGEX) para validações customizadas (e-mail, telefone, datas, etc.)
- [ ] ID 13 - Utiliza elementos de seleção em formulários (checkbox, radio, select) para coleta de dados.
- [ ] ID 14 - Implementa leitura e escrita no Web Storage (localStorage/sessionStorage) para persistir dados localmente.

#### RA3 - Aplicar ferramentas para otimização do processo de desenvolvimento web.

- [ ] ID 15 - Configura ambiente com Node.js e NPM para gerenciamento de pacotes e dependências.
- [ ] ID 16 - Utiliza boas práticas de versionamento no Git/GitHub (branch main ou branches específicos, uso de .gitignore).
- [ ] ID 17 - Mantém um README.md padronizado, conforme template da disciplina, com checklist preenchido.
- [ ] ID 18 - Organiza arquivos do projeto de forma modular, seguindo padrão de exemplo fornecido.
- [ ] ID 19 - Configura linters e formatadores (ESLint, Prettier) para manter qualidade e padronização do código.

#### RA4 - Aplicar bibliotecas de funções e componentes em JavaScript para aprimorar a interatividade de páginas web.

- [ ] ID 20 - Utiliza jQuery para manipulação do DOM e interatividade (eventos, animações, manipulação de elementos)
- [ ] ID 21 - Integra e configura um plugin jQuery relevante (ex.: jQuery Mask Plugin).

#### RA5 - Efetuar requisições assíncronas para uma API fake e APIs públicas, permitindo a obtenção e manipulação de dados dinamicamente.

- [ ] ID 22 - Realiza requisições assíncronas para uma API fake (ex.: JSON Server) para persistir dados de um formulário.
- [ ] ID 23 - Realiza requisições assíncronas para uma API fake para exibir dados na página.
- [ ] ID 24 - Realiza requisições assíncronas para APIs públicas reais (OpenWeather, ViaCEP etc.), exibindo os dados e tratando erros.

## 🚀 Manual de execução

- Clonar o repositório com `git clone`
- Abrir o projeto no editor de sua preferência
- Instalar as dependências contidas no `package.json`: `npm i`
- Executar a API Fake (JSON Server): `json-server --watch db.json`
- Executar o projeto frontend.
