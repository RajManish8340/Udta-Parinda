
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const bestScoreElement = document.getElementById('bestScore');
const instructionsElement = document.getElementById('instructions');

let gameState = 'waiting'; // 'waiting', 'playing', 'gameOver'
let score = 0;
let bestScore = 0;
let gameSpeed = 2;

const bird = {
    x: 80,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.12,
    jump: -4,
    color: '#FFD700',
    wingColor: '#FFA500'
};

const pipes = [];
const pipeWidth = 80;
const pipeGap = 250;
let pipeSpawnTimer = 0;
const pipeSpawnRate = 100;

const ground = {
    x: 0,
    y: canvas.height - 50,
    width: canvas.width,
    height: 50
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleInput();
    }
});

canvas.addEventListener('click', handleInput);

function handleInput() {
    if (gameState === 'waiting') {
        startGame();
    } else if (gameState === 'playing') {
        bird.velocity = bird.jump;
    } else if (gameState === 'gameOver') {
        restartGame();
    }
}

function startGame() {
    gameState = 'playing';
    instructionsElement.style.display = 'none';
    bird.velocity = bird.jump;
}

function restartGame() {
    gameState = 'waiting';
    score = 0;
    gameSpeed = 2;
    bird.x = 80;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    pipeSpawnTimer = 0;
    gameOverElement.style.display = 'none';
    instructionsElement.style.display = 'block';
    scoreElement.textContent = '0';
}

function updateBird() {
    if (gameState !== 'playing') return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > ground.y || bird.y < 0) {
        endGame();
    }
}

function updatePipes() {
    if (gameState !== 'playing') return;

    pipeSpawnTimer++;
    if (pipeSpawnTimer >= pipeSpawnRate) {
        spawnPipe();
        pipeSpawnTimer = 0;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= gameSpeed;

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            continue;
        }

        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.scored = true;
            scoreElement.textContent = score;
            
            if (score % 5 === 0) {
                gameSpeed += 0.2;
            }
        }

        if (checkCollision(bird, pipe)) {
            endGame();
        }
    }
}

function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - ground.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        bottomHeight: ground.y - (topHeight + pipeGap),
        scored: false
    });
}

function checkCollision(bird, pipe) {
    if (bird.x < pipe.x + pipeWidth &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.topHeight) {
        return true;
    }

    if (bird.x < pipe.x + pipeWidth &&
        bird.x + bird.width > pipe.x &&
        bird.y + bird.height > pipe.bottomY) {
        return true;
    }

    return false;
}

function endGame() {
    gameState = 'gameOver';
    
    if (score > bestScore) {
        bestScore = score;
    }
    
    finalScoreElement.textContent = score;
    bestScoreElement.textContent = bestScore;
    gameOverElement.style.display = 'block';
}

function drawBird() {
    ctx.save();
    
    ctx.fillStyle = bird.color;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    ctx.fillStyle = bird.wingColor;
    ctx.fillRect(bird.x + 5, bird.y + 5, 15, 10);
    
    ctx.fillStyle = 'white';
    ctx.fillRect(bird.x + 25, bird.y + 5, 8, 8);
    ctx.fillStyle = 'black';
    ctx.fillRect(bird.x + 27, bird.y + 7, 4, 4);
    
    // Bird beak
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(bird.x + 35, bird.y + 12, 8, 6);
    
    ctx.restore();
}

function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
        
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 30);
        ctx.fillStyle = '#228B22';
    });
}

function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
    
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, ground.y + 10, 10, 5);
        ctx.fillRect(i + 10, ground.y + 20, 10, 5);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const x1 = canvas.width - 100 + Math.cos(angle) * 50;
        const y1 = 80 + Math.sin(angle) * 50;
        const x2 = canvas.width - 100 + Math.cos(angle) * 70;
        const y2 = 80 + Math.sin(angle) * 70;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawGround();
    drawPipes();
    drawBird();
    
    updateBird();
    updatePipes();
    
    requestAnimationFrame(gameLoop);
}

function init() {
    restartGame();
    gameLoop();
}

init();