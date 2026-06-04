const PALAVRA_CHAVE = "nostalgia"; 

let meusItens = JSON.parse(localStorage.getItem('dreamPageItems')) || [];

// Variáveis de controle para rastrear onde o usuário está navegando manualmente ou via busca
let currentPageContext = '';
let currentCategoryContext = '';

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

/* 1. Altera a página principal (Filmes, Séries, Livros, Jogos, Sentimento) */
function switchPage(pageId, button) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    if(button) button.classList.add('active');
    
    // Oculta o menu secundário de status e o botão voltar ao alternar o menu principal
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('main-nav').style.display = 'flex';

    // Reseta os contextos de página ao clicar no menu principal
    currentPageContext = '';
    currentCategoryContext = '';

    // Limpa a barra de pesquisa para que todos os itens voltem a aparecer normalmente
    document.getElementById('search-input').value = '';
}

/* 2. Navegação MANUAL para a página de Categoria específica */
function openSubPage(page, category) {
    currentPageContext = page;
    currentCategoryContext = category;

    // Esconde os menus principais e ativa a tela de exibição de subpágina
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('subpage-view').classList.add('active');
    
    document.getElementById('main-nav').style.display = 'none';
    
    // Configura o botão Voltar
    const backBtn = document.getElementById('back-btn');
    backBtn.style.display = 'inline-block';
    backBtn.onclick = function() {
        switchPage(page, document.querySelector(`[onclick*="${page}"]`));
    };

    // Atualiza o título da subpágina
    document.getElementById('subpage-title').textContent = `${page.toUpperCase()} > ${category.toUpperCase()}`;

    // Renderiza os itens salvos nesta categoria para visualização manual
    renderItems();
    
    // Mostra por padrão a aba de "Vistos" ao entrar manualmente
    filterStatusView('visto');
}

/* 3. Alterna entre as abas de Status (Visto, Não Visto, Em Processo) dentro da subpágina */
function filterStatusView(status) {
    document.querySelectorAll('.status-container-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.status-nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`status-content-${status}`).style.display = 'block';
    document.getElementById(`btn-status-${status}`).classList.add('active');
}

/* 4. RENDERIZAR ITENS (Garante exibição tanto na navegação manual quanto na busca) */
function renderItems() {
    // Limpa as 3 grids de visualização da subpágina atual
    document.getElementById('grid-visto').innerHTML = '';
    document.getElementById('grid-naovisto').innerHTML = '';
    document.getElementById('grid-emprocesso').innerHTML = '';

    // Se não houver uma subpágina selecionada no momento, não renderiza nada nas grids abaixo
    if (!currentPageContext || !currentCategoryContext) return;

    // Varre e insere os itens correspondentes à categoria atual
    meusItens.forEach(item => {
        if (item.page === currentPageContext && item.category === currentCategoryContext) {
            const gridContainer = document.getElementById(`grid-${item.status}`);

            if (gridContainer) {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.setAttribute('data-name', item.name.toLowerCase()); 
                card.innerHTML = `
                    <button class="delete-btn" onclick="deleteItem(${item.id})">✕</button>
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

/* 5. LÓGICA DE PESQUISA GLOBAL (Teleporta para o item e o exibe perfeitamente) */
function filterItems() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    // Se a pesquisa for limpa, re-renderiza a página atual para mostrar todos os itens originais dela
    if (query === '') {
        renderItems();
        return;
    }

    // Procura o item correspondente em toda a base de dados
    const itemEncontrado = meusItens.find(item => item.name.toLowerCase().includes(query));

    if (itemEncontrado) {
        // Altera o contexto para a localização real do item encontrado
        currentPageContext = itemEncontrado.page;
        currentCategoryContext = itemEncontrado.category;

        // Atualiza a interface gráfica para abrir a subpágina correta
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('subpage-view').classList.add('active');
        document.getElementById('main-nav').style.display = 'none';

        // Configura o botão de voltar baseado na página do item
        const backBtn = document.getElementById('back-btn');
        backBtn.style.display = 'inline-block';
        backBtn.onclick = function() {
            switchPage(itemEncontrado.page, document.querySelector(`[onclick*="${itemEncontrado.page}"]`));
        };

        // Atualiza o título da subpágina
        document.getElementById('subpage-title').textContent = `${itemEncontrado.page.toUpperCase()} > ${itemEncontrado.category.toUpperCase()}`;

        // Renderiza fisicamente os itens na tela
        renderItems();

        // Abre a aba do status exato (visto / naovisto / emprocesso) onde o item está guardado
        filterStatusView(itemEncontrado.status);

        // Aplica o filtro visual imediato ocultando os outros itens da mesma categoria e destacando o buscado
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

/* Controle do Form Dinâmico do Modal */
const categoriasPorPagina = {
    filmes: ['animados', 'naoanimados', 'doramas', 'animes', 'blgl'],
    series: ['desenhos', 'animes', 'novelas', 'real', 'doramas', 'blgl'],
    livros: ['novels', 'fisico', 'webtoon', 'manga', 'yaoiyuri'],
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

function closeModal() {
    document.getElementById('item-modal').style.display = 'none';
}

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
    meusItens.push(newItem);
    localStorage.setItem('dreamPageItems', JSON.stringify(meusItens));
    
    closeModal();
    
    // Define o contexto para a página do item recém-criado para renderizar na tela certa
    currentPageContext = page;
    currentCategoryContext = category;
    openSubPage(page, category);
    filterStatusView(status);

    document.getElementById('form-name').value = '';
    document.getElementById('form-image').value = '';
    document.getElementById('form-link').value = '';
}

function deleteItem(id) {
    if(confirm("Tem certeza que deseja apagar este item?")) {
        meusItens = meusItens.filter(item => item.id !== id);
        localStorage.setItem('dreamPageItems', JSON.stringify(meusItens));
        renderItems();
    }
}

// Notas do sentimento
if(document.getElementById('feeling-notes')) {
    document.getElementById('feeling-notes').value = localStorage.getItem('dreamPageNotes') || '';
    document.getElementById('feeling-notes').addEventListener('input', (e) => {
        localStorage.setItem('dreamPageNotes', e.target.value);
    });
}

document.getElementById('password-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPassword();
});