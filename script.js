let currentPage = 1;
let totalPages = 1;

function openFilterDialog() {

    const dialog = document.getElementById('filter-dialog');

    dialog.showModal();
}

function closeFilterDialog() {

    const dialog = document.getElementById('filter-dialog');

    dialog.close();
}

function updateFilterCount() {

    const urlParams = new URLSearchParams(window.location.search);

    const filterKeys = Array.from(urlParams.keys())
        .filter(key => key !== 'page' && key !== 'busca');

    document.getElementById('filter-count').textContent = filterKeys.length;
}

function filterNews(event) {

    event.preventDefault();

    const params = new URLSearchParams();

    const typeInput = document.getElementById('type-input').value;
    const quantityInput = document.getElementById('quantity-input').value;
    const fromInput = document.getElementById('from-input').value;
    const toInput = document.getElementById('to-input').value;
    const searchInput = document.getElementById('search-input').value;
    const page = document.getElementById('pagination-button').value

    if (typeInput) {
        params.append('tipo', typeInput);
    }
    if (quantityInput) {
        params.append('qtd', quantityInput);
    }
    if (fromInput) {
        params.append('de', fromInput);
    }
    if (toInput) {
        params.append('ate', toInput);
    }
    if (searchInput) {
        params.append('busca', searchInput);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);

    updateFilterCount();

    closeFilterDialog();

    getNews();
}

function setFilterValuesFromQueryString() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('tipo')) {
        document.getElementById('type-input').value = urlParams.get('tipo');
    }

    if (urlParams.has('qtd')) {
        document.getElementById('quantity-input').value = urlParams.get('qtd');
    }

    if (urlParams.has('de')) {
        document.getElementById('from-input').value = urlParams.get('de');
    }

    if (urlParams.has('ate')) {
        document.getElementById('to-input').value = urlParams.get('ate');
    }
}

function getNews(page = 1) {

    currentPage = page;

    const params = new URLSearchParams();

    const typeInput = document.getElementById('type-input').value;
    let quantityInput = document.getElementById('quantity-input').value;
    const fromInput = document.getElementById('from-input').value;
    const toInput = document.getElementById('to-input').value;
    const searchInput = document.getElementById('search-input').value;

    if (typeInput) {
        params.append('tipo', typeInput);
    }
    if (quantityInput) {
        params.append('qtd', quantityInput);
    } else {
        quantityInput = 10;
        params.append('qtd', quantityInput);
    }
    if (fromInput) {
        params.append('de', fromInput);
    }
    if (toInput) {
        params.append('ate', toInput);
    }
    if (searchInput) {
        params.append('busca', searchInput);
    }

    params.append('page', page);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);

    const list = document.getElementById('news-list');
    list.innerHTML = '';

    fetch(`https://servicodados.ibge.gov.br/api/v3/noticias?${params.toString()}`)
        .then((response) => response.json())
        .then((data) => {
            if (data?.items?.length > 0) {
                data.items.forEach(item => {

                    const li = document.createElement('li');
                    li.classList.add('news-item');

                    const imagens = JSON.parse(item.imagens);
                    const imageUrl = `https://agenciadenoticias.ibge.gov.br/${imagens.image_intro}`;

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.classList.add('news-image');

                    const h2 = document.createElement('h2');
                    h2.textContent = item.titulo;
                    h2.classList.add('news-title');

                    const p = document.createElement('p');
                    p.textContent = item.introducao;
                    p.classList.add('news-intro');

                    const editorias = item.editorias.split(',');
                    const editoriaDiv = document.createElement('div');
                    editoriaDiv.classList.add('news-tags');

                    editorias.forEach((editoria) => {
                        const span = document.createElement('span');
                        span.textContent = `#${editoria.trim()}`;
                        editoriaDiv.appendChild(span);
                    });

                    const publishDate = new Date(item.data_publicacao);
                    const diffMilliseconds = Date.now() - publishDate.getTime();
                    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

                    let tempoPublicacao;
                    if (diffDays === 0) {
                        tempoPublicacao = `Publicado hoje`;
                    } else if (diffDays === 1) {
                        tempoPublicacao = `Publicado ontem`;
                    } else {
                        tempoPublicacao = `Publicado há ${diffDays} dias`;
                    }

                    const publishSpan = document.createElement('span');
                    publishSpan.textContent = tempoPublicacao;
                    publishSpan.classList.add('news-date');

                    const metaContainer = document.createElement('div');
                    metaContainer.classList.add('news-meta');

                    metaContainer.appendChild(editoriaDiv);
                    metaContainer.appendChild(publishSpan);

                    const button = document.createElement('button');
                    button.textContent = 'Leia mais';
                    button.classList.add('news-button');
                    button.onclick = () => {
                        window.open(item.link, '_blank', 'noopener,noreferrer');
                    };

                    const textContainer = document.createElement('div');
                    textContainer.classList.add('news-text-container');

                    textContainer.appendChild(h2);
                    textContainer.appendChild(p);
                    textContainer.appendChild(metaContainer);
                    textContainer.appendChild(button);

                    li.appendChild(img);
                    li.appendChild(textContainer);

                    list.appendChild(li);
                });

                totalPages = data.totalPages;
                renderPagination();
            }
        });
}

function renderPagination() {

    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const maxButtons = 10;
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(currentPage - half, 1);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
        end = totalPages;
        start = Math.max(end - maxButtons + 1, 1);
    }

    for (let i = start; i <= end; i++) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.id = 'pagination-button';
        button.textContent = i;
        button.onclick = () => {
            getNews(i);
        };
        if (i === currentPage) {
            button.style.backgroundColor = '#4682b4';
            button.style.color = '#fff';
        }
        li.appendChild(button);
        pagination.appendChild(li);
    }
}

document.addEventListener("DOMContentLoaded", function () {
   updateFilterCount();
   setFilterValuesFromQueryString();
   getNews();
});
