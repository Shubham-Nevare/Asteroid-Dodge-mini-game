# 🚀 Asteroid Dodge - Mini Web Game

A fast-paced, retro-styled arcade game built with vanilla HTML5, CSS3, and JavaScript. Dodge asteroids, collect power-ups, and survive as long as possible!

## 🎮 Game Overview

**Asteroid Dodge** is a single-screen browser game where players control a spaceship and navigate through an asteroid field. The game features progressive difficulty, power-ups, particle effects, and a polished UI.

### Features

- 🎯 **Simple & Engaging Gameplay** - Control your spaceship and dodge incoming asteroids
- ⚡ **Smooth Performance** - 60 FPS canvas-based rendering
- 🛡️ **Power-up System** - Collect shields for protection and stars for bonus points
- 📈 **Progressive Difficulty** - Asteroids spawn faster every 15 seconds
- ✨ **Polish & Effects** - Particle explosions, glowing UI, smooth animations
- 📱 **Responsive Controls** - Arrow keys or WASD support
- 🎨 **Modern Visuals** - Neon cyberpunk aesthetic with gradient backgrounds

## 🕹️ How to Play

1. Open `index.html` in your web browser
2. Click the **PLAY NOW** button
3. Use arrow keys or WASD to move your spaceship
4. Avoid the **red asteroids** - they damage your health
5. Collect **green shields (S)** for temporary protection (5 seconds)
6. Collect **yellow stars (⭐)** for 50 bonus points
7. Survive as long as possible to maximize your score
8. Health decreases by 1 with each asteroid collision
9. Game ends when health reaches 0

## 🎯 Game Mechanics

### Scoring
- **+10 points** - Each asteroid dodged
- **+50 points** - Each star collected
- **Shield pickup** - Grants 5-second protection period

### Difficulty
- Game difficulty increases every 15 seconds
- Level counter shows current difficulty level
- Asteroids spawn faster with each level
- Maximum asteroids on screen increases with difficulty

### Power-ups
- **Green Shield (S)** - Blocks one asteroid without taking damage
- **Yellow Star (⭐)** - Grants bonus points

## 📁 Project Structure

```
testgame/
├── index.html          # Main HTML file with structure
├── styles.css          # All styling and animations
├── game.js             # Game logic and mechanics
└── README.md           # This file
```

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** - For rendering game graphics
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **CSS3** - For UI styling and animations
- **No external dependencies** - Fully self-contained

### Game Architecture
- **Object-Oriented Design** - Classes for Asteroid, PowerUp, and Particle
- **Game Loop** - RequestAnimationFrame for smooth 60 FPS
- **Collision Detection** - Circle-based collision system
- **State Management** - Centralized game state object
- **Clean Code** - Well-organized, commented, and readable

### Key Classes

**Asteroid**
- Random size, rotation, and velocity
- Jagged shape with glow effect
- Moves across screen and despawns when off-screen

**PowerUp**
- Two types: Shield and Star
- Rotating animation with visual distinction
- Collision detection with player

**Particle**
- Explosion effects on collisions
- Physics simulation with gravity
- Fade-out animation

## 🎨 Visual Design

- **Color Scheme** - Neon cyan (#00ff88), red (#e94560), yellow (#ffff00)
- **Background** - Gradient with grid overlay
- **Player Ship** - Green triangle with engine flame
- **UI** - Semi-transparent dark boxes with glowing borders
- **Animations** - Smooth transitions, pulsing effects, particle bursts

## ⌨️ Controls

| Key | Action |
|-----|--------|
| **↑ Arrow Up** | Move Up |
| **↓ Arrow Down** | Move Down |
| **← Arrow Left** | Move Left |
| **→ Arrow Right** | Move Right |
| **W** | Move Up |
| **A** | Move Left |
| **S** | Move Down |
| **D** | Move Right |

## 📊 Game Statistics Tracked

- **Score** - Total points earned
- **Health** - Remaining lives (1-3)
- **Level** - Current difficulty level
- **Frame Count** - Internal timing for difficulty scaling

## 🚀 Deployment

To deploy this game online:

1. Upload all three files (`index.html`, `styles.css`, `game.js`) to your hosting
2. Access the game via the URL to your `index.html`
3. Share the live demo URL

### Recommended Hosting
- GitHub Pages (free, for static files)
- Netlify (free, easy deployment)
- Vercel (free, optimized for web)
- Any static file hosting service

## 🎓 Code Quality

- **Readable** - Clear variable names and comments
- **Modular** - Separated concerns (HTML structure, CSS styling, JS logic)
- **Performant** - Efficient collision detection and rendering
- **Maintainable** - Easy to extend with new features
- **Professional** - Industry-standard practices

## 🔮 Possible Enhancements

- Sound effects and background music
- High score leaderboard (localStorage)
- Different difficulty modes
- Boss fights at level milestones
- Multiple player lives with power-ups
- Combo system for consecutive dodges
- Achievements/badges
- Mobile touch controls

## 📝 License

This project is free to use and modify for personal or commercial purposes.

## 👨‍💻 Author

Created as a technical assessment project demonstrating:
- Creativity in game design
- Code quality and organization
- Smooth performance and responsiveness
- Polish and visual appeal

---

**Enjoy the game! 🚀 Dodge those asteroids! 🌌**
