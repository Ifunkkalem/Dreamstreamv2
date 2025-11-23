// web3.js — FINAL Somnia Web3 Utility Layer (Competition Edition)

window.Web3Somnia = {
    provider: null,
    signer: null,
    address: null,
    contract: null,

    // Initialize provider safely
    init() {
        if (typeof window.ethereum === "undefined") {
            console.warn("MetaMask not found");
            return false;
        }

        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        return true;
    },

    // Connect wallet
    async connect() {
        try {
            if (!this.init()) return null;

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            this.address = accounts[0];
            this.signer = this.provider.getSigner();

            return this.address;

        } catch (e) {
            console.error("Wallet Connect Error:", e);
            return null;
        }
    },

    // Load smart contract instance (from config.js)
    loadContract() {
        if (!window.SOMNIA_CONTRACT) return null;

        this.contract = new ethers.Contract(
            window.SOMNIA_CONTRACT.address,
            window.SOMNIA_CONTRACT.abi,
            this.signer
        );

        return this.contract;
    },

    // Read only
    async readScore(address) {
        try {
            if (!this.contract) this.loadContract();
            return await this.contract.getScore(address);
        } catch (e) {
            console.error("Read Error:", e);
            return 0;
        }
    },

    // Write score
    async submitScore(score) {
        try {
            if (!this.signer) await this.connect();
            if (!this.contract) this.loadContract();

            const tx = await this.contract.submitScore({
                value: 0
            });

            return tx;

        } catch (err) {
            console.error("TX error:", err);
            return null;
        }
    }
};

// GLOBAL bridge for Pac-Man iframe
window.submitScoreOnchain = async (score) => {
    return await window.Web3Somnia.submitScore(score);
};
