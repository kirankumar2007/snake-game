const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const finalScore = document.getElementById('finalScore');
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
let speedBoostActive = false;

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
    ctx.fillStyle = '#202020';
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
    ctx.lineJoin = "round";
    ctx.lineWidth = gridSize - 10;
    snake.forEach((segment, index) => {
        ctx.fillStyle = `hsl(${(index * 10) % 360}, 100%, 50%)`; // Gradient effect
        ctx.strokeStyle = 'black';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = '#ff4500';
    ctx.strokeStyle = '#b22222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
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
    finalScore.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    generateFood();
    dx = 1;
    dy = 0;
    score = 0;
    level = 1;
    gameSpeed = 100;
    speedBoostActive = false;
    updateScore();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
}

function checkLevelUp() {
    if (score > 0 && score % 5 === 0 && score / 5 + 1 > level) {
        level++;
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
        case ' ':
            toggleSpeedBoost();
            break;
    }
});

function toggleSpeedBoost() {
    if (!speedBoostActive) {
        gameSpeed /= 2;
        speedBoostActive = true;
    } else {
        gameSpeed *= 2;
        speedBoostActive = false;
    }
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
}

highScoreDisplay.textContent = `High Score: ${highScore}`;