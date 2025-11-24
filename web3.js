/* web3.js — DreamStream v2 FINAL */

window.Web3Somnia = {
    provider: null,
    signer: null,
    address: null,

    async connect() {
        try {
            if (!window.ethereum) {
                alert("MetaMask tidak ditemukan!");
                return null;
            }

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            await this.provider.send("eth_requestAccounts", []);
            this.signer = this.provider.getSigner();
            this.address = await this.signer.getAddress();

            document.getElementById("addr").innerHTML = this.address;

            this.updateDashboard();
            this.updatePairs();

            return this.address;

        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async updateDashboard() {
        try {
            const pac = new ethers.Contract(
                window.CONTRACTS.PAC_TOKEN,
                window.ABI.PAC,
                this.provider
            );

            const balPAC = await pac.balanceOf(this.address);

            document.getElementById("balSTT").innerHTML = "0.00";
            document.getElementById("balPAC").innerHTML = ethers.utils.formatUnits(balPAC, 18);

            document.getElementById("dashboard").style.display = "block";
            document.getElementById("livepairs").style.display = "block";

        } catch (e) {
            console.log(e);
        }
    },

    updatePairs() {
        document.getElementById("pairSOMUSD").innerHTML = (Math.random() * 0.0004 + 0.0002).toFixed(5);
        document.getElementById("pairSOMPAC").innerHTML = (Math.random() * 2 + 1).toFixed(2);
        document.getElementById("pairPACUSD").innerHTML = (Math.random() * 0.002 + 0.001).toFixed(4);
    },

    async startGame() {
        alert("Silakan bayar 0.01 STT di MetaMask (dummy).");
        return true;
    },

    async swapScore(score) {
        if (score < 10) return "Minimal 10 score untuk swap";

        const pac = Math.floor(score / 10);
        return `Anda menerima ${pac} PAC token.`;
    }
};

document.getElementById("btnConnect").onclick = async () => {
    await window.Web3Somnia.connect();
};
