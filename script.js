// Configuração das categorias filhas mapeadas com as IDs do seu HTML
const configData = {
    "filmes": ["animados", "real", "doramas", "animes"],
    "series": ["desenhos", "animes", "novelas", "real", "doramas"],
    "livros": ["fisico", "webtoon", "manga", "bgl"],
    "jogos": ["geral"]
};

// Estados globais de navegação interna
let currentPage = "filmes";
let currentCategory = "";
let currentStatusFilter = "visto"; 
let allTreasures = [];

// --- Configuração Inicial do Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDll77grW7wwWs_ZGhpPKdJcFHjZH1LUe4",
    authDomain: "dream-page-c0436.firebaseapp.com",
    projectId: "dream-page-c0436",
    storageBucket: "dream-page-c0436.firebasestorage.app",
    messagingSenderId: "546123701437",
    appId: "1:546123701437:web:4f6817ca23248b384e6bd4",
    measurementId: "G-Y80W54XGRZ"
};

// Inicializa o Firebase (Compat Mode)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 1. Autenticação por Palavra-Chave ---
function checkPassword() {
    const passwordInput = document.getElementById("password-input").value.trim().toLowerCase();
    const errorMsg = document.getElementById("error-msg");
    const loginScreen = document.getElementById("login-screen");
    const mainContent = document.getElementById("main-content");
    const floatingBtn = document.getElementById("add-floating-btn");

    if (passwordInput === "nostalgia") {
        errorMsg.style.display = "none";
        loginScreen.style.display = "none";
        mainContent.style.display = "block";
        floatingBtn.style.display = "flex";
        
        // Escuta e sincroniza dados do Firebase em tempo real
        listenToFirebase();
    } else {
        errorMsg.style.display = "block";
    }
}

// Atalho para Enter no campo de senha
document.getElementById("password-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") checkPassword();
});


// --- 2. Sincronização e Leitura de Dados (Firebase) ---
function listenToFirebase() {
    database.ref("treasures").on("value", (snapshot) => {
        allTreasures = [];
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(key => {
                allTreasures.push({ id: key, ...data[key] });
            });
        }
        renderGrids();
        
        // Atualiza a busca em tempo real se a tela de busca estiver aberta
        const searchView = document.getElementById("search-results-view");
        if (searchView && searchView.style.display === "block") {
            executeSearch();
        }
    });
}


// --- 3. Controle de Navegação Principal e Subpáginas ---
function restorePageDisplays() {
    // Restaura o display original das páginas escondidas pela busca
    document.querySelectorAll(".container .page").forEach(page => {
        page.style.display = "";
    });
    document.getElementById("search-results-view").style.display = "none";
}

