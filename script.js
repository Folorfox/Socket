const boardElement = document.querySelector("#board");
const ROWS = Number(boardElement.dataset.rows);
const COLS = Number(boardElement.dataset.cols);
const EMPTY = "";
const PLAYERS = ["red", "yellow"];
const PLAYER_NAMES = {
  red: "joueur rouge",
  yellow: "joueur jaune"
};

const statusElement = document.querySelector("#status");
const turnChip = document.querySelector("#turnChip");
const resetButton = document.querySelector("#resetButton");

let board = [];
let currentPlayer = PLAYERS[0];
let gameOver = false;

function setupCells() {
  document.querySelectorAll(".cell").forEach((cell) => {
    const col = Number(cell.dataset.col);
    cell.addEventListener("click", () => playMove(col));
  });
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  currentPlayer = PLAYERS[0];
  gameOver = false;
  render();
  setStatus("Au tour du " + PLAYER_NAMES[currentPlayer], currentPlayer);
}

function playMove(col) {
  if (gameOver) return;

  const row = findOpenRow(col);
  if (row === -1) return;

  board[row][col] = currentPlayer;

  const winningCells = getWinningCells(row, col, currentPlayer);

  if (winningCells.length > 0) {
    gameOver = true;
    render(winningCells);
    setStatus(PLAYER_NAMES[currentPlayer] + " gagne !", currentPlayer);
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    render();
    setStatus("Égalité !", currentPlayer);
    return;
  }

  currentPlayer = currentPlayer === PLAYERS[0] ? PLAYERS[1] : PLAYERS[0];
  render();
  setStatus("Au tour du " + PLAYER_NAMES[currentPlayer], currentPlayer);
}

function findOpenRow(col) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][col] === EMPTY) {
      return row;
    }
  }

  return -1;
}

function getWinningCells(row, col, player) {
  const directions = [
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 }
  ];

  for (const direction of directions) {
    const cells = [
      ...collectCells(row, col, player, direction.row, direction.col),
      ...collectCells(row, col, player, -direction.row, -direction.col).slice(1)
    ];

    if (cells.length >= 4) return cells;
  }

  return [];
}

function collectCells(row, col, player, rowStep, colStep) {
  const cells = [];
  let nextRow = row;
  let nextCol = col;

  while (
    nextRow >= 0 &&
    nextRow < ROWS &&
    nextCol >= 0 &&
    nextCol < COLS &&
    board[nextRow][nextCol] === player
  ) {
    cells.push({ row: nextRow, col: nextCol });
    nextRow += rowStep;
    nextCol += colStep;
  }

  return cells;
}

function isBoardFull() {
  return board[0].every((cell) => cell !== EMPTY);
}

function render(winningCells = []) {
  const winMap = new Set(winningCells.map((cell) => cell.row + "-" + cell.col));

  document.querySelectorAll(".cell").forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const player = board[row][col];
    const winningCell = winMap.has(row + "-" + col);

    cell.className = "cell" + (player ? " " + player : "") + (winningCell ? " win" : "");
    cell.disabled = gameOver || board[0][col] !== EMPTY;
  });
}

function setStatus(message, player) {
  statusElement.textContent = message;
  turnChip.className = "chip " + player;
}

resetButton.addEventListener("click", resetGame);

setupCells();
resetGame();
