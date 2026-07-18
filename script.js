// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBnBN7t588RgDT6pC_u0X7Lwnhh--SimGI",
    authDomain: "dream-page-c539b.firebaseapp.com",
    databaseURL: "https://dream-page-c539b-default-rtdb.firebaseio.com",
    projectId: "dream-page-c539b",
    storageBucket: "dream-page-c539b.firebasestorage.app",
    messagingSenderId: "796088572727",
    appId: "1:796088572727:web:8a568c473e0e14bcb998b2"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const PALAVRA_CHAVE = "nostalgia";

let meusItens = [];

// Variáveis de controle de navegação
let currentPageContext = '';
let currentCategoryContext = '';

// ESCUTA ATIVA DO FIREBASE: Atualiza em tempo real em todos os dispositivos logados
database.ref('dreamPageItems').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Converte o objeto do Firebase de volta para uma Array
        meusItens = Object.keys(data).map(key => ({
            firebaseKey: key, // guardamos a chave gerada pelo firebase para exclusão posterior
            ...data[key]
        }));
    } else {
        meusItens = [];
    }
    renderItems(); // Re-renderiza a tela sempre que houver mudanças no banco
});

function checkPassword() {
    const input = document.getElementById('password-input').value.toLowerCase().trim();
    if (input === PALAVRA_CHAVE) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('add-floating-btn').style.display = 'flex';
        renderItems();
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

/* 1. Altera a página principal (CORRIGIDA) */
function switchPage(pageId, button) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    if(button) button.classList.add('active');
    
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('main-nav').style.display = 'flex';

    // CORREÇÃO: Não limpamos mais os contextos globais aqui para evitar que o fluxo automático de salvamento quebre
    document.getElementById('search-input').value = '';
}

/* 2. Navegação MANUAL para a página de Categoria específica (CORRIGIDA) */
function openSubPage(page, category) {
    // Definimos os contextos ANTES de renderizar
    currentPageContext = page;
    currentCategoryContext = category;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('subpage-view').classList.add('active');
    document.getElementById('main-nav').style.display = 'none';
    
    const backBtn = document.getElementById('back-btn');
    backBtn.style.display = 'inline-block';
    
    // Ao voltar manualmente pelo botão, limpamos os contextos para resetar o estado das subpáginas
    backBtn.onclick = function() {
        switchPage(page, document.querySelector(`[onclick*="${page}"]`));
        currentPageContext = '';
        currentCategoryContext = '';
    };

    document.getElementById('subpage-title').textContent = `${page.toUpperCase()} > ${category.toUpperCase()}`;

    renderItems();
    filterStatusView('visto');
}

/* 3. Alterna entre as abas de Status */
function filterStatusView(status) {
    document.querySelectorAll('.status-container-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.status-nav-btn').forEach(btn => btn.classList.remove('active'));

    const statusContent = document.getElementById(`status-content-${status}`);
    const statusBtn = document.getElementById(`btn-status-${status}`);
    
    if (statusContent) statusContent.style.display = 'block';
    if (statusBtn) statusBtn.classList.add('active');
}

/* 4. RENDERIZAR ITENS (VERSÃO CORRIGIDA E À PROVA DE FALHAS) */
function renderItems() {
    // Garante que os elementos existem na tela antes de limpar
    const gridVisto = document.getElementById('grid-visto');
    const gridNaovisto = document.getElementById('grid-naovisto');
    const gridEmprocesso = document.getElementById('grid-emprocesso');

    if (gridVisto) gridVisto.innerHTML = '';
    if (gridNaovisto) gridNaovisto.innerHTML = '';
    if (gridEmprocesso) gridEmprocesso.innerHTML = '';

    // Se não houver uma página ou categoria selecionada no clique, não renderiza as subpáginas
    if (!currentPageContext || !currentCategoryContext) return;

    meusItens.forEach(item => {
        // Verifica se as propriedades essenciais existem no item vindo do banco
        if (
            item.page && item.category && item.status && item.name
        ) {
            // Força tudo para minúsculas e remove espaços para bater com os contextos
            const itemPage = item.page.toLowerCase().trim();
            const itemCategory = item.category.toLowerCase().trim();
            
            // Corrige mapeamentos antigos caso o banco tenha salvo textos diferentes
            let itemStatus = item.status.toLowerCase().trim();
            if (itemStatus === 'finalizado') itemStatus = 'visto';
            if (itemStatus === 'em processo') itemStatus = 'emprocesso';
            if (itemStatus === 'um dia!') itemStatus = 'naovisto';

            if (
                itemPage === currentPageContext.toLowerCase().trim() &&
                itemCategory === currentCategoryContext.toLowerCase().trim()
            ) {
                // Tenta buscar o grid correspondente (grid-visto, grid-emprocesso ou grid-naovisto)
                const gridContainer = document.getElementById(`grid-${itemStatus}`);

                // SEGURANÇA: Só insere o card se o container correspondente realmente existir no HTML
                if (gridContainer) {
                    const card = document.createElement('div');
                    card.className = 'item-card';
                    card.setAttribute('data-name', item.name.toLowerCase());
                    card.innerHTML = `
                        <button class="delete-btn" onclick="deleteItem('${item.firebaseKey}')">✕</button>
                        <img class="item-image" src="${item.image}" alt="Capa">
                        <div class="item-info">
                            <p class="item-name">${item.name}</p>
                            ${item.link ? `<a href="${item.link}" target="_blank" class="item-link">Acessar</a>` : `<span style='font-size:0.8rem; text-align:center; color:gray;'>Sem link</span>`}
                        </div>
                    `;
                    gridContainer.appendChild(card);
                }
            }
        }
    });
}

