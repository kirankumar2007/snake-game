const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const finalScore = document.getElementById('finalScore');
const scoreboard = document.getElementById('scoreboard');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let level = 1;
let highScore = 0;
let gameSpeed = 100;
let gameLoop;
let isPaused = false;
let scores = [];

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    resetGame();
    gameLoop = setInterval(drawGame, gameSpeed);
}

function drawGame() {
    if (isPaused) return;
    
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    updateScore();
    checkLevelUp();
}

function clearCanvas() {
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        eatSound.play();
        generateFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'darkgreen' : `rgb(0, ${155 + index * 10}, 0)`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc((food.x * gridSize) + gridSize / 2, (food.y * gridSize) + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function generateFood() {
    do {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameOverSound.play();
    scores.push(score);
    scores.sort((a, b) => b - a);
    if (scores.length > 5) scores.pop();
    updateScoreboard();
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
    finalScore.textContent = score;
    gameOverScreen.style.display = 'flex';
}

function updateScoreboard() {
    scoreboard.innerHTML = '';
    scores.forEach((score, index) => {
        const scoreItem = document.createElement('li');
        scoreItem.textContent = `${index + 1}. ${score}`;
        scoreboard.appendChild(scoreItem);
    });
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    gameSpeed = 100;
    updateScore();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
}

function checkLevelUp() {
    if (score > 0 && score % 5 === 0) {
        level = Math.floor(score / 5) + 1;
        gameSpeed = Math.max(50, 100 - (level - 1) * 10);
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        isPaused = !isPaused;
        return;
    }

    if (isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

highScoreDisplay.textContent = `High Score: ${highScore}`;