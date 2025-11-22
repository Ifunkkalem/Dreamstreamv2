// app.js — Somnia Competition Edition
// Parent window controller for iframe, wallet, on-chain TX, SDS mock/real,   
// and secure postMessage bridge for pacman_hybrid.js.

console.log("DreamStream PRO+ — Competition Edition Loaded");

// ======== DOM ========
const btnConnect = document.getElementById("btn-metamask");
const btnAddSomnia = document.getElementById("btn-add-somnia");
const walletInput = document.getElementById("wallet-input");
const pointsEl = document.getElementById("points");
const streamStatusEl = document.getElementById("stream-status");
const activityEl = document.getElementById("activity");
const leaderboardEl = document.getElementById("leaderboard");

const pacIframe = document.getElementById("pacman-iframe");

// ======== SOMNIA CONFIG ========
const SOMNIA = {
  chainIdHex: "0xC488",       // 50312
  chainId: 50312,
  rpc: "https://dream-rpc.somnia.network",
  symbol: "STT",
  name: "Somnia Testnet",
};

// ======== INTERNAL STATE ========
let provider = null;
let signer = null;
let currentAddress = null;
let trackedPoints = 0;

// Smart contract (example)
const SCORE_CONTRACT = {
  address: "0xDb706daF3C2e5B657d02f69841b4323958507de7", // kamu beri
  abi: [
    "function submitScore(uint256 score) public returns (bool)",
  ],
};


// ================================
// WALLET CONNECTION
// ================================

async function connectWallet() {
  if (!window.ethereum) {
    toast("MetaMask tidak ditemukan", "error");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);

  try {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    currentAddress = await signer.getAddress();

    walletInput.value = currentAddress;

    activity("Wallet connected: " + currentAddress);
    streamStatus("CONNECTED", true);

    pacIframe.contentWindow.postMessage(
      { type: "CONNECT_RESULT", success: true, address: currentAddress },
      "*"
    );

  } catch (err) {
    console.error(err);
    pacIframe.contentWindow.postMessage(
      { type: "CONNECT_RESULT", success: false },
      "*"
    );
  }
}

btnConnect.onclick = connectWallet;


// ================================
// ADD / SWITCH SOMNIA TESTNET
// ================================

btnAddSomnia.onclick = async () => {
  if (!window.ethereum) return toast("MetaMask tidak ada", "error");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SOMNIA.chainIdHex }],
    });
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SOMNIA.chainIdHex,
          chainName: SOMNIA.name,
          rpcUrls: [SOMNIA.rpc],
          nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 }
        }]
      });
    }
  }

  toast("Somnia Testnet active", "success");
};


// ================================
// ON-CHAIN TX — SUBMIT SCORE
// ================================

async function submitScore(score) {
  if (!signer) {
    toast("Wallet belum connect", "error");
    return sendTxResult(false, "Wallet not connected");
  }

  try {
    const contract = new ethers.Contract(
      SCORE_CONTRACT.address,
      SCORE_CONTRACT.abi,
      signer
    );

    const tx = await contract.submitScore(score);
    activity("TX submitted: " + tx.hash);

    const receipt = await tx.wait();
    activity("TX confirmed!");

    sendTxResult(true, tx.hash);

  } catch (e) {
    console.error(e);
    sendTxResult(false, e.message || "TX failed");
  }
}

function sendTxResult(success, payload) {
  pacIframe.contentWindow.postMessage(
    {
      type: "SOMNIA_ONCHAIN_SUBMIT_RESULT",
      success,
      txHash: success ? payload : null,
      error: success ? null : payload,
    },
    "*"
  );
}


// ================================
// ACTIVITY + STATUS UI
// ================================

function activity(msg) {
  const t = document.createElement("div");
  t.textContent = "[log] " + msg;
  activityEl.prepend(t);
}

function streamStatus(msg, ok = false) {
  streamStatusEl.textContent = msg;
  streamStatusEl.className = ok ? "ok" : "muted";
}

function toast(msg) {
  console.log("[toast]", msg);
}


// ================================
// PACMAN IFRAME — MESSAGE HANDLER
// ================================

window.addEventListener("message", (ev) => {
  const d = ev.data;
  if (!d || !d.type) return;

  // 1 — Game wants wallet connect
  if (d.type === "REQUEST_CONNECT") {
    connectWallet();
  }

  // 2 — Game wants on-chain TX
  if (d.type === "SOMNIA_ONCHAIN_SUBMIT_REQUEST") {
    submitScore(d.score);
  }

  // 3 — Points from game
  if (d.type === "SOMNIA_POINT_EVENT") {
    trackedPoints += d.points;
    pointsEl.textContent = trackedPoints;
    activity("Game +1 point");
  }

  // 4 — Dynamic resize
  if (d.type === "PACMAN_RESIZE") {
    pacIframe.style.height = d.height + "px";
  }

  // 5 — Game Over
  if (d.type === "SOMNIA_GAME_OVER") {
    activity("Game Over — Score: " + d.score);
  }
});


// ================================
// INIT
// ================================

activity("Init ready.");
streamStatus("DISCONNECTED", false);
