/* web3.js — DreamStream v2 FINAL FIXED */

// Fix MetaMask mobile injection delay
async function waitForEthereum() {
    return new Promise(resolve => {
        if (window.ethereum) return resolve(window.ethereum);
        let tries = 0;
        const interval = setInterval(() => {
            if (window.ethereum || tries > 20) {
                clearInterval(interval);
                resolve(window.ethereum);
            }
            tries++;
        }, 150);
    });
}

window.Web3Somnia = {
    provider: null,
    signer: null,
    address: null,

    async connect() {
        try {

            // Tunggu MetaMask inject (mobile fix)
            await waitForEthereum();

            if (!window.ethereum) {
                alert("MetaMask tidak terdeteksi! Buka lewat browser MetaMask.");
                return null;
            }

            // Connect ke MetaMask
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            await this.provider.send("eth_requestAccounts", []);
            this.signer = this.provider.getSigner();
            this.address = await this.signer.getAddress();

            // Update UI address
            const addrBox = document.getElementById("addr");
            if (addrBox) addrBox.innerHTML = this.address;

            // Dashboard + Live Pair
            this.updateDashboard();
            this.updatePairs();

            return this.address;

        } catch (e) {
            console.error("Connect error:", e);
            alert("MetaMask error: Rejected / not found.");
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

            const sttBox = document.getElementById("balSTT");
            const pacBox = document.getElementById("balPAC");

            if (sttBox) sttBox.innerHTML = "0.00";            // STT dummy
            if (pacBox) pacBox.innerHTML = ethers.utils.formatUnits(balPAC, 18);

            const dash = document.getElementById("dashboard");
            if (dash) dash.style.display = "block";

            const pairs = document.getElementById("livepairs");
            if (pairs) pairs.style.display = "block";

        } catch (e) {
            console.log("Dashboard error:", e);
        }
    },

    updatePairs() {
        const somusd = document.getElementById("pairSOMUSD");
        const sompac = document.getElementById("pairSOMPAC");
        const pacusd = document.getElementById("pairPACUSD");

        if (somusd) somusd.innerHTML = (Math.random() * 0.0004 + 0.0002).toFixed(5);
        if (sompac) sompac.innerHTML = (Math.random() * 2 + 1).toFixed(2);
        if (pacusd) pacusd.innerHTML = (Math.random() * 0.002 + 0.001).toFixed(4);
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

// Assign connect button
const btn = document.getElementById("btnConnect");
if (btn) {
    btn.onclick = async () => {
        await window.Web3Somnia.connect();
    };
}
