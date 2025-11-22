// config.js — Somnia + contract config
window.SOMNIA_CONFIG = {
  rpc: "https://rpc-testnet.somnia.network",
  chainIdHex: "0xC487", // 50311
  chainIdDec: 50311,
  pacmanContract: {
    address: "0xDb706daF3C2e5B657d02f69841b4323958507de7",
    abi: [
      {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
      {"inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],"name":"submitScore","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"getLeaderboard","outputs":[{"internalType":"address[10]","name":"","type":"address[10]"},{"internalType":"uint256[10]","name":"","type":"uint256[10]"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"bestScore","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}
    ]
  }
};
