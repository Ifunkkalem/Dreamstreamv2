/* pacman_hybrid.js – FINAL WITH LAYOUT + D-PAD */

let width = 20;

// 0 = dot, 1 = wall, 2 = empty space
window.pacmanLayout = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,0,1,
  1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1,
  1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,

  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,

  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

let grid = [];
let squares = [];
let pacIndex = 22;
let ghostIndex = 377;
let score = 0;
let running = false;
let ghostInterval = null;

/* BUILD GRID */
function createBoard() {
  const layout = window.pacmanLayout;
  const container = document.getElementById("grid-container");
  container.innerHTML = "";
  squares = [];

  for (let i = 0; i < layout.length; i++) {
    const div = document.createElement("div");
    div.classList.add("square");

    if (layout[i] === 1) div.classList.add("wall");
    if (layout[i] === 0) div.classList.add("dot");

    container.appendChild(div);
    squares.push(div);
  }
}

/* PACMAN LOGIC */
function removePacman() {
  squares[pacIndex].classList.remove("pac-man");
}

function drawPacman() {
  squares[pacIndex].classList.add("pac-man");
}

function drawGhost() {
  squares[ghostIndex].classList.add("ghost");
}

function moveGhost() {
  const dirs = [-1, 1, -width, width];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];

  if (!squares[ghostIndex + dir] || squares[ghostIndex + dir].classList.contains("wall")) return;

  squares[ghostIndex].classList.remove("ghost");
  ghostIndex += dir;
  squares[ghostIndex].classList.add("ghost");

  checkGameOver();
}

function checkGameOver() {
  if (pacIndex === ghostIndex) {
    running = false;
    clearInterval(ghostInterval);

    window.parent.postMessage({ type: "SOMNIA_GAME_OVER", score }, "*");

    resetGameState();
  }
}

function eatDot() {
  if (squares[pacIndex].classList.contains("dot")) {
    score++;
    squares[pacIndex].classList.remove("dot");

    window.parent.postMessage({
      type: "PACMAN_SCORE",
      score
    }, "*");
  }
}

function resetGameState() {
  score = 0;
  pacIndex = 22;
  ghostIndex = 377;

  createBoard();
  drawPacman();
  drawGhost();
}

function startGame() {
  if (running) return;
  running = true;

  resetGameState();
  ghostInterval = setInterval(moveGhost, 500);

  window.parent.postMessage({ type: "PACMAN_STARTED" }, "*");
}

/* CONTROLS */
document.addEventListener("keydown", (e) => onMove(e.key));

function onMove(dir) {
  if (!running) return;

  removePacman();

  if (dir === "ArrowUp" && !squares[pacIndex - width].classList.contains("wall"))
    pacIndex -= width;
  if (dir === "ArrowDown" && !squares[pacIndex + width].classList.contains("wall"))
    pacIndex += width;
  if (dir === "ArrowLeft" && !squares[pacIndex - 1].classList.contains("wall"))
    pacIndex -= 1;
  if (dir === "ArrowRight" && !squares[pacIndex + 1].classList.contains("wall"))
    pacIndex += 1;

  drawPacman();
  eatDot();
  checkGameOver();
}

/* MOBILE D-PAD */
function initMobilePad() {
  document.getElementById("btn-up").onclick = () => onMove("ArrowUp");
  document.getElementById("btn-down").onclick = () => onMove("ArrowDown");
  document.getElementById("btn-left").onclick = () => onMove("ArrowLeft");
  document.getElementById("btn-right").onclick = () => onMove("ArrowRight");
}

window.onload = () => {
  createBoard();
  initMobilePad();
};
