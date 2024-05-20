const apiKey = 'live_zBkybJ1oNkycTQ1m6KYiaPmhuSWhBoKIXHYivTelvunexxMNAKqOEcOvqvkN1dMB';
let currentPage = 1;
const limit = 12;
const maxPages = 5;
let currentSearchResults = [];

async function getCats(page = 1) {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg,png&format=json&has_breeds=true&order=RANDOM&page=${page - 1}&limit=${limit}`, {
            headers: {
                'x-api-key': apiKey
            }
        });
        const cats = await response.json();
        displayCats(cats);
        createPagination(page, maxPages);
    } catch (error) {
        console.error('Error al obtener la información de los gatos:', error);
    }
}

function displayCats(cats) {
    const container = document.getElementById('cat-container');
    container.innerHTML = '';
    cats.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.classList.add('cat-card');

        const img = document.createElement('img');
        img.src = cat.url;
        img.alt = 'Cat Image';

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info');

        if (cat.breeds.length > 0) {
            const breed = cat.breeds[0];
            infoDiv.innerHTML = `<h3>${breed.name}</h3><p>${breed.description}</p>`;
        } else {
            infoDiv.innerHTML = '<p>No breed information available.</p>';
        }

        const likeButton = document.createElement('button');
        likeButton.classList.add('like-button');
        likeButton.textContent = 'Me gusta';
        likeButton.onclick = () => voteCat(cat.id, 'like');

        const dislikeButton = document.createElement('button');
        dislikeButton.classList.add('dislike-button');
        dislikeButton.textContent = 'No me gusta';
        dislikeButton.onclick = () => voteCat(cat.id, 'dislike');

        catDiv.appendChild(img);
        catDiv.appendChild(infoDiv);
        catDiv.appendChild(likeButton);
        catDiv.appendChild(dislikeButton);

        container.appendChild(catDiv);
    });
}

async function voteCat(catId, vote) {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                image_id: catId,
                value: vote === 'like' ? 1 : 0
            })
        });
        const result = await response.json();
        console.log(`Voto registrado: ${result.message}`);
        alert("voto registrado")
    } catch (error) {
        console.error('Error al votar:', error);
    }
}

async function searchCatByBreed(page = 1) {
    const breed = document.getElementById('breed-search').value;
    try {
        const breedResponse = await fetch(`https://api.thecatapi.com/v1/breeds/search?q=${breed}`, {
            headers: {
                'x-api-key': apiKey
            }
        });
        const breedData = await breedResponse.json();
        if (breedData.length > 0) {
            const breedId = breedData.map(b => b.id).join(',');
            const imageResponse = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=100`, {
                headers: {
                    'x-api-key': apiKey
                }
            });
            const imageData = await imageResponse.json();
            currentSearchResults = imageData;
            displayCats(imageData.slice((page - 1) * limit, page * limit));
            createPagination(page, Math.min(Math.ceil(imageData.length / limit), maxPages));
        } else {
            alert('No se encontró ninguna raza con ese nombre.');
        }
    } catch (error) {
        console.error('Error al buscar por raza:', error);
    }
}

function createPagination(currentPage, totalPages = maxPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => {
            if (i === currentPage) return;
            currentPage = i;
            if (currentSearchResults.length > 0) {
                displayCats(currentSearchResults.slice((i - 1) * limit, i * limit));
            } else {
                getCats(i);
            }
            createPagination(i, totalPages);
        };
        if (i === currentPage) {
            pageButton.style.fontWeight = 'bold';
        }
        pagination.appendChild(pageButton);
    }
}

getCats();
