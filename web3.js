/* web3.js — DreamStream v2 FINAL (STT native) */

async function waitForEthereum() {
  return new Promise((resolve) => {
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
      await waitForEthereum();
      if (!window.ethereum) {
        alert("MetaMask tidak terdeteksi! Buka lewat browser MetaMask.");
        return null;
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      this.address = await this.signer.getAddress();

      document.getElementById("addr").innerText = this.address;

      this.updateDashboard();
      this.updatePairs();

      return this.address;
    } catch (e) {
      console.error("Connect error:", e);
      alert("Gagal connect MetaMask.");
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

      document.getElementById("balSTT").innerText = await this.provider.getBalance(this.address).then(b => ethers.utils.formatEther(b));
      document.getElementById("balPAC").innerText = ethers.utils.formatUnits(balPAC, 18);

      document.getElementById("dashboard").style.display = "block";
      document.getElementById("livepairs").style.display = "block";
    } catch (e) {
      console.error("Dashboard error:", e);
    }
  },

  updatePairs() {
    document.getElementById("pairSOMUSD").innerText = (Math.random() * 0.0004 + 0.0002).toFixed(5);
    document.getElementById("pairSOMPAC").innerText = (Math.random() * 2 + 1).toFixed(2);
    document.getElementById("pairPACUSD").innerText = (Math.random() * 0.002 + 0.001).toFixed(4);
  },

  async startGame() {
    try {
      const tx = await this.signer.sendTransaction({
        to: this.address, // dummy: kirim ke diri sendiri sebagai simulasi
        value: ethers.utils.parseEther("0.01")
      });
      await tx.wait();
      return true;
    } catch (e) {
      console.error("startGame tx error:", e);
      alert("Transaksi gagal saat start game.");
      return false;
    }
  },

  async swapScore(score) {
    if (score < 10) return "Skor minimal 10 untuk swap.";
    const pac = Math.floor(score / 10);
    // simulasi swap tanpa kontrak onchain
    return `Anda menerima ${pac} PAC (simulasi).`;
  }
};

document.getElementById("btnConnect").onclick = async () => {
  await window.Web3Somnia.connect();
};
