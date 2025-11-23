// web3.js — FINAL SOMNIA TESTNET + PACMAN REWARD
// -------------------------------------------------

const SOMNIA_CHAIN = {
    chainId: "0xC4B8", // 50312 decimal → hex
    chainName: "Somnia Testnet",
    nativeCurrency: {
        name: "Somnia Test Token",
        symbol: "STT",
        decimals: 18
    },
    rpcUrls: ["https://dream-rpc.somnia.network"],
    blockExplorerUrls: ["https://explorer.somnia.network"]
};

// Kontrak final (PENTING)
const PACMAN_REWARD = "0x3fcb2265EE7d8d854c8a1e5BCc6d0c16d90E88e1";
const PAC_TOKEN = "0xf0993eb1fE7a5368778c4B5a8aE52c0fd503E7c9";

// ABI berdasar kontrak yang kamu deploy
const PACMAN_REWARD_ABI = [
    {
        "inputs":[{"internalType":"address","name":"_pacToken","type":"address"}],
        "stateMutability":"nonpayable",
        "type":"constructor"
    },
    {
        "inputs":[],
        "name":"startFee",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"claimFee",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"uint256","name":"points","type":"uint256"}],
        "name":"submitScore",
        "outputs":[],
        "stateMutability":"payable",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"startGame",
        "outputs":[],
        "stateMutability":"payable",
        "type":"function"
    }
];

let provider;
let signer;
let contract;

window.Web3Somnia = {

    // CONNECT METAMASK
    connect: async () => {
        if (!window.ethereum) {
            alert("MetaMask tidak ditemukan!");
            return null;
        }

        try {
            // Switch chain ke somnia testnet
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [SOMNIA_CHAIN]
            });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(PACMAN_REWARD, PACMAN_REWARD_ABI, signer);

            const addr = await signer.getAddress();
            return addr;

        } catch (e) {
            console.error("Connect error:", e);
            return null;
        }
    },

    // START GAME → bayar 0.01 STT
    start: async () => {
        try {
            const tx = await contract.startGame({
                value: ethers.utils.parseEther("0.01")
            });
            return tx;

        } catch (err) {
            console.error("Start game error:", err);
            return null;
        }
    },

    // SUBMIT SCORE → bayar 0.001 STT
    submitScore: async (points) => {
        try {
            const tx = await contract.submitScore(points, {
                value: ethers.utils.parseEther("0.001")
            });
            return tx;

        } catch (err) {
            console.error("Submit error:", err);
            return null;
        }
    }

};
