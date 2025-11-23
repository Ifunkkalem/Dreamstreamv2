// pacman_hybrid.js — FINAL ONCHAIN + ORIGIN SAFE + WORKING UI

let score = 0;
let running = false;
let ghostInterval = null;

const grid = document.getElementById("grid-container");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start-button");

const width = 20;
let squares = [];
let pacIndex = 301;
let ghostIndex = 191;

// MATCHING LAYOUT (SAME AS MAIN GAME)
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

// BUILD GRID
function buildGrid() {
  grid.innerHTML = "";
  squares = [];

  grid.style.gridTemplateColumns = `repeat(${width}, 18px)`;

  for (let i = 0; i < layout.length; i++) {
    const s = document.createElement("div");
    s.className = "cell";

    if (layout[i] === 1) s.classList.add("wall");
    if (layout[i] === 2) s.classList.add("dot");

    grid.appendChild(s);
    squares.push(s);
  }

  squares[pacIndex].classList.add("pac");
  squares[ghostIndex].classList.add("ghost");
}

// PAC-MAN MOVEMENT
document.addEventListener("keyup", e => {
  if (!running) return;

  squares[pacIndex].classList.remove("pac");

  let next = pacIndex;
  if (e.key === "ArrowLeft") next--;
  if (e.key === "ArrowRight") next++;
  if (e.key === "ArrowUp") next -= width;
  if (e.key === "ArrowDown") next += width;

  if (squares[next] && !squares[next].classList.contains("wall")) {
    pacIndex = next;
  }

  squares[pacIndex].classList.add("pac");
  collect();
  checkGameOver();
});

// GHOST MOVEMENT
function ghostMove() {
  if (!running) return;

  const dirs = [-1, 1, -width, width];
  let best = ghostIndex;
  let bestDist = 9999;

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

// SCORE SYSTEM
function collect() {
  if (squares[pacIndex].classList.contains("dot")) {
    squares[pacIndex].classList.remove("dot");
    score++;
    scoreEl.innerHTML = score;

    // SAFE postMessage → no origin mismatch
    window.parent.postMessage(
      { type: "SOMNIA_POINT_EVENT", points: 1 },
      "*"
    );
  }
}

// GAME OVER
function checkGameOver() {
  if (pacIndex === ghostIndex) {
    running = false;
    clearInterval(ghostInterval);

    window.submitScoreOnchain = async (score) => {
    const tx = await window.Web3Somnia.submitScore(score);

    if (!tx) {
        console.log("FAILED TX");
        return;
    }

    console.log("Score submitted TX:", tx.hash);
};
    alert("GAME OVER — Score: " + score);

    // Send score to parent for onchain submission
    window.parent.postMessage(
      { type: "SOMNIA_GAME_OVER", score },
      "*"
    );
  }
}

// START BUTTON
startBtn.onclick = () => {
  if (running) return;

  running = true;
  score = 0;
  scoreEl.innerHTML = 0;

  ghostInterval = setInterval(ghostMove, 350);
};

// RESIZE → adjust iframe
window.onload = () => {
  buildGrid();
  setTimeout(() => {
    window.parent.postMessage(
      { type: "PACMAN_RESIZE", height: document.body.scrollHeight },
      "*"
    );
  }, 300);
};
