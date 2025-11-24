// config.js - Somnia testnet config & contracts
window.SOMNIA_RPC = "https://dream-rpc.somnia.network";

window.SOMNIA_CHAIN = {
    chainId: "0xC488", // 50312
    chainName: "Somnia Testnet",
    nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
    rpcUrls: ["https://dream-rpc.somnia.network"],
    blockExplorerUrls: ["https://shannon-explorer.somnia.network/"]
};

// Contracts - gunakan alamat yang sudah kamu deploy
window.CONTRACTS = {
    PAC_TOKEN: "0xf0993eb1fE7a5368778c4B5a8aE52c0fd503E7c9",   // PAC token
    PAC_REWARD: "0x3fcb2265EE7d8d854c8a1e5BCc6d0c16d90E88e1"  // PacmanReward
};
