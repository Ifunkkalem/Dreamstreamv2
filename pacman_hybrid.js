/* pacman_hybrid.js — DreamStream v2 FINAL (fixed & synced with index.html) */

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

/* helper: set pac sprite (inline) */
function setPacSpriteOn(element) {
  if (!element) return;
  element.style.backgroundImage = 'url("assets/Ds.png")';
  element.style.backgroundSize = 'cover';
  element.style.backgroundPosition = 'center';
}
function clearPacSpriteOn(element) {
  if (!element) return;
  element.style.backgroundImage = '';
}

/* build grid */
function createGrid() {
  if (!gridContainer) return;
  gridContainer.innerHTML = "";
  squares = [];
  gridContainer.style.gridTemplateColumns = `repeat(${width}, 18px)`;

  for (let i = 0; i < layout.length; i++) {
    const div = document.createElement("div");
    div.className = "square";

    if (layout[i] === 1) div.classList.add("wall");
    // treat 2 as dot (your layout uses 2 = dot)
    if (layout[i] === 2) div.classList.add("dot");

    gridContainer.appendChild(div);
    squares.push(div);
  }

  // ensure indexes valid
  if (squares[pacIndex]) {
    squares[pacIndex].classList.add("pac-man");
    setPacSpriteOn(squares[pacIndex]);
  }
  if (squares[ghostIndex]) squares[ghostIndex].classList.add("ghost");
}

/* movement */
function movePac(dir) {
  if (!running) return;
  if (!squares[pacIndex]) return;

  // remove old pac
  squares[pacIndex].classList.remove("pac-man");
  clearPacSpriteOn(squares[pacIndex]);

  let next = pacIndex;
  if (dir === "left") next = pacIndex - 1;
  if (dir === "right") next = pacIndex + 1;
  if (dir === "up") next = pacIndex - width;
  if (dir === "down") next = pacIndex + width;

  // bounds check and wall check
  if (next >= 0 && next < squares.length && !squares[next].classList.contains("wall")) {
    pacIndex = next;
  }

  // draw new pac
  squares[pacIndex].classList.add("pac-man");
  setPacSpriteOn(squares[pacIndex]);

  collectDot();
  checkGameOver();
}

/* keyboard + dpad listeners (safety checks) */
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") movePac("left");
  if (e.key === "ArrowRight") movePac("right");
  if (e.key === "ArrowUp") movePac("up");
  if (e.key === "ArrowDown") movePac("down");
});
const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
if (btnUp) btnUp.onclick = () => movePac("up");
if (btnDown) btnDown.onclick = () => movePac("down");
if (btnLeft) btnLeft.onclick = () => movePac("left");
if (btnRight) btnRight.onclick = () => movePac("right");

/* ghost ai */
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
  if (squares[ghostIndex]) squares[ghostIndex].classList.remove("ghost");
  ghostIndex = best;
  if (squares[ghostIndex]) squares[ghostIndex].classList.add("ghost");
  checkGameOver();
}

/* collect dot */
function collectDot() {
  if (!squares[pacIndex]) return;
  if (squares[pacIndex].classList.contains("dot")) {
    squares[pacIndex].classList.remove("dot");
    score++;
    if (scoreEl) scoreEl.innerText = score;
  }
}

/* gameover */
function checkGameOver() {
  if (pacIndex === ghostIndex) {
    running = false;
    if (ghostInterval) clearInterval(ghostInterval);
    try { alert("GAME OVER! Skor: " + score); } catch(e) {}
    addToLeaderboard(score);
    resetGame();
  }
}

/* reset */
function resetGame() {
  score = 0;
  if (scoreEl) scoreEl.innerText = 0;
  pacIndex = 301;
  ghostIndex = 191;
  createGrid();
}

/* leaderboard */
function addToLeaderboard(s) {
  const lbKey = "dreamstream_leaderboard_v1";
  const lb = JSON.parse(localStorage.getItem(lbKey) || "[]");
  lb.push({ score: s, time: Date.now() });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem(lbKey, JSON.stringify(lb));
  renderLeaderboard();
  // update my total
  const total = lb.reduce((acc, cur) => acc + (cur.score || 0), 0);
  const myTotalEl = document.getElementById("my-total-score");
  if (myTotalEl) myTotalEl.innerText = total;
}

function renderLeaderboard() {
  const ul = document.getElementById("leaderboard-list") || document.getElementById("leaderboard");
  if (!ul) return;
  ul.innerHTML = "";
  const lb = JSON.parse(localStorage.getItem("dreamstream_leaderboard_v1") || "[]");
  lb.slice(0, 10).forEach((e, i) => {
    const li = document.createElement("li");
    li.innerText = `${i + 1}. ${e.score}`;
    ul.appendChild(li);
  });
}

/* start & swap buttons (IDs matched to index.html) */
const startBtn = document.getElementById("start-button");
if (startBtn) {
  startBtn.onclick = async () => {
    if (!window.Web3Somnia) {
      alert("Wallet module belum siap.");
      return;
    }
    const ok = await window.Web3Somnia.startGame();
    if (ok) {
      running = true;
      ghostInterval = setInterval(ghostMove, 400);
    }
  };
}

const swapBtn = document.getElementById("btn-swap");
if (swapBtn) {
  swapBtn.onclick = async () => {
    const swapInput = document.getElementById("swap-input");
    const swapStatus = document.getElementById("swap-status");
    if (!swapInput || !swapStatus) return;
    const val = parseInt(swapInput.value || "0");
    if (isNaN(val) || val < 10 || val % 10 !== 0) {
      swapStatus.innerText = "Masukkan kelipatan 10 minimal 10.";
      return;
    }
    const result = await window.Web3Somnia.swapScore(val);
    swapStatus.innerText = result;
  };
}

/* load */
window.onload = () => {
  createGrid();
  renderLeaderboard();
  // attempt to set my-total-score initially
  const lb = JSON.parse(localStorage.getItem("dreamstream_leaderboard_v1") || "[]");
  const total = lb.reduce((acc, cur) => acc + (cur.score || 0), 0);
  const myTotalEl = document.getElementById("my-total-score");
  if (myTotalEl) myTotalEl.innerText = total;
};
