// Mapeamento das subcategorias filhas de cada seção principal
const configData = {
    "filmes": ["animados", "real", "doramas", "animes"],
    "series": ["desenhos", "animes", "novelas", "real", "doramas"],
    "livros": ["fisico", "webtoon", "manga", "bgl"],
    "jogos": ["geral"]
};

// Variáveis globais para controlar a navegação e armazenar os dados carregados
let currentPage = "filmes";
let currentCategory = "";
let currentStatusFilter = "visto";
let allTreasures = [];

let lastPage = "";
let lastCategory = "";
let lastStatus = "";

// Guarda o ID ao editar um item existente; permanece null para novos cadastros
let editingItemId = null;

// Configuração de conexão do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDll77grW7wwWs_ZGhpPKdJcFHjZH1LUe4",
    authDomain: "dream-page-c0436.firebaseapp.com",
    projectId: "dream-page-c0436",
    storageBucket: "dream-page-c0436.firebasestorage.app",
    messagingSenderId: "546123701437",
    appId: "1:546123701437:web:4f6817ca23248b384e6bd4",
    measurementId: "G-Y80W54XGRZ"
};

// Inicialização da instância do banco de dados do Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 1. Autenticação Simples ---
function checkPassword() {
    const passwordInput = document.getElementById("password-input").value.trim().toLowerCase();
    const errorMsg = document.getElementById("error-msg");
    const loginScreen = document.getElementById("login-screen");
    const mainContent = document.getElementById("main-content");
    const floatingBtn = document.getElementById("add-floating-btn");

    // Valida a palavra-chave para revelar a interface principal e iniciar o Firebase
    if (passwordInput === "nostalgia") {
        errorMsg.style.display = "none";
        loginScreen.style.display = "none";
        mainContent.style.display = "block";
        floatingBtn.style.display = "flex";
        
        // Ativa a escuta de dados em tempo real no banco
        listenToFirebase();
    } else {
        errorMsg.style.display = "block";
    }
}

document.getElementById("password-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") checkPassword();
});


// --- 2. Sincronização em Tempo Real (Firebase) ---
function listenToFirebase() {
    // Sincroniza qualquer alteração no nó 'treasures' do Firebase com a lista local
    database.ref("treasures").on("value", (snapshot) => {
        allTreasures = [];
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(key => {
                allTreasures.push({ id: key, ...data[key] });
            });
        }
        renderGrids();
    });
}


