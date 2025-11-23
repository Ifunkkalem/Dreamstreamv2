// config.js — Somnia Testnet Official Configuration (FINAL)

// RPC resmi
window.SOMNIA_RPC = "https://dream-rpc.somnia.network";

// Chain detail resmi Somnia Testnet
window.SOMNIA_CHAIN = {
    chainId: "0xC488", // 50312 (hex)
    chainName: "Somnia Testnet",
    nativeCurrency: {
        name: "Somnia Test Token",
        symbol: "STT",
        decimals: 18
    },
    rpcUrls: ["https://dream-rpc.somnia.network"],
    blockExplorerUrls: ["https://testnet.somnia.network/"]
};

// Smart contract scoring (contoh token/logic kamu)
window.SOMNIA_CONTRACT = {
    address: "0xDb706daF3C2e5B657d02f69841b4323958507de7", // Replace if needed
    abi: [
        {
            "inputs": [],
            "name": "submitScore",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{"internalType":"address","name":"user","type":"address"}],
            "name": "getScore",
            "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};
