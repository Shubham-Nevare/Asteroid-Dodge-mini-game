'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

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

    // Load persisted high score
    try {
      const saved = Number(localStorage.getItem('asteroid_highScore')) || 0;
      gameState.highScore = saved;
    } catch (e) {
      gameState.highScore = 0;
    }

    // Player Object (x,y are CENTER coordinates)
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

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keys[key] = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keys[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mobile / Pointer input state and handlers
    canvas.style.touchAction = 'none';
    const touchState = { active: false, x: 0, y: 0 };

    const onPointerDown = (e) => {
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      const rect = canvas.getBoundingClientRect();
      touchState.active = true;
      touchState.x = e.clientX - rect.left;
      touchState.y = e.clientY - rect.top;
    };

    const onPointerMove = (e) => {
      if (!touchState.active) return;
      const rect = canvas.getBoundingClientRect();
      touchState.x = e.clientX - rect.left;
      touchState.y = e.clientY - rect.top;
    };

    const onPointerUp = (e) => {
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      touchState.active = false;
    };

    const onPointerCancel = (e) => { touchState.active = false; };

    const onTouchStart = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      touchState.active = true;
      touchState.x = t.clientX - rect.left;
      touchState.y = t.clientY - rect.top;
      e.preventDefault();
    };

    const onTouchMove = (e) => {
      if (!touchState.active) return;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      touchState.x = t.clientX - rect.left;
      touchState.y = t.clientY - rect.top;
      e.preventDefault();
    };

    const onTouchEnd = (e) => { touchState.active = false; };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

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

        // stable shape offsets so draw() doesn't flicker
        this.points = 8;
        this.shapeOffsets = Array.from({ length: this.points }, () => 0.8 + Math.random() * 0.2);
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

        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        for (let i = 0; i < this.points; i++) {
          const angle = (i / this.points) * Math.PI * 2;
          const radius = this.size * this.shapeOffsets[i];
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

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
        this.type = type;
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
        this.vy += 0.1;
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

    function drawPlayer(ctx) {
      ctx.save();
      ctx.translate(player.x, player.y);

      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.moveTo(0, -player.height / 2);
      ctx.lineTo(player.width / 2, player.height / 2);
      ctx.lineTo(0, player.height / 3);
      ctx.lineTo(-player.width / 2, player.height / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

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

    function clearGameObjects() {
      asteroids.length = 0;
      powerUps.length = 0;
      particles.length = 0;
    }

    function showLevelUp() {
      const levelBox = document.getElementById('levelBox');
      if (levelBox) {
        levelBox.classList.remove('show');
        setTimeout(() => levelBox.classList.add('show'), 10);
        setTimeout(() => levelBox.classList.remove('show'), 600);
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
        const startScreen = document.getElementById('startScreen');
        if (startScreen) startScreen.classList.add('hide');
        gameState.isRunning = true;
      },

      resetGame() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const startScreen = document.getElementById('startScreen');
        if (gameOverScreen) gameOverScreen.classList.remove('show');
        if (startScreen) startScreen.classList.remove('hide');
        clearGameObjects();
      },

      update() {
        if (!gameState.isRunning) return;

        player.dx = 0;
        player.dy = 0;

        // If touch is active, move player toward touch point (mobile-friendly)
        if (touchState && touchState.active) {
          const targetX = touchState.x;
          const targetY = touchState.y;
          const diffX = targetX - player.x;
          const diffY = targetY - player.y;
          const threshold = 4;
          if (Math.abs(diffX) > threshold) player.dx = Math.sign(diffX) * CONFIG.playerSpeed;
          if (Math.abs(diffY) > threshold) player.dy = Math.sign(diffY) * CONFIG.playerSpeed;
        } else {
          // keys are stored lowercase by the handlers
          if (keys['arrowup'] || keys['w']) player.dy = -CONFIG.playerSpeed;
          if (keys['arrowdown'] || keys['s']) player.dy = CONFIG.playerSpeed;
          if (keys['arrowleft'] || keys['a']) player.dx = -CONFIG.playerSpeed;
          if (keys['arrowright'] || keys['d']) player.dx = CONFIG.playerSpeed;
        }

        player.x += player.dx;
        player.y += player.dy;

        // clamp using CENTER coordinates
        const halfW = player.width / 2;
        const halfH = player.height / 2;
        player.x = Math.max(halfW, Math.min(CONFIG.canvasWidth - halfW, player.x));
        player.y = Math.max(halfH, Math.min(CONFIG.canvasHeight - halfH, player.y));

        if (player.hasShield) {
          player.shieldTime--;
          if (player.shieldTime <= 0) {
            player.hasShield = false;
          }
        }

        if (Math.random() < CONFIG.baseSpawnRate * gameState.difficultyMultiplier && asteroids.length < Math.max(1, Math.floor(CONFIG.maxAsteroids * gameState.difficultyMultiplier))) {
          asteroids.push(new Asteroid());
        }

        if (Math.random() < CONFIG.powerUpSpawnRate && powerUps.length < CONFIG.maxPowerUps) {
          const type = Math.random() > 0.6 ? 'shield' : 'star';
          powerUps.push(new PowerUp(Math.random() * CONFIG.canvasWidth, -20, type));
        }

        for (let i = asteroids.length - 1; i >= 0; i--) {
          asteroids[i].update();

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

          if (asteroids[i].isOffScreen()) {
            gameState.score += 10;
            asteroids.splice(i, 1);
          }
        }

        for (let i = powerUps.length - 1; i >= 0; i--) {
          powerUps[i].update();

          if (checkCircleCollision(player.x, player.y, player.width / 2, powerUps[i].x, powerUps[i].y, powerUps[i].size)) {
            if (powerUps[i].type === 'shield') {
              player.hasShield = true;
              player.shieldTime = 300;
              createExplosion(powerUps[i].x, powerUps[i].y, '#00ff88', 8);
            } else {
              gameState.score += 50;
              createExplosion(powerUps[i].x, powerUps[i].y, '#ffff00', 10);
            }
            powerUps.splice(i, 1);
            continue;
          }

          if (powerUps[i].isOffScreen()) {
            powerUps.splice(i, 1);
          }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update();
          if (particles[i].isDead()) {
            particles.splice(i, 1);
          }
        }

        gameState.frameCount++;
        if (gameState.frameCount % 900 === 0) {
          gameState.level++;
          gameState.difficultyMultiplier *= CONFIG.difficultyIncrease;
          showLevelUp();
        }

        const scoreEl = document.getElementById('score');
        const healthEl = document.getElementById('health');
        const levelEl = document.getElementById('level');
        const highEl = document.getElementById('highScore');
        if (scoreEl) scoreEl.textContent = gameState.score;
        if (healthEl) healthEl.textContent = gameState.health;
        if (levelEl) levelEl.textContent = gameState.level;
        // update and persist high score
        if (typeof gameState.highScore === 'number') {
          if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            try { localStorage.setItem('asteroid_highScore', String(gameState.highScore)); } catch (e) {}
          }
          if (highEl) highEl.textContent = gameState.highScore;
        }
      },

      draw() {
        ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

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

        asteroids.forEach(asteroid => asteroid.draw(ctx));
        powerUps.forEach(powerUp => powerUp.draw(ctx));
        particles.forEach(particle => particle.draw(ctx));

        drawPlayer(ctx);

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
        const finalScoreEl = document.getElementById('finalScore');
        if (finalScoreEl) finalScoreEl.textContent = gameState.score;
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) gameOverScreen.classList.add('show');
      }
    };

    function gameLoop() {
      game.update();
      game.draw();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // Make game object global
    window.game = game;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // remove canvas pointer/touch listeners
      try {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerCancel);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.style.touchAction = '';
      } catch (e) {}
      // cleanup global
      if (window.game === game) delete window.game;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
        <div className="relative w-full h-full bg-linear-to-b from-blue-900 to-slate-900 border-4 border-red-500 rounded-lg overflow-hidden shadow-2xl" style={{ boxShadow: '0 0 50px rgba(233, 69, 96, 0.5)' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="absolute inset-0 w-full h-full"
          />

          
          <div className="absolute top-5 left-5 right-5 flex justify-between text-white font-bold text-sm md:text-lg pointer-events-none z-10">
            <div className="bg-black/50 px-3 md:px-5 py-2 rounded border-2 border-red-500">Score: <span id="score">0</span></div>
            <div className="bg-black/50 px-3 md:px-5 py-2 rounded border-2 border-red-500">Highest Score: <span id="highScore">0</span></div>
            <div className="bg-black/50 px-3 md:px-5 py-2 rounded border-2 border-red-500">Health: <span id="health">3</span></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-base bg-black/50 px-5 py-2 rounded border-2 border-red-500 pointer-events-none z-10" id="levelBox" style={{ display: 'none' }}>
            Level <span id="level">1</span>
          </div>

          {/* Start Screen */}
          <div id="startScreen" className="absolute inset-0 bg-black/95 flex items-center justify-center flex-col z-50 backdrop-blur-sm" style={{ animation: 'slideDown 0.5s ease-out' }}>
            <div className="text-center px-4">
              <h1 className="text-3xl md:text-5xl font-bold mb-5 text-green-400 glowing">🚀 ASTEROID DODGE</h1>
              <p className="text-gray-400 mb-5 text-sm md:text-base">Survive the asteroid storm!</p>
              <ul className="text-gray-300 mb-8 text-xs md:text-sm space-y-2 inline-block text-left">
                <li>▶ Use ARROW KEYS or WASD to move</li>
                <li>▶ Avoid red asteroids</li>
                <li>▶ Collect green shields for protection</li>
                <li>▶ Collect blue stars for bonus points</li>
                <li>▶ Survive as long as possible</li>
              </ul>
              <button
                onClick={() => window.game?.startGame()}
                className="mt-6 px-8 md:px-12 py-2 md:py-3 text-sm md:text-xl font-bold bg-linear-to-r from-green-500 to-emerald-600 text-black rounded hover:scale-105 transition-transform active:scale-95 cursor-pointer"
              >
                PLAY NOW
              </button>
            </div>
          </div>

          {/* Game Over Screen */}
          <div id="gameOverScreen" className="absolute inset-0 bg-black/90 items-center justify-center flex-col z-40 backdrop-blur-sm" style={{ animation: 'slideDown 0.5s ease-out', display: 'none' }}>
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-5 text-red-500">GAME OVER</h1>
              <p className="text-2xl text-gray-300 mb-3">You crashed into an asteroid!</p>
              <p className="text-3xl font-bold text-green-400 my-6">Final Score: <span id="finalScore">0</span></p>
              <button
                onClick={() => window.game?.resetGame()}
                className="mt-8 px-12 py-3 text-xl font-bold bg-linear-to-r from-red-500 to-pink-600 text-white rounded hover:scale-105 transition-transform active:scale-95"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>

          <div className="absolute bottom-5 left-5 text-xs text-gray-600 pointer-events-none">
            Arrow Keys or WASD to move
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glowing {
          animation: glow 2s infinite;
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px #00ff88; }
          50% { text-shadow: 0 0 40px #00ff88; }
        }

        #gameOverScreen.show {
          display: flex !important;
        }

        .hide {
          display: none !important;
        }

        #levelBox.show {
          display: block !important;
          animation: pulse 0.5s ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
