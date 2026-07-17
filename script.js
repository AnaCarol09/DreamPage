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

/* 1. Altera a página principal */
function switchPage(pageId, button) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    if(button) button.classList.add('active');
    
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('main-nav').style.display = 'flex';

    currentPageContext = '';
    currentCategoryContext = '';
    document.getElementById('search-input').value = '';
}

/* 2. Navegação MANUAL para a página de Categoria específica */
function openSubPage(page, category) {
    currentPageContext = page;
    currentCategoryContext = category;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('subpage-view').classList.add('active');
    document.getElementById('main-nav').style.display = 'none';
    
    const backBtn = document.getElementById('back-btn');
    backBtn.style.display = 'inline-block';
    backBtn.onclick = function() {
        switchPage(page, document.querySelector(`[onclick*="${page}"]`));
    };

    document.getElementById('subpage-title').textContent = `${page.toUpperCase()} > ${category.toUpperCase()}`;

    renderItems();
    filterStatusView('visto');
}

/* 3. Alterna entre as abas de Status */
function filterStatusView(status) {
    document.querySelectorAll('.status-container-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.status-nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`status-content-${status}`).style.display = 'block';
    document.getElementById(`btn-status-${status}`).classList.add('active');
}

/* 4. RENDERIZAR ITENS */
function renderItems() {
    // Garante que os elementos existem na tela antes de limpar
    const gridVisto = document.getElementById('grid-visto');
    const gridNaovisto = document.getElementById('grid-naovisto');
    const gridEmprocesso = document.getElementById('grid-emprocesso');

    if (gridVisto) gridVisto.innerHTML = '';
    if (gridNaovisto) gridNaovisto.innerHTML = '';
    if (gridEmprocesso) gridEmprocesso.innerHTML = '';

    if (!currentPageContext || !currentCategoryContext) return;

    meusItens.forEach(item => {
        if (item.page === currentPageContext && item.category === currentCategoryContext) {
            const gridContainer = document.getElementById(`grid-${item.status}`);

            if (gridContainer) {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.setAttribute('data-name', item.name.toLowerCase()); 
                // Passamos a propriedade item.firebaseKey entre aspas simples para a função deleteItem
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
    });
}

/* 5. LÓGICA DE PESQUISA GLOBAL */
function filterItems() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (query === '') {
        renderItems();
        return;
    }

    const itemEncontrado = meusItens.find(item => item.name.toLowerCase().includes(query));

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
            if (itemName.includes(query)) {
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
    filmes: ['animados', 'real', 'doramas', 'animes'],
    series: ['desenhos', 'animes', 'novelas', 'real', 'doramas'],
    livros: ['fisico', 'webtoon', 'manga', 'BGL'],
    jogos: ['geral']
};

function updateFormCategories() {
    const page = document.getElementById('form-page').value;
    const catSelect = document.getElementById('form-category');
    catSelect.innerHTML = '';
    categoriasPorPagina[page].forEach(cat => {
        let opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.toUpperCase();
        catSelect.appendChild(opt);
    });
}

function openModal() {
    document.getElementById('item-modal').style.display = 'flex';
    updateFormCategories();
}

// Pequeno ajuste para limpar campos ao fechar
function closeModal() {
    document.getElementById('item-modal').style.display = 'none';
    document.getElementById('form-name').value = '';
    document.getElementById('form-image').value = '';
    document.getElementById('form-link').value = '';
}

/* SALVAR NO FIREBASE */
function addItem() {
    const name = document.getElementById('form-name').value.trim();
    let image = document.getElementById('form-image').value.trim();
    const link = document.getElementById('form-link').value.trim();
    const page = document.getElementById('form-page').value;
    const category = document.getElementById('form-category').value;
    const status = document.getElementById('form-status').value;

    if (!name) return alert("Por favor, digite um nome!");
    if (!image) image = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"; 

    const newItem = { id: Date.now(), name, image, link, page, category, status };
    
    // Envia o item para o Firebase em vez do localStorage
    database.ref('dreamPageItems').push(newItem);
    
    closeModal();
    
    currentPageContext = page;
    currentCategoryContext = category;
    openSubPage(page, category);
    filterStatusView(status);
}

/* DELETAR NO FIREBASE */
function deleteItem(firebaseKey) {
    if(confirm("Tem certeza que deseja apagar este item?")) {
        // Remove do Firebase usando a chave única do item
        database.ref(`dreamPageItems/${firebaseKey}`).remove();
    }
}

// Sincronização das Notas de sentimento com o Firebase
if(document.getElementById('feeling-notes')) {
    // Busca a nota inicial do banco
    database.ref('dreamPageNotes').once('value').then((snapshot) => {
        if(snapshot.val()) {
            document.getElementById('feeling-notes').value = snapshot.val();
        }
    });

    // Envia as atualizações das notas para o Firebase conforme digita
    document.getElementById('feeling-notes').addEventListener('input', (e) => {
        database.ref('dreamPageNotes').set(e.target.value);
    });
}

document.getElementById('password-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPassword();
});