// --- 3. Controle de Telas e Navegação ---
function switchPage(pageId, element) {
    document.getElementById("subpage-view").classList.remove("active");
    document.getElementById("back-btn").style.display = "none";

    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");

    document.querySelectorAll(".container .page").forEach(page => {
        page.classList.remove("active");
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add("active");
    }
    
    currentPage = pageId;
    currentCategory = "";
}

function openSubPage(pageId, categoryId) {
    currentPage = pageId;
    currentCategory = categoryId;

    document.querySelectorAll(".container .page").forEach(page => page.classList.remove("active"));

    const subpageView = document.getElementById("subpage-view");
    subpageView.classList.add("active");

    const formattedTitle = `${pageId.toUpperCase()} ➔ ${categoryId.toUpperCase()}`;
    document.getElementById("subpage-title").textContent = formattedTitle;

    const backBtn = document.getElementById("back-btn");
    backBtn.style.display = "inline-block";
    backBtn.onclick = () => switchPage(pageId, null);

    filterStatusView(currentStatusFilter);
}

function filterStatusView(statusId) {
    currentStatusFilter = statusId;

    document.querySelectorAll(".status-nav-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`btn-status-${statusId}`);
    if (activeBtn) activeBtn.classList.add("active");

    document.querySelectorAll(".status-container-view").forEach(container => {
        container.style.display = "none";
    });
    const targetContainer = document.getElementById(`status-content-${statusId}`);
    if (targetContainer) targetContainer.style.display = "block";

    renderGrids();
}


// --- 4. Renderização do Grid e Ordenação ---
function renderGrids() {
    const grids = {
        visto: document.getElementById("grid-visto"),
        emprocesso: document.getElementById("grid-emprocesso"),
        naovisto: document.getElementById("grid-naovisto")
    };

    Object.values(grids).forEach(grid => { if (grid) grid.innerHTML = ""; });

    // Filtra apenas os itens pertencentes à página e categoria ativas
    const filtered = allTreasures.filter(item => {
        return item.page === currentPage && item.category === currentCategory;
    });

    // Ordenação alfabética ignorando acentuação e maiúsculas/minúsculas
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || "", 'pt-BR', { sensitivity: 'base' }));

    filtered.forEach(item => {
        const gridTarget = grids[item.status];
        if (gridTarget) {
            const card = document.createElement("div");
            card.className = "item-card";
            
            // Exibe o emoji indicador caso o item possua anotações
            const commentHTML = (item.comment && item.comment.trim() !== "")
                ? `<span class="item-comment-icon" title="${item.comment}">💬</span>`
                : '';

            card.innerHTML = `
                <button class="delete-btn" onclick="deleteItem('${item.id}', event)">X</button>
                <img src="${item.image || 'https://via.placeholder.com/180x240'}"
                    class="item-image"
                    alt="Capa"
                    title="Clique duas vezes para editar este item"
                    ondblclick="openEditModal('${item.id}')">
                <div class="item-info">
                    <h4 class="item-name">${item.name} ${commentHTML}</h4>
                    <a href="${item.link || '#'}" target="_blank" class="item-link">Acessar</a>
                </div>
            `;
            gridTarget.appendChild(card);
        }
    });
}


// --- 5. Adicionar, Editar e Remover Itens ---
function openModal() {
    editingItemId = null; // Reinicia para criação
    document.getElementById("modal-title").textContent = "Adicionar Novo Tesouro";
    document.getElementById("item-modal").style.display = "flex";
    document.getElementById("form-page").value = currentPage;
    document.getElementById("form-comment").value = "";
    updateFormCategories();
}

// Preenche o modal com dados prévios para edição
function openEditModal(itemId) {
    const item = allTreasures.find(i => i.id === itemId);
    if (!item) return;

    editingItemId = itemId; // Salva o ID em edição
    document.getElementById("modal-title").textContent = "Editar Tesouro";

    document.getElementById("form-name").value = item.name || "";
    document.getElementById("form-image").value = item.image || "";
    document.getElementById("form-link").value = item.link || "";
    document.getElementById("form-comment").value = item.comment || "";
    document.getElementById("form-page").value = item.page || "filmes";

    updateFormCategories();

    document.getElementById("form-category").value = item.category || "";
    document.getElementById("form-status").value = item.status || "visto";

    document.getElementById("item-modal").style.display = "flex";
}

function closeModal() {
    editingItemId = null;
    document.getElementById("item-modal").style.display = "none";
    document.getElementById("form-name").value = "";
    document.getElementById("form-image").value = "";
    document.getElementById("form-link").value = "";
    document.getElementById("form-comment").value = "";
}

// Atualiza o select de subcategorias com base na seção escolhida
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

// Envia os dados para salvar ou atualizar no banco do Firebase
function addItem() {
    const name = document.getElementById("form-name").value.trim();
    const image = document.getElementById("form-image").value.trim();
    const link = document.getElementById("form-link").value.trim();
    const comment = document.getElementById("form-comment").value.trim();
    const page = document.getElementById("form-page").value;
    const category = document.getElementById("form-category").value;
    const status = document.getElementById("form-status").value;

    if (!name) {
        alert("O Nome/Título do item é obrigatório!");
        return;
    }

    const itemData = { name, image, link, comment, page, category, status };

    if (editingItemId) {
        // Atualiza item existente
        database.ref(`treasures/${editingItemId}`).update(itemData)
            .then(() => {
                closeModal();
                openSubPage(page, category);
                filterStatusView(status);
            })
            .catch(err => alert("Erro ao atualizar dados: " + err.message));
    } else {
        // Cria um novo item
        database.ref("treasures").push(itemData)
            .then(() => {
                closeModal();
                openSubPage(page, category);
                filterStatusView(status);
            })
            .catch(err => alert("Erro ao salvar dados: " + err.message));
    }
}

