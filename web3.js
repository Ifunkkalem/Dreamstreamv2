/* web3.js — DreamStream v2 SUPER FINAL (Fully Fixed) */

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
        alert("MetaMask tidak terdeteksi! Gunakan browser MetaMask.");
        return null;
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      this.address = await this.signer.getAddress();

      // FIX: elemen DreamStreamv2
      document.getElementById("addr-display").innerText = this.address;

      document.getElementById("stream-status").innerText = "CONNECTED";
      document.getElementById("live-indicator").classList.remove("offline");
      document.getElementById("live-indicator").classList.add("online");
      document.getElementById("live-indicator").innerText = "ONLINE";

      this.updateBalances();
      this.updatePairs();

      return this.address;

    } catch (e) {
      console.error(e);
      alert("Gagal connect MetaMask.");
      return null;
    }
  },

  async updateBalances() {
    try {
      // Load PAC token
      const pac = new ethers.Contract(
        window.CONTRACTS.PAC_TOKEN,
        window.ABI.PAC,
        this.provider
      );

      const balSTT = await this.provider.getBalance(this.address);
      const balPAC = await pac.balanceOf(this.address);

      // FIX: elemen DreamStreamv2
      document.getElementById("balance-stt").innerText =
        Number(ethers.utils.formatEther(balSTT)).toFixed(4);

      document.getElementById("balance-pac").innerText =
        Number(ethers.utils.formatUnits(balPAC, 18)).toFixed(4);

    } catch (e) {
      console.log("updateBalances error:", e);
    }
  },

  updatePairs() {
    // FIX: list container DreamStreamv2
    const pairs = `
      SOM/USD : ${(Math.random() * 0.0004 + 0.0002).toFixed(5)}<br>
      SOM/PAC : ${(Math.random() * 2 + 1).toFixed(2)}<br>
      PAC/USD : ${(Math.random() * 0.002 + 0.001).toFixed(4)}
    `;
    document.getElementById("pairs").innerHTML = pairs;
  },

  async startGame() {
    // clean + compatible with pacman_hybrid.js
    try {
      const tx = await this.signer.sendTransaction({
        to: this.address,
        value: ethers.utils.parseEther("0.01")
      });
      await tx.wait();
      return true;
    } catch (e) {
      alert("Transaksi start game gagal.");
      return false;
    }
  },

  async swapScore(score) {
    if (score < 10) return "Minimal 10 skor untuk swap.";

    const pac = Math.floor(score / 10);
    return `Swap berhasil! Anda menerima ${pac} PAC (simulasi).`;
  }
};

/* FIX tombol connect DreamStreamv2 */
document.getElementById("btn-connect").onclick = async () => {
  await window.Web3Somnia.connect();
};
