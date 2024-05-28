let difficulty = "Easy";
let totalPairs = 6;
let matches = 0;
let clicks = 0;
let timeLimit = 30;
let timerInterval;

const easybtn = document.getElementById("easybtn").addEventListener("click", () => { setDifficulty("Easy", 6, 30); });
const mediumbtn = document.getElementById("mediumbtn").addEventListener("click", () => { setDifficulty("Medium", 12, 60); });
const hardbtn = document.getElementById("hardbtn").addEventListener("click", () => { setDifficulty("Hard", 24, 120); });
const expertbtn = document.getElementById("expertbtn").addEventListener("click", () => { setDifficulty("Expert", 48, 300); });

document.getElementById("lightbtn").addEventListener("click", () => { setTheme("light"); });
document.getElementById("darkbtn").addEventListener("click", () => { setTheme("dark"); });

function setTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
    }
}

function setDifficulty(newDifficulty, pairs, time) {
    difficulty = newDifficulty;
    totalPairs = pairs;
    timeLimit = time;
}

function reset() {
    location.reload();
}

function gameStart() {
    matches = 0;
    clicks = 0;
    updateStats();
    generateCards(totalPairs * 2);
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLimit--;
        updateStats();
        if (timeLimit <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Game over.");
        }
    }, 1000);
}

function updateStats() {
    const listItems = document.querySelectorAll("li");
    listItems.forEach(stat => {
        stat.style.visibility = "visible";
    })
    document.querySelector("#stats_container li:nth-child(1)").textContent = `Number of Pairs: ${totalPairs}`;
    document.querySelector("#stats_container li:nth-child(2)").textContent = `Number of Pairs Left: ${totalPairs - matches}`;
    document.querySelector("#stats_container li:nth-child(3)").textContent = `Number of Matches: ${matches}`;
    document.querySelector("#stats_container li:nth-child(4)").textContent = `Number of Clicks: ${clicks}`;
    document.querySelector("#stats_container li:nth-child(5)").textContent = `You have ${timeLimit} seconds!`;
}

async function getPokemonCount() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species/');
    const data = await response.json();
    return data.count;
}

async function generateCards(numberOfCards) {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ''; // Clear previous cards

    const count = await getPokemonCount();
    const promises = [];

    for (let i = 0; i < numberOfCards; i++) {
        const randomId = Math.floor(Math.random() * count) + 1;
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`).then(response => response.json()));
    }

    const pokemons = await Promise.all(promises);
    const cardsPerRow = Math.ceil(Math.sqrt(numberOfCards));

    cardContainer.style.gridTemplateColumns = `repeat(${cardsPerRow}, 1fr)`;

    pokemons.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.className = 'pokemon-card';
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites.front_default}" class="pokemon" alt="${pokemon.name}">
            <img src="pokeball.png" class="pokeball-overlay" alt="Pokéball">
        `;
        cardContainer.appendChild(pokemonCard);

        const pokeballOverlay = pokemonCard.querySelector('.pokeball-overlay');
        pokeballOverlay.addEventListener('click', function () {
            pokeballOverlay.style.display = 'none';
            pokemonCard.querySelector('img.pokemon').style.display = 'block';
            pokemonCard.classList.toggle('flip');
        });

        pokemonCard.addEventListener('click', onCardsClick);
    });
}

let firstCard = undefined;
let secondCard = undefined;

function onCardsClick(e) {
    if (!firstCard) {
        firstCard = this.querySelector('img.pokemon');
        this.removeEventListener('click', onCardsClick);
    } else {
        secondCard = this.querySelector('img.pokemon');
        this.removeEventListener('click', onCardsClick);
    }

    if (firstCard && secondCard) {
        if (firstCard.src === secondCard.src) {
            firstCard = undefined;
            secondCard = undefined;
        } else {
            setTimeout(() => {
                firstCard.parentNode.querySelector('.pokeball-overlay').style.display = 'block';
                firstCard.style.display = 'none';
                secondCard.parentNode.querySelector('.pokeball-overlay').style.display = 'block';
                secondCard.style.display = 'none';
                firstCard.parentNode.addEventListener('click', onCardsClick);
                secondCard.parentNode.addEventListener('click', onCardsClick);
                firstCard.parentNode.classList.toggle('flip');
                secondCard.parentNode.classList.toggle('flip');
                firstCard = undefined;
                secondCard = undefined;
            }, 1000);
        }
    }
}
