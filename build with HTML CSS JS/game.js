// Game Configuration
const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    playerSpeed: 5,
    playerSize: 20,
    asteroidMinSize: 15,
    asteroidMaxSize: 35,
    powerUpSize: 15,
    maxAsteroids: 5,
    maxPowerUps: 3,
    baseSpawnRate: 0.02,
    powerUpSpawnRate: 0.01,
    difficultyIncrease: 1.05,
};

// Game State
const gameState = {
    isRunning: false,
    score: 0,
    health: 3,
    level: 1,
    difficultyMultiplier: 1,
    frameCount: 0,
};

// Load persisted high score (safely)
try {
    const saved = Number(localStorage.getItem('asteroid_highScore')) || 0;
    gameState.highScore = saved;
} catch (e) {
    gameState.highScore = 0;
}

// Player Object
const player = {
    x: CONFIG.canvasWidth / 2,
    y: CONFIG.canvasHeight - 50,
    width: CONFIG.playerSize,
    height: CONFIG.playerSize,
    dx: 0,
    dy: 0,
    hasShield: false,
    shieldTime: 0,
};

// Game Objects Arrays
const asteroids = [];
const powerUps = [];
const particles = [];

// Input Handling
const keys = {};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
});

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Improve touch/pointer behavior on mobile: prevent default touch scrolling on canvas
canvas.style.touchAction = 'none';

// Touch / Pointer state for mobile controls
const touchState = {
    active: false,
    x: 0,
    y: 0
};

// Pointer events (preferred) for unified mouse/touch handling
canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const rect = canvas.getBoundingClientRect();
    touchState.active = true;
    touchState.x = e.clientX - rect.left;
    touchState.y = e.clientY - rect.top;
});

canvas.addEventListener('pointermove', (e) => {
    if (!touchState.active) return;
    const rect = canvas.getBoundingClientRect();
    touchState.x = e.clientX - rect.left;
    touchState.y = e.clientY - rect.top;
});

canvas.addEventListener('pointerup', (e) => {
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    touchState.active = false;
});

canvas.addEventListener('pointercancel', (e) => {
    touchState.active = false;
});

// Fallback to touch events for older browsers that don't support pointer events
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    touchState.active = true;
    touchState.x = t.clientX - rect.left;
    touchState.y = t.clientY - rect.top;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (!touchState.active) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    touchState.x = t.clientX - rect.left;
    touchState.y = t.clientY - rect.top;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    touchState.active = false;
});

// Responsive canvas resize: set drawing buffer to match displayed size * devicePixelRatio
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    // avoid too-small sizes
    const displayWidth = Math.max(300, Math.floor(rect.width));
    const displayHeight = Math.max(200, Math.floor(rect.height));

    canvas.width = Math.floor(displayWidth * scale);
    canvas.height = Math.floor(displayHeight * scale);

    // make drawing commands work in CSS pixels by applying transform
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // update CONFIG to current canvas logical size (CSS pixels)
    CONFIG.canvasWidth = displayWidth;
    CONFIG.canvasHeight = displayHeight;
}

window.addEventListener('resize', () => {
    resizeCanvas();
});

// initial resize once DOM is ready
resizeCanvas();

// Asteroid Class
class Asteroid {
    constructor(x = null, y = null) {
        this.x = x !== null ? x : Math.random() * CONFIG.canvasWidth;
        this.y = y !== null ? y : -30;
        this.size = Math.random() * (CONFIG.asteroidMaxSize - CONFIG.asteroidMinSize) + CONFIG.asteroidMinSize;
        this.vx = (Math.random() - 0.5) * 2 * gameState.difficultyMultiplier;
        this.vy = Math.random() * 2 * gameState.difficultyMultiplier + 1 * gameState.difficultyMultiplier;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw asteroid shape
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = this.size * (0.8 + Math.random() * 0.2);
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    isOffScreen() {
        return this.y > CONFIG.canvasHeight + this.size || this.x < -this.size || this.x > CONFIG.canvasWidth + this.size;
    }
}

// PowerUp Class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.powerUpSize;
        this.type = type; // 'shield' or 'star'
        this.vy = 1.5;
        this.rotation = 0;
        this.rotationSpeed = 0.05;
    }

    update() {
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'shield') {
            // Draw shield
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00dd77';
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f3460';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('S', 0, 0);
        } else {
            // Draw star
            ctx.fillStyle = '#ffff00';
            drawStar(ctx, 0, 0, 5, this.size, this.size * 0.5);

            ctx.strokeStyle = '#ffdd00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }

    isOffScreen() {
        return this.y > CONFIG.canvasHeight;
    }
}

