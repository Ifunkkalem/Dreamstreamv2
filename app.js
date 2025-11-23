// app.js — Final Somnia Competition Edition
// Fully integrated with: SomniaStreamAdapter + Web3Somnia + Pac-Man hybrid.

// DOM elements
const btnMeta = document.getElementById("btn-metamask");
const btnAddSomnia = document.getElementById("btn-add-somnia");
const btnTrack = document.getElementById("btn-connect");
const walletInput = document.getElementById("wallet-input");
const liveIndicator = document.getElementById("live-indicator");
const activityFeed = document.getElementById("activity");
const pointsEl = document.getElementById("points");
const missionsEl = document.getElementById("missions");
const leaderboardEl = document.getElementById("leaderboard");
const walletListEl = document.getElementById("wallet-list");
const toggleSim = document.getElementById("toggle-sim");

let trackedWallet = null;
let stream = null;
let pointsHistory = [];
let chart = null;

// ------------------------------
// ACTIVITY LOG
// ------------------------------
function log(msg) {
  const d = document.createElement("div");
  d.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  activityFeed.prepend(d);
}

// ------------------------------
// CHART SETUP
// ------------------------------
function initChart() {
  const ctx = document.getElementById("pointsChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Points",
          data: [],
          borderColor: "#00e8c6",
          backgroundColor: "rgba(0,232,198,0.1)",
          tension: 0.3
        }
      ]
    },
    options: {
      scales: { x: { display: false } }
    }
  });
}

function updateChart(value) {
  pointsHistory.push(value);
  if (pointsHistory.length > 50) pointsHistory.shift();

  chart.data.labels = pointsHistory.map((_, i) => i + 1);
  chart.data.datasets[0].data = pointsHistory;
  chart.update();
}

// ------------------------------
// STREAM HANDLING
// ------------------------------
function startStream(wallet) {
  if (stream) stream.disconnect();

  stream = new SomniaStreamAdapter({
    wallet,
    useMock: toggleSim.checked,
    onPoints: (w, p) => {
      pointsEl.textContent = p;
      updateChart(p);
      log(`Points update: ${p} (${w})`);
    },
    onEvent: (msg) => {
      log(msg);
      liveIndicator.textContent = "ONLINE";
      liveIndicator.className = "indicator online";
    },
    onMission: (w, mission) => {
      const li = document.createElement("li");
      li.textContent = `${mission.name} — ${mission.time}`;
      missionsEl.prepend(li);
    }
  });

  stream.connect();
  log("Stream started");
}

// ------------------------------
// WALLET CONNECT
// ------------------------------
btnMeta.onclick = async () => {
  const addr = await Somnia.connectWallet();
  if (!addr) return alert("Failed to connect wallet");

  walletInput.value = addr;
  log("Wallet connected: " + addr);
};

// add + switch chain
btnAddSomnia.onclick = async () => {
  const ok = await Somnia.switchSomnia();
  if (ok) log("Switched to Somnia Testnet (STT)");
};

// track wallet
btnTrack.onclick = () => {
  const w = walletInput.value.trim();
  if (!w) return alert("Enter wallet address");

  trackedWallet = w;
  startStream(w);
};

// ------------------------------
// PAC-MAN MESSAGE BRIDGE
// ------------------------------
window.addEventListener("message", async (ev) => {
  if (!ev.data) return;

  // hybrid point event
  if (ev.data.type === "SOMNIA_POINT_EVENT") {
    const current = parseInt(pointsEl.textContent || "0") + ev.data.points;
    pointsEl.textContent = current;
    updateChart(current);
    log(`Pac-Man: +${ev.data.points}`);
  }

  // game over → submit on-chain
  if (ev.data.type === "SOMNIA_GAME_OVER") {
    log(`Submitting on-chain score: ${ev.data.score}`);
    await window.submitScoreOnchain(ev.data.score);
  }

  // iframe resize
  if (ev.data.type === "PACMAN_RESIZE") {
    const iframe = document.getElementById("pacman-iframe");
    iframe.style.height = ev.data.height + "px";
  }
});

// ------------------------------
// INIT
// ------------------------------
initChart();
log("DreamStream PRO+ Initialized.");