/* 5. LÓGICA DE PESQUISA GLOBAL */
function filterItems() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (query === '') {
        renderItems();
        return;
    }

    const itemEncontrado = meusItens.find(item => item.name && item.name.toLowerCase().includes(query));

    if (itemEncontrado) {
        currentPageContext = itemEncontrado.page;
        currentCategoryContext = itemEncontrado.category;

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('subpage-view').classList.add('active');
        document.getElementById('main-nav').style.display = 'none';

        const backBtn = document.getElementById('back-btn');
        backBtn.style.display = 'inline-block';
        backBtn.onclick = function() {
            switchPage(itemEncontrado.page, document.querySelector(`[onclick*="${itemEncontrado.page}"]`));
        };

        document.getElementById('subpage-title').textContent = `${itemEncontrado.page.toUpperCase()} > ${itemEncontrado.category.toUpperCase()}`;

        renderItems();
        filterStatusView(itemEncontrado.status);

        document.querySelectorAll('.item-card').forEach(card => {
            const itemName = card.getAttribute('data-name');
            if (itemName && itemName.includes(query)) {
                card.style.display = 'flex';
                card.style.border = '2px solid var(--success-color)';
                card.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.4)';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

const categoriasPorPagina = {
    filmes: ["animados", "real", "doramas", "animes"],
    series: ["desenhos", "animes", "novelas", "real", "doramas"],
    livros: ["fisico", "webtoon", "manga", "bgl"],
    jogos: ["geral"]
};

function updateFormCategories() {
    const page = document.getElementById('form-page').value;
    const catSelect = document.getElementById('form-category');
    catSelect.innerHTML = '';
    if (categoriasPorPagina[page]) {
        categoriasPorPagina[page].forEach(cat => {
            let opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat.toUpperCase();
            catSelect.appendChild(opt);
        });
    }
}

function openModal() {
    document.getElementById('item-modal').style.display = 'flex';
    // CORREÇÃO: Garante o valor padrão inicial ao abrir para popular as categorias dinâmicas corretamente
    document.getElementById('form-page').value = 'filmes';
    updateFormCategories();
}

function closeModal() {
    document.getElementById('item-modal').style.display = 'none';
    document.getElementById('form-name').value = '';
    document.getElementById('form-image').value = '';
    document.getElementById('form-link').value = '';
}

/* SALVAR NO FIREBASE (CORRIGIDA E HIGIENIZADA) */
function addItem() {
    const name = document.getElementById('form-name').value.trim();
    let image = document.getElementById('form-image').value.trim();
    const link = document.getElementById('form-link').value.trim();
    
    // CORREÇÃO: Força letras minúsculas ao extrair valores do formulário para evitar erros no filtro do renderItems
    const page = document.getElementById('form-page').value.toLowerCase();
    const category = document.getElementById('form-category').value.toLowerCase();
    const status = document.getElementById('form-status').value.toLowerCase();

    if (!name) return alert("Por favor, digite um nome!");
    if (!image) image = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"; 

    const newItem = { id: Date.now(), name, image, link, page, category, status };
    
    // Envia o item para o Firebase
    database.ref('dreamPageItems').push(newItem);
    
    closeModal();
    
    // Define os contextos globais ativos baseados no novo item criado
    currentPageContext = page;
    currentCategoryContext = category;
    
    // Abre o ecrã correspondente ao item criado e muda para a aba de status dele
    openSubPage(page, category);
    filterStatusView(status);
}

/* DELETAR NO FIREBASE */
function deleteItem(firebaseKey) {
    if(confirm("Tem certeza que deseja apagar este item?")) {
        database.ref(`dreamPageItems/${firebaseKey}`).remove();
    }
}

// Sincronização das Notas de sentimento com o Firebase
if(document.getElementById('feeling-notes')) {
    database.ref('dreamPageNotes').once('value').then((snapshot) => {
        if(snapshot.val()) {
            document.getElementById('feeling-notes').value = snapshot.val();
        }
    });

    document.getElementById('feeling-notes').addEventListener('input', (e) => {
        database.ref('dreamPageNotes').set(e.target.value);
    });
}

document.getElementById('password-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPassword();
});
// A CHAVE EXTRA QUE CAUSAVA O ERRO FOI APAGADA DAQUI!
