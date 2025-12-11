# 🎮 Game Zone

A simple, responsive browser-based game collection featuring **Tic Tac Toe** and **Rock Paper Scissors**.

---

## Games

### Tic Tac Toe
- **How to play**: Click any empty square to mark it with X. The computer plays as O.
- **AI**: Uses Minimax algorithm — the computer is unbeatable.
- **Board**: 3×3 grid with fixed 70px square cells, responsive on all screen sizes.
- **Controls**: Click "New Game" to restart.

### Rock Paper Scissors
- **How to play**: Enter your name (optional), then click Rock, Paper, or Scissors.
- **Match format**: Best of 3 rounds.
- **Scoring**: Cumulative scores persist using browser localStorage.
- **Controls**: 
  - Click a choice button to play a round.
  - Click "Play Again" to restart and clear scores.

---

## Features

✅ **Responsive Design** — works on desktop, tablet, and mobile  
✅ **Persistent Scores** — RPS scores saved in localStorage  
✅ **Clean UI** — gradient colors, emoji icons, smooth animations  
✅ **No dependencies** — pure HTML, CSS, and vanilla JavaScript  
✅ **Toggle between games** — switch instantly with top buttons  

---

## Files

- `index.html` — main page and game containers
- `styles.css` — all styling (responsive, animations, layouts)
- `script.js` — game logic for both games and UI glue
- `favicon.svg` — 🎮 icon for browser tabs

---

## How to Run

1. Open `index.html` in any modern browser.
2. Click "Tic Tac Toe" or "Rock Paper Scissors" to switch games.
3. Play!

No server or build step needed.

---

## Technical Notes

### Tic Tac Toe AI (Minimax)
The computer move is calculated using a recursive Minimax algorithm that evaluates all possible future board states. The algorithm:
- Returns optimal moves in O(9!) time but caches nothing (small board = instant).
- Always ties or wins (never loses).
- Uses depth penalty to prefer faster wins.

### RPS Scoring
Scores are saved to `localStorage` under the key `"rpsScores"` as a JSON object:
```json
{
  "playerScore": 1,
  "computerScore": 0,
  "drawScore": 1
}
```

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS and macOS)
- IE11: ❌ Not tested

---

## Future Ideas

- Add Easy/Medium/Hard difficulty for Tic Tac Toe
- Persist player name to localStorage
- Add round counter UI for RPS
- Add sound effects (toggle-able)
- Keyboard shortcuts for faster play

---

**Built with ❤️ in plain HTML, CSS, and JavaScript.**
