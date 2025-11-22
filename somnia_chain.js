// somnia_chain.js — FINAL Somnia Testnet Config (Official RPC)

console.log("Somnia chain config loaded");

// ===============================
//   CHAIN CONFIG
// ===============================
window.SOMNIA = {
  rpc: "https://dream-rpc.somnia.network",
  chainId: 50312,
  chainIdHex: "0xC4B8", // 50312 in hex
  chainName: "Somnia Testnet",
  currency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18
  }
};


// ===============================
//   TX DEFAULTS
// ===============================
window.TX = {
  gasLimit: "22000"
};


// ===============================
//   LOG
// ===============================
console.log(`
=== SOMNIA TESTNET ACTIVE ===
RPC     : ${window.SOMNIA.rpc}
CHAIN   : ${window.SOMNIA.chainId} (${window.SOMNIA.chainIdHex})
TOKEN   : STT
`);
