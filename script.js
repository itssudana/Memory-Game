const board = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const playerDisplay = document.getElementById('player');
const leaderboardList = document.getElementById('leaderboard');

const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('playerName');
const levelSelect = document.getElementById('levelSelect');
const menu = document.getElementById('menu');
const gameInfo = document.getElementById('gameInfo');

const emojis = ['🍎','🍌','🍇','🍓','🍍','🥝','🍒','🥑','🥥','🥭','🍉','🍊','🍋','🍐','🍆','🌽','🥕','🍄'];
let gridSize, timeLimit;
let timer, timeLeft;
let firstCard = null;
let lockBoard = false;
let matchedPairs = 0;
let score = 0;
let playerName = "";

// Load leaderboard
function loadLeaderboard() {
  leaderboardList.innerHTML = '';
  const data = JSON.parse(localStorage.getItem('memoryLeaderboard') || '[]');
  data.sort((a,b)=>b.score - a.score);
  data.slice(0,5).forEach(item=>{
    const li = document.createElement('li');
    li.textContent = `${item.name} - Skor: ${item.score}`;
    leaderboardList.appendChild(li);
  });
}
loadLeaderboard();

// Start Game
startBtn.addEventListener('click', () => {
  playerName = nameInput.value.trim();
  if (!playerName) {
    alert('Input your name!');
    return;
  }

  gridSize = parseInt(levelSelect.value);
  timeLimit = gridSize === 4 ? 60 : gridSize === 6 ? 180 : 240;
  timeLeft = timeLimit;
  matchedPairs = 0;
  score = 0;
  scoreDisplay.textContent = score;
  playerDisplay.textContent = playerName;

  menu.classList.add('hidden');
  gameInfo.classList.remove('hidden');
  board.classList.remove('hidden');

  startGame();
});

function startGame() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
  
  const totalCards = gridSize * gridSize;
  const pairs = totalCards / 2;
  let gameEmojis = emojis.slice(0, pairs);
  let cards = [...gameEmojis, ...gameEmojis];
  
  cards.sort(() => Math.random() - 0.5);

  cards.forEach((emoji) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="inner-card">
        <div class="front">❓</div>
        <div class="back">${emoji}</div>
      </div>`;
    board.appendChild(card);
    card.addEventListener('click', () => flipCard(card, emoji));
  });

  // Timer
  clearInterval(timer);
  timerDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

function flipCard(card, emoji) {
  if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = {card, emoji};
    return;
  }

  if (emoji === firstCard.emoji) {
    card.classList.add('matched');
    firstCard.card.classList.add('matched');
    matchedPairs++;
    score += 10;
    scoreDisplay.textContent = score;
    firstCard = null;

    if (matchedPairs === (gridSize*gridSize)/2) {
      clearInterval(timer);
      endGame(true);
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      card.classList.remove('flipped');
      firstCard.card.classList.remove('flipped');
      firstCard = null;
      lockBoard = false;
    }, 1000);
  }
}

function endGame(win) {
  if (win) {
    document.body.classList.add('win-animation');
    showConfetti();
    alert(`🎉 You Win! Skor: ${score}`);
  } else {
    document.body.classList.add('lose-animation', 'shake');
    alert('⏰ Time out!');
  }

  // Save score to leaderboard
  const data = JSON.parse(localStorage.getItem('memoryLeaderboard') || '[]');
  data.push({name: playerName, score});
  localStorage.setItem('memoryLeaderboard', JSON.stringify(data));
  loadLeaderboard();

  // Reset 
  setTimeout(() => {
    document.body.classList.remove('win-animation', 'lose-animation', 'shake');
    menu.classList.remove('hidden');
    gameInfo.classList.add('hidden');
    board.classList.add('hidden');
  }, 1500);
}

function showConfetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    confetti.style.top = '-10px';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.opacity = 0.7;
    confetti.style.transform = `rotate(${Math.random()*360}deg)`;
    confetti.style.transition = 'transform 3s linear, top 3s linear';

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = '100vh';
      confetti.style.transform += ` translateY(100vh) rotate(${Math.random()*360}deg)`;
    }, 100);

    setTimeout(() => confetti.remove(), 3500);
  }
}
