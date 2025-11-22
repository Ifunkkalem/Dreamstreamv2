// config.js — Somnia Testnet Final Config

console.log("config.js loaded — Somnia Testnet active");

// ============ CHAIN CONFIG ============

window.SOMNIA = {
  rpc: "https://dream-rpc.somnia.network",
  chainIdDec: 50312,
  chainIdHex: "0xC488",
  symbol: "STT",
  chainName: "Somnia Testnet",
  currency: {
    name: "Somnia Token",
    symbol: "STT",
    decimals: 18
  }
};


// ============ BACKEND / API PLACEHOLDER ============
// Jika nanti mau tambah endpoint backend, tambahkan di sini.

window.API_ENDPOINTS = {
  missions: "local_mock_missions.json", // bisa diganti API real
  leaderboard: "local_mock_leaderboard.json"
};


// ============ PACMAN GAME CONFIG ============

window.PACMAN_CONFIG = {
  sendScoreToParent: true,
  // safety origin mode, iframe → parent
  allowedOrigin: "*"
};


// ============ TX CONFIG ============

window.TX = {
  gasLimit: 180000,
  scoreContract: {
    // isi jika sudah deploy kontrak penyimpan score onchain
    address: null,
    abi: []
  }
};