function switchPage(pageId, element) {
    restorePageDisplays();

    // Fecha o modo de visualização de subpágina se estiver aberto
    document.getElementById("subpage-view").classList.remove("active");
    document.getElementById("back-btn").style.display = "none";

    // Reseta classes ativas nos botões do menu superior
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");

    // Alterna visualização de páginas root
    document.querySelectorAll(".container .page").forEach(page => {
        page.classList.remove("active");
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add("active");
    }
    
    currentPage = pageId;
    currentCategory = ""; 
    
    // Limpa a barra de busca ao trocar de aba principal
    document.getElementById("search-input").value = "";
}

function openSubPage(pageId, categoryId) {
    restorePageDisplays();
    currentPage = pageId;
    currentCategory = categoryId;

    // Esconde páginas principais do fluxo de exibição
    document.querySelectorAll(".container .page").forEach(page => page.classList.remove("active"));

    // Exibe a tela estrutural das subpáginas
    const subpageView = document.getElementById("subpage-view");
    subpageView.classList.add("active");

    // Constrói dinamicamente o título formatado
    const formattedTitle = `${pageId.toUpperCase()} ➔ ${categoryId.toUpperCase()}`;
    document.getElementById("subpage-title").textContent = formattedTitle;

    // Ativa o botão de retorno e define o gatilho de clique
    const backBtn = document.getElementById("back-btn");
    backBtn.style.display = "inline-block";
    backBtn.onclick = () => switchPage(pageId, null);

    // Renderiza a navegação de status e reconstrói o Grid de Cards
    filterStatusView(currentStatusFilter);
}

function filterStatusView(statusId) {
    currentStatusFilter = statusId;

    // Alterna o estado ativo nos botões de navegação por status
    document.querySelectorAll(".status-nav-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`btn-status-${statusId}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Alterna a exibição das colunas de conteúdo
    document.querySelectorAll(".status-container-view").forEach(container => {
        container.style.display = "none";
    });
    const targetContainer = document.getElementById(`status-content-${statusId}`);
    if (targetContainer) targetContainer.style.display = "block";

    renderGrids();
}


// --- 4. Renderização e Construção de Cards ---
function renderGrids() {
    const grids = {
        visto: document.getElementById("grid-visto"),
        emprocesso: document.getElementById("grid-emprocesso"),
        naovisto: document.getElementById("grid-naovisto")
    };

    // Limpa os grids visuais
    Object.values(grids).forEach(grid => { if (grid) grid.innerHTML = ""; });

    // Se estivermos visualizando uma subpágina específica, filtra por ela
    const filtered = allTreasures.filter(item => {
        return item.page === currentPage && item.category === currentCategory;
    });

    filtered.forEach(item => {
        const gridTarget = grids[item.status];
        if (gridTarget) {
            const card = document.createElement("div");
            card.className = "item-card";
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteItem('${item.id}', event)">X</button>
                <img src="${item.image || 'https://via.placeholder.com/180x240'}" class="item-image" alt="Capa">
                <div class="item-info">
                    <h4 class="item-name">${item.name}</h4>
                    <a href="${item.link || '#'}" target="_blank" class="item-link">Acessar</a>
                </div>
            `;
            gridTarget.appendChild(card);
        }
    });
}


// --- 5. Adicionar e Remover Itens ---
function openModal() {
    document.getElementById("item-modal").style.display = "flex";
    document.getElementById("form-page").value = currentPage;
    updateFormCategories();
}

function closeModal() {
    document.getElementById("item-modal").style.display = "none";
    document.getElementById("form-name").value = "";
    document.getElementById("form-image").value = "";
    document.getElementById("form-link").value = "";
}

function updateFormCategories() {
    const selectedPage = document.getElementById("form-page").value;
    const categorySelect = document.getElementById("form-category");
    categorySelect.innerHTML = "";

    if (configData[selectedPage]) {
        configData[selectedPage].forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            categorySelect.appendChild(option);
        });
    }
}

function addItem() {
    const name = document.getElementById("form-name").value.trim();
    const image = document.getElementById("form-image").value.trim();
    const link = document.getElementById("form-link").value.trim();
    const page = document.getElementById("form-page").value;
    const category = document.getElementById("form-category").value;
    const status = document.getElementById("form-status").value;

    if (!name) {
        alert("O Nome/Título do item é obrigatório!");
        return;
    }

    const newItem = { name, image, link, page, category, status };

    // Envia o payload direto para o nó do banco de dados remoto
    database.ref("treasures").push(newItem)
        .then(() => {
            closeModal();
            openSubPage(page, category);
            filterStatusView(status);
        })
        .catch(err => alert("Erro ao salvar dados: " + err.message));
}

function deleteItem(itemId, event) {
    event.stopPropagation(); // Previne comportamentos de cliques fantasmas no card
    if (confirm("Tem certeza que deseja remover este tesouro do seu baú remoto?")) {
        database.ref(`treasures/${itemId}`).remove()
            .catch(err => alert("Erro ao deletar: " + err.message));
    }
}


// --- 6. Mecanismo de Busca Global com Exibição Separada ---
function executeSearch() {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    const searchResultsView = document.getElementById("search-results-view");
    const gridSearchResults = document.getElementById("grid-search-results");

    if (!query) return;

    // Esconde todas as outras páginas visíveis
    document.querySelectorAll(".container .page").forEach(page => {
        page.classList.remove("active");
        page.style.display = "none";
    });

    // Limpa o grid de busca
    gridSearchResults.innerHTML = "";

    // Filtra os itens pelo nome
    const results = allTreasures.filter(item => 
        item.name.toLowerCase().includes(query)
    );

    if (results.length > 0) {
        // Renderiza os cards na seção isolada de busca
        results.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card";
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteItem('${item.id}', event)">X</button>
                <img src="${item.image || 'https://via.placeholder.com/180x240'}" class="item-image" alt="Capa">
                <div class="item-info">
                    <h4 class="item-name">${item.name}</h4>
                    <p style="font-size:0.75rem; color: var(--text-secondary); text-align:center; margin: 0 0 8px 0;">
                        ${item.page.toUpperCase()} ➔ ${item.category.toUpperCase()} (${item.status.toUpperCase()})
                    </p>
                    <a href="${item.link || '#'}" target="_blank" class="item-link">Acessar</a>
                </div>
            `;
            gridSearchResults.appendChild(card);
        });
    } else {
        gridSearchResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Nenhum tesouro encontrado com esse nome.</p>`;
    }

    // Exibe a tela de busca isolada
    searchResultsView.style.display = "block";
}

function filterItems() {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    const searchResultsView = document.getElementById("search-results-view");

    // Se o campo estiver limpo, restaura a exibição anterior
    if (!query) {
        restorePageDisplays();
        document.getElementById(currentPage).classList.add("active");
        if (currentCategory) {
            document.getElementById("subpage-view").classList.add("active");
        }
        return;
    }

    // Pressionar Enter realiza a busca isolada
    document.getElementById("search-input").onkeypress = function(e) {
        if (e.key === "Enter") {
            executeSearch();
        }
    };
}
