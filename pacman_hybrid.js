/* pacman_hybrid.js — DreamStream v2 FINAL */

let score = 0;
let running = false;
let ghostInterval = null;

const grid = document.getElementById("grid-container");
const scoreEl = document.getElementById("score");

const width = 20;
let squares = [];
let pacIndex = 301;
let ghostIndex = 191;

const layout = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,
  1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1,
  1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,2,1,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,1,1,
  1,2,2,2,2,2,2,2,0,0,0,0,2,2,2,2,2,2,2,1,
  1,1,1,1,1,1,1,2,0,0,0,0,2,1,1,1,1,1,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,2,1,1,
  1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1,
  1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

/* ----------------------------- GRID ----------------------------------- */

function buildGrid() {
  grid.innerHTML = "";
  squares = [];
  grid.style.gridTemplateColumns = `repeat(${width}, 18px)`;

  for (let i = 0; i < layout.length; i++) {
    const s = document.createElement("div");
    s.className = "square";

    if (layout[i] === 1) s.classList.add("wall");
    if (layout[i] === 2) s.classList.add("dot");

    grid.appendChild(s);
    squares.push(s);
  }

  squares[pacIndex].classList.add("pac-man");
  squares[ghostIndex].classList.add("ghost");
}

/* --------------------------- MOVEMENT -------------------------------- */

function movePac(dir) {
  if (!running) return;

  squares[pacIndex].classList.remove("pac-man");

  let next = pacIndex;
  if (dir === "left") next--;
  if (dir === "right") next++;
  if (dir === "up") next -= width;
  if (dir === "down") next += width;

  if (squares[next] && !squares[next].classList.contains("wall")) {
    pacIndex = next;
  }

  squares[pacIndex].classList.add("pac-man");

  collect();
  checkGameOver();
}

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") movePac("left");
  if (e.key === "ArrowRight") movePac("right");
  if (e.key === "ArrowUp") movePac("up");
  if (e.key === "ArrowDown") movePac("down");
});

document.getElementById("btn-up").onclick = () => movePac("up");
document.getElementById("btn-down").onclick = () => movePac("down");
document.getElementById("btn-left").onclick = () => movePac("left");
document.getElementById("btn-right").onclick = () => movePac("right");

/* --------------------------- GHOST AI -------------------------------- */

function ghostMove() {
  if (!running) return;

  const dirs = [-1, 1, -width, width];
  let best = ghostIndex;
  let bestDist = 9999;

  dirs.forEach(d => {
    const t = ghostIndex + d;
    if (!squares[t] || squares[t].classList.contains("wall")) return;

    const dist =
      Math.abs((t % width) - (pacIndex % width)) +
      Math.abs(Math.floor(t / width) - Math.floor(pacIndex / width));

    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  });

  squares[ghostIndex].classList.remove("ghost");
  ghostIndex = best;
  squares[ghostIndex].classList.add("ghost");

  checkGameOver();
}

/* --------------------------- SCORING -------------------------------- */

function collect() {
  if (squares[pacIndex].classList.contains("dot")) {
    squares[pacIndex].classList.remove("dot");
    score++;
    scoreEl.innerHTML = score;
  }
}

/* --------------------------- GAME END ------------------------------- */

function checkGameOver() {
  if (pacIndex === ghostIndex) {
    running = false;
    clearInterval(ghostInterval);

    alert("GAME OVER! Skor: " + score);

    saveToLeaderboard(score);

    resetGame();
  }
}

/* --------------------------- RESET --------------------------------- */
function resetGame() {
  score = 0;
  scoreEl.innerHTML = 0;
  pacIndex = 301;
  ghostIndex = 191;
  buildGrid();
}

/* --------------------------- LEADERBOARD ---------------------------- */

function saveToLeaderboard(s) {
  let board = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  board.push({ score: s, time: Date.now() });
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(board));
  renderLeaderboard();
}

function renderLeaderboard() {
  const ul = document.getElementById("leaderboard");
  ul.innerHTML = "";

  let board = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  board.slice(0, 10).forEach((b, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. Skor ${b.score}`;
    ul.appendChild(li);
  });
}

/* --------------------------- START GAME ----------------------------- */

document.getElementById("start-button").onclick = async () => {
  const ok = await window.Web3Somnia.startGame();
  if (!ok) return;

  running = true;
  ghostInterval = setInterval(ghostMove, 350);
};

/* -------------------------- SWAP SCORE → PAC ------------------------ */

document.getElementById("btnSwap").onclick = async () => {
  const result = await window.Web3Somnia.swapScore(score);
  document.getElementById("swapStatus").innerHTML = result;
};

/* Init */
window.onload = () => {
  buildGrid();
  renderLeaderboard();
};
