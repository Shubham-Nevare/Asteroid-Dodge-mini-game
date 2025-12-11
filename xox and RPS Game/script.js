// ============= GAME TOGGLE =============
class GameToggle {
  constructor() {
    this.tttGame = new TicTacToe();
    this.rpsGame = new RockPaperScissors();
    this.init();
  }

  init() {
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchGame(e.target.dataset.game)
      );
    });
  }

  switchGame(game) {
    const tttContainer = document.getElementById("ttt-container");
    const rpsContainer = document.getElementById("rps-container");
    const toggleButtons = document.querySelectorAll(".toggle-btn");

    toggleButtons.forEach((btn) => btn.classList.remove("active"));

    if (game === "ttt") {
      tttContainer.classList.add("active");
      rpsContainer.classList.remove("active");
      document.querySelector('[data-game="ttt"]').classList.add("active");
    } else {
      rpsContainer.classList.add("active");
      tttContainer.classList.remove("active");
      document.querySelector('[data-game="rps"]').classList.add("active");
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new GameToggle();
});


// ============= TIC TAC TOE GAME =============
class TicTacToe {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.gameActive = true;
    this.winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => this.handleCellClick(e));
    });
    const resetBtn = document.getElementById('tttResetBtn');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  }

  handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);
    if (this.board[index] === null && this.gameActive) {
      this.board[index] = this.currentPlayer;
      this.checkWin();
      if (this.gameActive) {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        if (this.currentPlayer === 'O') {
          this.gameActive = false;
          setTimeout(() => this.computerMove(), 500);
        }
      }
      this.render();
    }
  }

  computerMove() {
    // Use Minimax to pick the best move (unbeatable)
    const best = this.getBestMove();
    if (best !== null && best !== undefined) {
      this.board[best] = "O";
      const winner = this.checkWin();
      if (!winner) {
        this.currentPlayer = "X";
        this.gameActive = true;
      }
    } else {
      // fallback to any random empty cell
      const emptyIndices = this.board
        .map((val, idx) => (val === null ? idx : null))
        .filter((idx) => idx !== null);
      if (emptyIndices.length > 0) {
        const randomIndex =
          emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        this.board[randomIndex] = "O";
        const winner = this.checkWin();
        if (!winner) {
          this.currentPlayer = "X";
          this.gameActive = true;
        }
      }
    }
    this.render();
  }

  // Evaluate a board for a winner/draw without mutating state
  evaluateWinner(board) {
    for (let pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (!board.includes(null)) return "draw";
    return null;
  }

  // Minimax algorithm: returns best move object {index, score}
  minimax(board, player, depth = 0) {
    const winner = this.evaluateWinner(board);
    if (winner === "O") return { score: 10 - depth };
    if (winner === "X") return { score: depth - 10 };
    if (winner === "draw") return { score: 0 };

    const avail = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((idx) => idx !== null);

    let moves = [];
    for (let i of avail) {
      const newBoard = board.slice();
      newBoard[i] = player;

      const result = this.minimax(
        newBoard,
        player === "O" ? "X" : "O",
        depth + 1
      );
      moves.push({ index: i, score: result.score });
    }

    // Choose best move depending on player
    let bestMove;
    if (player === "O") {
      // maximize
      let bestScore = -Infinity;
      for (let m of moves) {
        if (m.score > bestScore) {
          bestScore = m.score;
          bestMove = m;
        }
      }
    } else {
      // minimize
      let bestScore = Infinity;
      for (let m of moves) {
        if (m.score < bestScore) {
          bestScore = m.score;
          bestMove = m;
        }
      }
    }
    return bestMove;
  }

  // Public helper to get best index for current board for 'O'
  getBestMove() {
    const best = this.minimax(this.board.slice(), "O", 0);
    return best ? best.index : null;
  }

  checkWin() {
    for (let pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.gameActive = false;
        return this.board[a];
      }
    }

    if (!this.board.includes(null)) {
      this.gameActive = false;
      return "draw";
    }
    return null;
  }

  render() {
    const cells = document.querySelectorAll(".ttt-cell");
    const statusEl = document.getElementById("tttStatus");

    cells.forEach((cell, index) => {
      cell.textContent = this.board[index] || "";
      cell.classList.remove("x", "o");
      if (this.board[index] === "X") {
        cell.classList.add("x");
      } else if (this.board[index] === "O") {
        cell.classList.add("o");
      }
      cell.disabled = this.board[index] !== null || !this.gameActive;
    });

    const winner = this.checkWin();
    if (winner === "draw") {
      statusEl.textContent = "It's a Draw! 🤝";
      statusEl.classList.add("draw");
      statusEl.classList.remove("winner");
    } else if (winner === "X") {
      statusEl.textContent = "You Won! 🎉";
      statusEl.classList.add("winner");
      statusEl.classList.remove("draw");
    } else if (winner === "O") {
      statusEl.textContent = "Computer Won! 🤖";
      statusEl.classList.add("winner");
      statusEl.classList.remove("draw");
    } else {
      statusEl.classList.remove("winner", "draw");
      if (this.currentPlayer === "X" && this.gameActive) {
        statusEl.textContent = "Your Turn (X) ✋";
      } else if (this.currentPlayer === "O" && this.gameActive) {
        statusEl.textContent = "Computer Thinking... 🤔";
      }
    }
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.gameActive = true;
    this.render();
  }
}

