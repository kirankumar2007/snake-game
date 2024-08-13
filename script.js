// Constants
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const INITIAL_SPEED = 150;
const MAX_SPEED = 50;
const SPEED_INCREMENT = 5;
const POINTS_PER_FOOD = 10;
const FOOD_TYPES = [
    { color: '#ff4500', points: POINTS_PER_FOOD },
    { color: '#ffd700', points: POINTS_PER_FOOD * 2 },
    { color: '#7cfc00', points: POINTS_PER_FOOD * 3 }
];

// Game state
let snake, food, direction, nextDirection, score, highScore, level, gameLoop, isPaused, speedBoostActive;

// DOM Elements
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

// Initialize game
function initGame() {
    snake = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({ x: 10 - i, y: 10 }));
    direction = { x: 1, y: 0 };
    nextDirection = { ...direction };
    score = 0;
    level = 1;
    isPaused = false;
    speedBoostActive = false;
    highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    generateFood();
    updateScore();
}

// Start game
function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    initGame();
    gameLoop = setInterval(gameStep, INITIAL_SPEED);
}

// Game step
function gameStep() {
    if (isPaused) return;
    moveSnake();
    checkCollision();
    drawGame();
}

// Move snake
function moveSnake() {
    direction = { ...nextDirection };
    const head = {
        x: (snake[0].x + direction.x + canvas.width / GRID_SIZE) % (canvas.width / GRID_SIZE),
        y: (snake[0].y + direction.y + canvas.height / GRID_SIZE) % (canvas.height / GRID_SIZE)
    };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        eatFood();
    } else {
        snake.pop();
    }
}

// Check collision
function checkCollision() {
    const [head, ...body] = snake;
    if (body.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
    }
}

// Eat food
function eatFood() {
    score += food.points;
    eatSound.play();
    if (snake.length % 5 === 0) {
        levelUp();
    }
    generateFood();
    updateScore();
}

// Generate food
function generateFood() {
    const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
    do {
        food = {
            x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / GRID_SIZE)),
            ...foodType
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Level up
function levelUp() {
    level++;
    const newSpeed = Math.max(MAX_SPEED, INITIAL_SPEED - (level - 1) * SPEED_INCREMENT);
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, newSpeed);
}

// Draw game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.lineJoin = "round";
    ctx.lineWidth = GRID_SIZE - 2;
    snake.forEach((segment, index) => {
        const hue = (index * 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.strokeStyle = 'black';
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });

    // Draw food
    ctx.fillStyle = food.color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * GRID_SIZE, (food.y + 0.5) * GRID_SIZE, GRID_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw speed boost indicator
    if (speedBoostActive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, 0, canvas.width, 5);
    }
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameOverSound.play();
    finalScore.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }
    gameOverScreen.style.display = 'flex';
}

// Update score
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
}

// Toggle speed boost
function toggleSpeedBoost() {
    speedBoostActive = !speedBoostActive;
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, speedBoostActive ? MAX_SPEED : Math.max(MAX_SPEED, INITIAL_SPEED - (level - 1) * SPEED_INCREMENT));
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        isPaused = !isPaused;
        return;
    }

    if (isPaused) return;

    const keyDirections = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 }
    };

    if (keyDirections[e.key]) {
        const newDirection = keyDirections[e.key];
        if (newDirection.x !== -direction.x && newDirection.y !== -direction.y) {
            nextDirection = newDirection;
        }
    } else if (e.key === ' ') {
        toggleSpeedBoost();
    }
});

// Touch controls
let touchStartX, touchStartY;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (isPaused) return;
    e.preventDefault();
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
    } else {
        nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
    }
});

// Initialize high score
highScoreDisplay.textContent = `High Score: ${localStorage.getItem('snakeHighScore') || 0}`;