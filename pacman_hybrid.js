/* pacman_hybrid.js — DreamStream v2 FINAL */

let score = 0;
let running = false;
let ghostInterval = null;

const width = 20;
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

const gridContainer = document.getElementById("grid-container");
const scoreEl = document.getElementById("score");

let squares = [];
let pacIndex = 301;
let ghostIndex = 191;

function createGrid() {
  gridContainer.innerHTML = "";
  squares = [];
  gridContainer.style.gridTemplateColumns = `repeat(${width}, 18px)`;

  for (let i = 0; i < layout.length; i++) {
    const div = document.createElement("div");
    div.className = "square";
    if (layout[i] === 1) div.classList.add("wall");
    if (layout[i] === 0) div.classList.add("dot");
    gridContainer.appendChild(div);
    squares.push(div);
  }
  squares[pacIndex].classList.add("pac-man");
  squares[ghostIndex].classList.add("ghost");
}

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
  collectDot();
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

function ghostMove() {
  if (!running) return;
  const dirs = [-1, 1, -width, width];
  let best = ghostIndex;
  let bestDist = Infinity;
  dirs.forEach(d => {
    const t = ghostIndex + d;
    if (!squares[t] || squares[t].classList.contains("wall")) return;
    const dist = Math.abs((t % width) - (pacIndex % width)) +
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

function collectDot() {
  if (squares[pacIndex].classList.contains("dot")) {
    squares[pacIndex].classList.remove("dot");
    score++;
    scoreEl.innerText = score;
  }
}

function checkGameOver() {
  if (pacIndex === ghostIndex) {
    running = false;
    clearInterval(ghostInterval);
    alert("GAME OVER! Skor: " + score);
    addToLeaderboard(score);
    resetGame();
  }
}

function resetGame() {
  score = 0;
  scoreEl.innerText = 0;
  pacIndex = 301;
  ghostIndex = 191;
  createGrid();
}

function addToLeaderboard(s) {
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  lb.push({ score: s, time: Date.now() });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(lb));
  renderLeaderboard();
}

function renderLeaderboard() {
  const ul = document.getElementById("leaderboard");
  ul.innerHTML = "";
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  lb.slice(0, 10).forEach((e, i) => {
    const li = document.createElement("li");
    li.innerText = `${i + 1}. ${e.score}`;
    ul.appendChild(li);
  });
}

document.getElementById("start-button").onclick = async () => {
  const ok = await window.Web3Somnia.startGame();
  if (ok) {
    running = true;
    ghostInterval = setInterval(ghostMove, 400);
  }
};

document.getElementById("btnSwap").onclick = async () => {
  const result = await window.Web3Somnia.swapScore(score);
  document.getElementById("swapStatus").innerText = result;
};

window.onload = () => {
  createGrid();
  renderLeaderboard();
};