// ============= ROCK PAPER SCISSORS GAME =============
class RockPaperScissors {
  constructor() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.drawScore = 0;
    this.roundCount = 0;
    this.maxRounds = 3; // best of 3 rounds
    this.choices = ["rock", "paper", "scissors"];
    this.choiceEmojis = { rock: "🪨", paper: "📄", scissors: "✂️" };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadScores();
    this.updateScoreBoard();
    this.updatePlayerLabel();
  }

  setupEventListeners() {
    const buttons = document.querySelectorAll(".choice-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.play(e.target.dataset.choice));
    });
    const playAgain = document.getElementById("rpsPlayAgainBtn");
    if (playAgain) playAgain.addEventListener("click", () => this.resetMatch());
    const nameInput = document.getElementById("playerName");
    if (nameInput)
      nameInput.addEventListener("input", () => this.updatePlayerLabel());
  }

  play(playerChoice) {
    if (this.roundCount >= this.maxRounds) return; // match finished
    const computerChoice = this.choices[Math.floor(Math.random() * 3)];
    const result = this.determineWinner(playerChoice, computerChoice);

    this.updateResult(playerChoice, computerChoice, result);
    this.updateScores(result);
    this.roundCount++;
    this.updateScoreBoard();
    this.saveScores();
    this.updateButtonStates(playerChoice);

    if (this.roundCount >= this.maxRounds) {
      // end match: show final winner
      this.endMatch();
    }
  }
  determineWinner(player, computer) {
    if (player === computer) return "draw";
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win";
    }
    return "lose";
  }

  updateResult(playerChoice, computerChoice, result) {
    const resultDisplay = document.getElementById("resultDisplay");
    const outcome = document.getElementById("outcome");
    const title = document.getElementById("rpsResultTitle");

    // update player label from input
    this.updatePlayerLabel();

    document.getElementById("playerChoice").textContent =
      this.choiceEmojis[playerChoice];
    document.getElementById("computerChoice").textContent =
      this.choiceEmojis[computerChoice];

    resultDisplay.style.display = "grid";
    if (title) title.style.display = "block";

    let resultText = "";
    outcome.className = `outcome ${result}`;

    if (result === "win") {
      resultText = "You Won! 🎉";
    } else if (result === "lose") {
      resultText = "Computer Won! 🤖";
    } else {
      resultText = "It's a Draw! 🤝";
    }

    outcome.textContent = resultText;
    outcome.style.display = "block";
  }

  updatePlayerLabel() {
    const nameInput = document.getElementById("playerName");
    const label = document.getElementById("playerLabel");
    if (label) {
      label.textContent =
        nameInput && nameInput.value.trim() ? nameInput.value.trim() : "You";
    }
  }

  endMatch() {
    // disable choice buttons
    const buttons = document.querySelectorAll(".choice-btn");
    buttons.forEach((btn) => (btn.disabled = true));

    // compute final winner
    let finalText = "";
    if (this.playerScore > this.computerScore)
      finalText = `${
        document.getElementById("playerLabel").textContent
      } wins the match! 🏆`;
    else if (this.playerScore < this.computerScore)
      finalText = `Computer wins the match! 🤖`;
    else finalText = `Match Draw! 🤝`;

    const outcome = document.getElementById("outcome");
    if (outcome) {
      outcome.className = "outcome";
      outcome.textContent = finalText;
      outcome.style.display = "block";
    }
  }

  resetMatch() {
    // Reset the current match and cumulative scores (Play Again now clears totals)
    this.roundCount = 0;
    this.playerScore = 0;
    this.computerScore = 0;
    this.drawScore = 0;
    this.updateScoreBoard();
    this.saveScores();

    // clear the last choices/results UI
    const rd = document.getElementById('resultDisplay');
    if (rd) rd.style.display = 'none';
    const outcome = document.getElementById('outcome');
    if (outcome) outcome.style.display = 'none';
    const title = document.getElementById('rpsResultTitle');
    if (title) title.style.display = 'none';
    const pc = document.getElementById('playerChoice'); if (pc) pc.textContent = '';
    const cc = document.getElementById('computerChoice'); if (cc) cc.textContent = '';
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove('selected');
    });
  }

  updateScores(result) {
    if (result === "win") {
      this.playerScore++;
    } else if (result === "lose") {
      this.computerScore++;
    } else {
      this.drawScore++;
    }
  }

  updateScoreBoard() {
    document.getElementById("playerScore").textContent = this.playerScore;
    document.getElementById("computerScore").textContent = this.computerScore;
    document.getElementById("drawScore").textContent = this.drawScore;
  }

  updateButtonStates(choice) {
    const buttons = document.querySelectorAll(".choice-btn");
    buttons.forEach((btn) => {
      btn.classList.remove("selected");
      if (btn.dataset.choice === choice) {
        btn.classList.add("selected");
      }
    });
  }

  saveScores() {
    localStorage.setItem(
      "rpsScores",
      JSON.stringify({
        playerScore: this.playerScore,
        computerScore: this.computerScore,
        drawScore: this.drawScore,
      })
    );
  }

  loadScores() {
    const saved = localStorage.getItem("rpsScores");
    if (saved) {
      const scores = JSON.parse(saved);
      this.playerScore = scores.playerScore;
      this.computerScore = scores.computerScore;
      this.drawScore = scores.drawScore;
    }
  }
}

