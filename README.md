# 💫 DreamPage — Baú de Tesouros Pessoais

> O portal para as maravilhas desse mundo, um baú virtual para catalogar e organizar todos os seus filmes, séries, livros e jogos favoritos em um só lugar.

---

## 🌟 Sobre o Projeto

O **DreamPage** é uma aplicação web interativa e personalizada para gerenciamento de acervo pessoal de mídias. Ele funciona integrando o frontend diretamente ao **Firebase Realtime Database**, permitindo salvar, editar, buscar e categorizar itens em tempo real com persistência na nuvem.

---

## ✨ Funcionalidades

- 🔒 **Acesso Protegido**: Autenticação simples por palavra-chave para proteger seu baú de dados.

- 📂 **Categorização Organizada**: Divisão de mídias por seções principais (Filmes, Séries, Livros, Jogos) e subcategorias (Animados, Real-Life, Doramas, Animes, Webtoons, etc.).

- 🏷️ **Filtro por Status**: Acompanhamento de progresso dividido em:
  - **Finalizado**
  - **Em Processo**
  - **Um dia!**

- 🔤 **Ordenação Alfabética Automática**: Todos os itens cadastrados são ordenados automaticamente de A a Z dentro de cada subcategoria, ignorando diferenças de maiúsculas/minúsculas e acentuação em português.

- 🔍 **Busca Inteligente em Tempo Real**:
  - Pesquisa instantânea à medida que você digita.
  - Insensível a acentos (encontra *"Dálmatas"* digitando *"dalmatas"*).
  - Feedback visual caso nenhum item seja encontrado.

- 💭 **Comentários & Notas**:
  - Aba separada no modal de criação/edição dedicada a opiniões e anotações pessoais.
  - Indicador discreto (`💬`) nos cards quando há uma nota cadastrada (com visualização ao passar o mouse).

- ✏️ **Edição e Remoção Rápida**:
  - **Duplo clique** na capa do item para abrir a janela de edição.
  - Botão de exclusão rápida integrado ao card.

- 📱 **Interface Responsiva**: Modal duplo (*split*) ajustável que se adapta perfeitamente a telas de computadores e dispositivos móveis.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**: Estruturação semântica da aplicação.
* **CSS3**: Estilização moderna com variáveis CSS, efeitos *glassmorphism*, temas escuros e *layout flexbox/grid* responsivo.
* **JavaScript (ES6+)**: Lógica da aplicação, manipulação do DOM e ordenação/normalização de strings em tempo real.
* **Firebase Realtime Database**: Banco de dados NoSQL para sincronização e armazenamento em tempo real.

---

## 📁 Estrutura de Arquivos

```text
.
├── index.html   # Estrutura principal, modais e elementos visuais
├── geral.css    # Estilização completa do tema dark, responsividade e grids
└── script.js    # Lógica de integração Firebase, busca, ordenação e modais