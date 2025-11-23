// somnia_chain.js — Somnia Wallet Connection Layer (FINAL)

window.Somnia = {
    provider: null,
    signer: null,
    address: null,

    // -----------------------------------------
    // DETECT METAMASK
    // -----------------------------------------
    detect() {
        if (typeof window.ethereum === "undefined") {
            console.warn("MetaMask not detected");
            return false;
        }
        window.Somnia.provider = new ethers.providers.Web3Provider(window.ethereum);
        return true;
    },

    // -----------------------------------------
    // CONNECT WALLET
    // -----------------------------------------
    async connectWallet() {
        try {
            if (!this.detect()) {
                alert("MetaMask tidak ditemukan!");
                return null;
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            this.address = accounts[0];
            this.signer = window.Somnia.provider.getSigner();

            console.log("Connected:", this.address);

            return this.address;

        } catch (err) {
            console.error("Connect error:", err);
            return null;
        }
    },

    // -----------------------------------------
    // ADD SOMNIA TESTNET
    // -----------------------------------------
    async addSomniaChain() {
        try {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [window.SOMNIA_CHAIN]
            });
            return true;
        } catch (err) {
            console.error("Add chain error:", err);
            return false;
        }
    },

    // -----------------------------------------
    // SWITCH SOMNIA TESTNET
    // -----------------------------------------
    async switchSomnia() {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: window.SOMNIA_CHAIN.chainId }]
            });
            return true;

        } catch (err) {
            if (err.code === 4902) {
                // If chain not added → add then switch
                await this.addSomniaChain();
                return this.switchSomnia();
            }

            console.error("Switch chain error:", err);
            return false;
        }
    },

    // -----------------------------------------
    // ONCHAIN SCORE SUBMISSION
    // -----------------------------------------
    async submitScore(score) {
        try {
            if (!this.signer) await this.connectWallet();

            const contract = new ethers.Contract(
                window.SOMNIA_CONTRACT.address,
                window.SOMNIA_CONTRACT.abi,
                this.signer
            );

            const tx = await contract.submitScore({
                value: 0 // atau jika kontrak kamu butuh STT
            });

            document.getElementById("txStatus").innerHTML =
                "Pending: " + tx.hash;

            const receipt = await tx.wait();

            document.getElementById("txStatus").innerHTML =
                "Success! Block: " + receipt.blockNumber;

            return receipt;

        } catch (err) {
            console.error("TX error:", err);
            document.getElementById("txStatus").innerHTML =
                "Error: " + err.message;
        }
    }
};

// Make global for pacman_hybrid.js
window.submitScoreOnchain = (score) => window.Somnia.submitScore(score);
