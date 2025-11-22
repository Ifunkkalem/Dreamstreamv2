// web3.js — Somnia Competition Edition
// Helper minimal untuk Somnia Testnet integration in parent window
// NOTE: Connection & TX handled fully by app.js

console.log("web3.js loaded — Somnia helper active");

// Somnia Testnet RPC
export const SOMNIA_RPC = "https://dream-rpc.somnia.network";
export const SOMNIA_CHAIN_ID = 50312;
export const SOMNIA_CHAIN_HEX = "0xC488";

export const SOMNIA_PARAMS = {
  chainId: SOMNIA_CHAIN_HEX,
  chainName: "Somnia Testnet",
  rpcUrls: [SOMNIA_RPC],
  nativeCurrency: {
    name: "Somnia Token",
    symbol: "STT",
    decimals: 18,
  }
};


// ============ UTIL ============

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function short(addr) {
  return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
}

export function isMetaMaskAvailable() {
  return typeof window.ethereum !== "undefined";
}


// ============ CHAIN ACTIONS (USED BY app.js) ============

export async function switchToSomnia() {
  if (!isMetaMaskAvailable()) throw new Error("MetaMask not found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SOMNIA_CHAIN_HEX }]
    });
    return true;
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SOMNIA_PARAMS]
      });
      return true;
    }
    throw err;
  }
}

export async function ensureSomnia() {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId !== SOMNIA_CHAIN_HEX) {
    await switchToSomnia();
  }
}


// ============ EVENT HELPERS ============

export function listenWalletEvents(callbacks = {}) {
  if (!isMetaMaskAvailable()) return;

  const {
    onAccountsChanged = () => {},
    onChainChanged = () => {},
    onConnect = () => {},
    onDisconnect = () => {},
  } = callbacks;

  window.ethereum.on("accountsChanged", onAccountsChanged);
  window.ethereum.on("chainChanged", onChainChanged);
  window.ethereum.on("connect", onConnect);
  window.ethereum.on("disconnect", onDisconnect);
}


// ============ SAFE MESSAGE TO IFRAME ============

export function sendToIframe(iframe, payload) {
  try {
    iframe.contentWindow.postMessage(payload, "*");
  } catch (err) {
    console.error("Failed to send message to iframe", err);
  }
}