// Particle Class
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Utility Functions
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes * 2; i++) {
        let r = i % 2 === 0 ? outerRadius : innerRadius;
        ctx.lineTo(cx + Math.sin(i * step) * r, cy - Math.cos(i * step) * r);
    }
    ctx.closePath();
}


function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
}

function createExplosion(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            30
        ));
    }
}

// Game Logic
const game = {
    startGame() {
        clearGameObjects();
        gameState.isRunning = false;
        gameState.score = 0;
        gameState.health = 3;
        gameState.level = 1;
        gameState.difficultyMultiplier = 1;
        gameState.frameCount = 0;
        player.x = CONFIG.canvasWidth / 2;
        player.y = CONFIG.canvasHeight - 50;
        player.hasShield = false;
        document.getElementById('startScreen').classList.add('hide');
        gameState.isRunning = true;
    },

    resetGame() {
        document.getElementById('gameOverScreen').classList.remove('show');
        document.getElementById('startScreen').classList.remove('hide');
        resetGameState();
        clearGameObjects();
    },

    update() {
        if (!gameState.isRunning) return;

        // Update player movement
        player.dx = 0;
        player.dy = 0;

        // If touch is active, move player toward touch point (mobile-friendly)
        if (touchState.active) {
            const targetX = touchState.x;
            const targetY = touchState.y;
            const diffX = targetX - player.x;
            const diffY = targetY - player.y;
            const threshold = 4; // small deadzone to avoid jitter
            if (Math.abs(diffX) > threshold) player.dx = Math.sign(diffX) * CONFIG.playerSpeed;
            if (Math.abs(diffY) > threshold) player.dy = Math.sign(diffY) * CONFIG.playerSpeed;
        } else {
            if (keys['arrowup'] || keys['ArrowUp'] || keys['w'] || keys['W']) player.dy = -CONFIG.playerSpeed;
            if (keys['arrowdown'] || keys['ArrowDown'] || keys['s'] || keys['S']) player.dy = CONFIG.playerSpeed;
            if (keys['arrowleft'] || keys['ArrowLeft'] || keys['a'] || keys['A']) player.dx = -CONFIG.playerSpeed;
            if (keys['arrowright'] || keys['ArrowRight'] || keys['d'] || keys['D']) player.dx = CONFIG.playerSpeed;
        }

        // Apply movement with boundary checking
        player.x += player.dx;
        player.y += player.dy;

        // Boundary checking
        player.x = Math.max(0, Math.min(CONFIG.canvasWidth - player.width, player.x));
        player.y = Math.max(0, Math.min(CONFIG.canvasHeight - player.height, player.y));

        // Update shield
        if (player.hasShield) {
            player.shieldTime--;
            if (player.shieldTime <= 0) {
                player.hasShield = false;
            }
        }

        // Spawn asteroids
        if (Math.random() < CONFIG.baseSpawnRate * gameState.difficultyMultiplier && asteroids.length < CONFIG.maxAsteroids * gameState.difficultyMultiplier) {
            asteroids.push(new Asteroid());
        }

        // Spawn power-ups
        if (Math.random() < CONFIG.powerUpSpawnRate && powerUps.length < CONFIG.maxPowerUps) {
            const type = Math.random() > 0.6 ? 'shield' : 'star';
            powerUps.push(new PowerUp(Math.random() * CONFIG.canvasWidth, -20, type));
        }

        // Update asteroids
        for (let i = asteroids.length - 1; i >= 0; i--) {
            asteroids[i].update();

            // Check collision with player
            if (checkCircleCollision(player.x, player.y, player.width / 2, asteroids[i].x, asteroids[i].y, asteroids[i].size)) {
                if (player.hasShield) {
                    player.hasShield = false;
                    createExplosion(asteroids[i].x, asteroids[i].y, '#00ff88', 12);
                    asteroids.splice(i, 1);
                } else {
                    gameState.health--;
                    createExplosion(asteroids[i].x, asteroids[i].y, '#ff6b6b', 16);
                    asteroids.splice(i, 1);

                    if (gameState.health <= 0) {
                        game.endGame();
                    }
                }
                continue;
            }

            // Remove off-screen asteroids
            if (asteroids[i].isOffScreen()) {
                gameState.score += 10;
                asteroids.splice(i, 1);
            }
        }

        // Update power-ups
        for (let i = powerUps.length - 1; i >= 0; i--) {
            powerUps[i].update();

            // Check collision with player
            if (checkCircleCollision(player.x, player.y, player.width / 2, powerUps[i].x, powerUps[i].y, powerUps[i].size)) {
                if (powerUps[i].type === 'shield') {
                    player.hasShield = true;
                    player.shieldTime = 300; // 5 seconds at 60 FPS
                    createExplosion(powerUps[i].x, powerUps[i].y, '#00ff88', 8);
                } else {
                    gameState.score += 50;
                    createExplosion(powerUps[i].x, powerUps[i].y, '#ffff00', 10);
                }
                powerUps.splice(i, 1);
                continue;
            }

            // Remove off-screen power-ups
            if (powerUps[i].isOffScreen()) {
                powerUps.splice(i, 1);
            }
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }

        // Increase difficulty
        gameState.frameCount++;
        if (gameState.frameCount % 900 === 0) { // Every 15 seconds at 60 FPS
            gameState.level++;
            gameState.difficultyMultiplier *= CONFIG.difficultyIncrease;
            showLevelUp();
        }

        // Update UI
        document.getElementById('score').textContent = gameState.score;
        document.getElementById('health').textContent = gameState.health;
        document.getElementById('level').textContent = gameState.level;
        // Check and persist high score
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            try { localStorage.setItem('asteroid_highScore', String(gameState.highScore)); } catch (e) {}
        }
        const hsEl = document.getElementById('highScore');
        if (hsEl) hsEl.textContent = gameState.highScore;
    },

    draw() {
        // Clear canvas
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        // Draw grid background
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < CONFIG.canvasWidth; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, CONFIG.canvasHeight);
            ctx.stroke();
        }
        for (let i = 0; i < CONFIG.canvasHeight; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(CONFIG.canvasWidth, i);
            ctx.stroke();
        }

        // Draw asteroids
        asteroids.forEach(asteroid => asteroid.draw(ctx));

        // Draw power-ups
        powerUps.forEach(powerUp => powerUp.draw(ctx));

        // Draw particles
        particles.forEach(particle => particle.draw(ctx));

        // Draw player
        drawPlayer(ctx);

        // Draw shield indicator
        if (player.hasShield) {
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.5 + Math.sin(gameState.frameCount * 0.1) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.width + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
    },

    endGame() {
        gameState.isRunning = false;
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('gameOverScreen').classList.add('show');
    }
};

