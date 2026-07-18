// Estrutura de categorias conforme o seu pedido
const configData = {
    "Filmes": { icon: "🎬", cats: ["Animados", "Real-Life", "Doramas", "Animes"] },
    "Séries": { icon: "📺", cats: ["Desenhos", "Animes", "Novelas", "Real-Life", "Doramas"] },
    "Livros": { icon: "📖", cats: ["Fisico", "Webtoon", "Mangá", "BGL"] },
    "Jogos": { icon: "🎮", cats: ["Geralzão"] }
};

let currentMainTab = "Filmes";
let currentCategory = "Animados";

// Carrega dados salvos ou cria lista vazia localmente
let treasures = JSON.parse(localStorage.getItem('dreamPageData')) || [];

// Sistema de Login
function checkPassword() {
    const pass = document.getElementById('password-input').value.trim().toLowerCase();
    if (pass === 'nostalgia') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('fab-add').style.display = 'flex';
        initDashboard();
    } else {
        alert('Palavra-chave incorreta!');
    }
}

// Permite pressionar Enter no input de Login para submeter
document.getElementById('password-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkPassword();
});

function initDashboard() {
    switchMainTab(currentMainTab);
}

function switchMainTab(tabName) {
    currentMainTab = tabName;
    currentCategory = configData[tabName].cats[0]; // Seleciona a primeira categoria por defeito
    
    // Atualiza botões do menu superior ativo
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === tabName);
    });

    // Atualiza Título Visual da Seção
    document.getElementById('current-tab-title').textContent = `${configData[tabName].icon} ${tabName} - Escolha uma Categoria`;

    renderCategoryButtons();
    renderItems();
}

function renderCategoryButtons() {
    const container = document.getElementById('category-buttons-container');
    container.innerHTML = '';

    configData[currentMainTab].cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            currentCategory = cat;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderItems();
        };
        container.appendChild(btn);
    });
}

function renderItems(filterTitle = "") {
    const grids = {
        'nao-visto': document.getElementById('grid-nao-visto'),
        'em-processo': document.getElementById('grid-em-processo'),
        'finalizado': document.getElementById('grid-finalizado')
    };

    // Limpa os elementos visuais anteriores das colunas
    Object.values(grids).forEach(g => g.innerHTML = '');

    treasures.forEach((item, index) => {
        // Se houver busca por texto, ignora filtro de categoria momentaneamente
        if (filterTitle) {
            if (!item.title.toLowerCase().includes(filterTitle.toLowerCase())) return;
        } else {
            // Filtro por categoria da aba selecionada
            if (item.mainTab !== currentMainTab || item.category !== currentCategory) return;
        }

        const card = document.createElement('div');
        card.className = 'item-card';
        card.id = `item-${index}`;
        card.innerHTML = `
            <button class="delete-btn" onclick="deleteItem(${index}, event)">X</button>
            <img src="${item.cover || 'https://via.placeholder.com/130x180'}" class="item-cover" alt="Capa">
            <div class="item-info">
                <a href="${item.link || '#'}" target="_blank" class="item-title" title="${item.title}">${item.title}</a>
            </div>
        `;

        if (grids[item.status]) {
            grids[item.status].appendChild(card);
        }
    });
}

// Remover item do baú
function deleteItem(index, event) {
    event.stopPropagation();
    if(confirm("Deseja remover este item do seu baú?")) {
        treasures.splice(index, 1);
        localStorage.setItem('dreamPageData', JSON.stringify(treasures));
        renderItems();
    }
}

// Mecanismo Global de Pesquisa (Ao carregar no Enter)
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const query = this.value.trim();
        if(query) {
            // Varre toda a base de dados
            const foundItemIndex = treasures.findIndex(item => item.title.toLowerCase().includes(query.toLowerCase()));
            if (foundItemIndex !== -1) {
                const item = treasures[foundItemIndex];
                // Teletransporta o utilizador para a aba e categoria do item
                switchMainTab(item.mainTab);
                currentCategory = item.category;
                renderCategoryButtons();
                renderItems();
                
                // Animação suave para focar o item procurado na página
                setTimeout(() => {
                    const element = document.getElementById(`item-${foundItemIndex}`);
                    if(element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            } else {
                alert("Item não encontrado no seu baú!");
            }
        } else {
            renderItems();
        }
    }
});

// Funções de Controlo do Modal (Pop-up)
function openModal() {
    document.getElementById('modal-add').classList.add('active');
    document.getElementById('form-main-section').value = currentMainTab;
    updateModalCategories();
}

function closeModal() {
    document.getElementById('modal-add').classList.remove('active');
    // Limpa os campos para o próximo uso
    document.getElementById('form-title').value = '';
    document.getElementById('form-cover').value = '';
    document.getElementById('form-link').value = '';
}

function updateModalCategories() {
    const selectedMain = document.getElementById('form-main-section').value;
    const catSelect = document.getElementById('form-category');
    catSelect.innerHTML = '';

    configData[selectedMain].cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
    });
}

function saveNewItem() {
    const title = document.getElementById('form-title').value.trim();
    const cover = document.getElementById('form-cover').value.trim();
    const link = document.getElementById('form-link').value.trim();
    const mainTab = document.getElementById('form-main-section').value;
    const category = document.getElementById('form-category').value;
    const status = document.getElementById('form-status').value;

    if (!title) {
        alert("Por favor, preencha o título do seu tesouro!");
        return;
    }

    const newItem = { title, cover, link, mainTab, category, status };
    treasures.push(newItem);
    localStorage.setItem('dreamPageData', JSON.stringify(treasures));

    closeModal();
    
    // Leva o utilizador à categoria do item adicionado para validação imediata
    switchMainTab(mainTab);
    currentCategory = category;
    renderCategoryButtons();
    renderItems();
}
