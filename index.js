let difficulty = "Easy";
let totalPairs = 6;
let matches = 0;
let clicks = 0;
let timeLimit = 30;
let timerInterval;
let flexInt = 33;

document.getElementById("easybtn").addEventListener("click", () => { setDifficulty("Easy", 6, 30, 33); });
document.getElementById("mediumbtn").addEventListener("click", () => { setDifficulty("Medium", 12, 60, 15); });
document.getElementById("hardbtn").addEventListener("click", () => { setDifficulty("Hard", 24, 120, 12); });
document.getElementById("expertbtn").addEventListener("click", () => { setDifficulty("Expert", 48, 300, 8); });

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

function setDifficulty(newDifficulty, pairs, time, flex) {
    difficulty = newDifficulty;
    totalPairs = pairs;
    timeLimit = time;
    flexInt = flex;
}

function reset() {
    document.querySelector('.btn.btn-primary.static-theme').style.display = 'inline-block';
    location.reload();
}

function gameStart() {
    matches = 0;
    clicks = 0;
    updateStats();
    generateCards(totalPairs);
    startTimer();
    document.querySelector('.btn.btn-primary.static-theme').style.display = 'none';
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLimit--;
        updateStats();
        if (timeLimit <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Game over.");
            disableAllCards();
        } else if (timeLimit % 20 === 0) {
            alert("Power Up!");
            revealAllCards();
        }
    }, 1000);
}

function updateStats() {
    const listItems = document.querySelectorAll("li");
    listItems.forEach(stat => {
        stat.style.visibility = "visible";
    });
    document.querySelector("#stats_container li:nth-child(1)").textContent = `Number of Pairs: ${totalPairs}`;
    document.querySelector("#stats_container li:nth-child(2)").textContent = `Number of Pairs Left: ${totalPairs / 2 - matches}`;
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

    for (let i = 0; i < numberOfCards / 2; i++) {
        const randomId = Math.floor(Math.random() * count) + 1;
        for (let j = 0; j < 2; j++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`).then(response => response.json()));
        }
    }

    const pokemons = await Promise.all(promises);
    pokemons.sort(() => 0.5 - Math.random());

    pokemons.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.className = 'pokemon-card';
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites.front_default}" class="pokemon" alt="${pokemon.name}">
            <img src="pokeball.png" class="pokeball-overlay" alt="Pokéball">
        `;
        cardContainer.appendChild(pokemonCard);

        pokemonCard.addEventListener('click', onCardsClick);
        pokemonCard.style.flexBasis = `${flexInt}%`;
    });
}

let firstCard = undefined;
let secondCard = undefined;
let lockBoard = false;

const onCardsClick = function (e) {
    if (lockBoard) return;
    if (this === firstCard?.parentNode) return;

    this.classList.add("flip");
    clicks++;
    if (!firstCard) {
        firstCard = this.querySelector("img.pokemon");
        firstCard.parentNode.classList.add("flip");
    } else {
        secondCard = this.querySelector("img.pokemon");
        secondCard.parentNode.classList.add("flip");

        lockBoard = true;
        if (firstCard.src === secondCard.src) {
            matches++;
            disableCards();
        } else {
            unflipCards();
        }
    }
    updateStats();
    setTimeout(() => {
        checkWin();
    }, 1000);
};

function disableCards() {
    firstCard.parentNode.removeEventListener("click", onCardsClick);
    secondCard.parentNode.removeEventListener("click", onCardsClick);
    resetBoard();
}

function unflipCards() {
    setTimeout(() => {
        firstCard.parentNode.classList.remove("flip");
        secondCard.parentNode.classList.remove("flip");
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function checkWin() {
    if (matches === totalPairs / 2) {
        alert("You win!");
        clearInterval(timerInterval);
    }
}

function revealAllCards() {
    const cards = document.querySelectorAll('.pokemon-card:not(.flip)');
    cards.forEach(card => card.classList.add('flip'));
    setTimeout(() => {
        cards.forEach(card => card.classList.remove('flip'));
    }, 1000);
}

function disableAllCards() {
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => card.removeEventListener('click', onCardsClick));
}

document.querySelectorAll('.pokemon-card').forEach(card => card.addEventListener('click', onCardsClick));
