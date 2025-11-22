// web3.js — FINAL Somnia Testnet Web3 Engine

console.log("web3.js loaded — Somnia Testnet");

// Global state
window.currentAccount = null;
window.provider = null;
window.signer = null;


// ==========================================
//  CONNECT METAMASK
// ==========================================
async function connectMetaMask() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    window.provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    window.currentAccount = accounts[0];
    window.signer = provider.getSigner();

    document.getElementById("addr").innerHTML = shorten(wallet());

    await switchToSomnia();

    return accounts[0];
  } catch (err) {
    console.error("Connect error:", err);
    alert("Failed to connect MetaMask.");
  }
}


// ==========================================
//  SWITCH TO SOMNIA TESTNET
// ==========================================
async function switchToSomnia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: window.SOMNIA.chainIdHex }]
    });
  } catch (switchError) {
    // Chain not added — add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: window.SOMNIA.chainIdHex,
            chainName: window.SOMNIA.chainName,
            nativeCurrency: window.SOMNIA.currency,
            rpcUrls: [window.SOMNIA.rpc],
            blockExplorerUrls: ["https://explorer.somnia.network"]
          }
        ]
      });
    } else {
      console.error("Switch error:", switchError);
    }
  }
}


// ==========================================
//  SEND ON-CHAIN TX (STT Native Transfer)
// ==========================================
async function sendSTT(to, amount) {
  if (!window.signer) {
    alert("Wallet not connected.");
    return;
  }

  try {
    const tx = {
      to: to,
      value: ethers.utils.parseEther(amount),
      gasLimit: window.TX.gasLimit
    };

    const response = await window.signer.sendTransaction(tx);

    return response;
  } catch (err) {
    console.error("TX ERROR:", err);
    throw err;
  }
}


// ==========================================
//  PACMAN: SUBMIT SCORE
// ==========================================
window.submitScoreOnchain = async (score) => {
  if (!window.currentAccount) {
    alert("Connect MetaMask first.");
    return;
  }

  document.getElementById("txStatus").innerHTML = "Submitting...";

  try {
    let tx = await sendSTT(window.currentAccount, "0.00001");
    document.getElementById("txStatus").innerHTML =
      "TX Sent: " + tx.hash.slice(0, 10) + "...";
  } catch (err) {
    document.getElementById("txStatus").innerHTML = "TX Failed.";
  }
};


// ==========================================
//  HELPERS
// ==========================================
function wallet() {
  return window.currentAccount;
}

function shorten(addr) {
  if (!addr) return "Not Connected";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}


// Expose globally
window.connectMetaMask = connectMetaMask;
window.sendSTT = sendSTT;