function drawPlayer(ctx) {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Draw spaceship
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(player.width / 2, player.height / 2);
    ctx.lineTo(0, player.height / 3);
    ctx.lineTo(-player.width / 2, player.height / 2);
    ctx.closePath();
    ctx.fill();

    // Glow effect
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Engine flame
    const flameHeight = 8 + Math.random() * 4;
    ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(-5, player.height / 2);
    ctx.lineTo(5, player.height / 2);
    ctx.lineTo(0, player.height / 2 + flameHeight);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function resetGameState() {
    gameState.isRunning = false;
    gameState.score = 0;
    gameState.health = 3;
    gameState.level = 1;
    gameState.difficultyMultiplier = 1;
    gameState.frameCount = 0;

    player.x = CONFIG.canvasWidth / 2;
    player.y = CONFIG.canvasHeight - 50;
    player.hasShield = false;
}

function clearGameObjects() {
    asteroids.length = 0;
    powerUps.length = 0;
    particles.length = 0;
}

function showLevelUp() {
    const levelBox = document.getElementById('levelBox');
    levelBox.classList.remove('show');
    setTimeout(() => levelBox.classList.add('show'), 10);
    setTimeout(() => levelBox.classList.remove('show'), 600);
}

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop and show menu screen
gameLoop();
document.getElementById('startScreen').classList.remove('hide');