function deleteItem(itemId, event) {
    event.stopPropagation();
    if (confirm("Tem certeza que deseja remover este tesouro do seu baú remoto?")) {
        database.ref(`treasures/${itemId}`).remove()
            .catch(err => alert("Erro ao deletar: " + err.message));
    }
}


// --- 6. Pesquisa em Tempo Real e Normalização de Texto ---
function filterItems() {
    const input = document.getElementById("search-input");
    const rawQuery = input.value.trim();

    // Restaura a visualização anterior se o campo for limpo
    if (rawQuery === "") {
        closeSearch();
        return;
    }

    // Normalização para ignorar acentuação e cedilha
    const query = rawQuery
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    // Busca no array de dados tratando acentos do texto cadastrado
    const results = allTreasures.filter(item => {
        const normalizedName = (item.name || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        return normalizedName.includes(query);
    });

    // Salva o histórico de navegação ao entrar no modo de pesquisa
    const searchPage = document.getElementById("search-results-view");
    if (!searchPage.classList.contains("active")) {
        lastPage = currentPage;
        lastCategory = currentCategory;
        lastStatus = currentStatusFilter;
    }

    // Oculta a navegação secundária para focar nos resultados
    document.querySelectorAll(".container .page").forEach(page => {
        page.classList.remove("active");
        page.style.display = "none";
    });

    document.getElementById("main-nav").style.display = "none";
    document.getElementById("back-btn").style.display = "none";

    searchPage.style.display = "block";
    searchPage.classList.add("active");

    const grid = document.getElementById("grid-search-results");
    grid.innerHTML = "";

    if (results.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Nenhum tesouro encontrado para "${rawQuery}".</p>`;
        return;
    }

    results.sort((a, b) => (a.name || "").localeCompare(b.name || "", 'pt-BR', { sensitivity: 'base' }));

    const statusNome = {
        visto: "Finalizado",
        emprocesso: "Em Processo",
        naovisto: "Um dia!"
    };

    results.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        const commentHTML = (item.comment && item.comment.trim() !== "")
            ? `<span class="item-comment-icon" title="${item.comment}">💬</span>`
            : '';

        card.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/180x240'}"
                class="item-image"
                title="Clique duas vezes para editar"
                ondblclick="openEditModal('${item.id}')">
            <div class="item-info">
                <h4 class="item-name">${item.name} ${commentHTML}</h4>
                <a class="item-link" href="${item.link || '#'}" target="_blank">Acessar</a>
            </div>
            <div class="item-tooltip">
                📂 ${item.page.toUpperCase()} <br>
                📁 ${item.category.toUpperCase()} <br>
                ⭐ ${statusNome[item.status]}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Fecha a tela de busca e restaura o menu de navegação e categoria anteriores
function closeSearch(){
    const searchPage = document.getElementById("search-results-view");
    searchPage.style.display="none";
    searchPage.classList.remove("active");

    document.getElementById("main-nav").style.display = "flex";

    document.querySelectorAll(".container .page").forEach(page=>{
        page.style.display="";
    });

    if(lastCategory !== ""){
        openSubPage(lastPage, lastCategory);
        filterStatusView(lastStatus);
    } else {
        const btn = [...document.querySelectorAll(".nav-btn")]
            .find(btn => btn.textContent.toLowerCase() === lastPage);

        switchPage(lastPage, btn);
    }
}