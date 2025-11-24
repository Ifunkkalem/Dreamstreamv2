// web3.js — simple global web3 helper (ethers v5)
let provider = null;
let signer = null;
let userAddress = null;
let rewardContract = null;

const PAC_REWARD_ABI = [
  { "inputs":[{"internalType":"address","name":"_pacToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor" },
  { "inputs":[],"name":"startGame","outputs":[],"stateMutability":"payable","type":"function" },
  { "inputs":[{"internalType":"uint256","name":"points","type":"uint256"}],"name":"submitScore","outputs":[],"stateMutability":"payable","type":"function" },
  { "inputs":[],"name":"startFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function" },
  { "inputs":[],"name":"claimFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function" }
];

window.Web3Somnia = {
  connected: false,

  connect: async function() {
    if (!window.ethereum) {
      alert("MetaMask not found. Please use MetaMask mobile/browser.");
      return null;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      try {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [window.SOMNIA_CHAIN]
        });
      } catch(e){ }

      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      rewardContract = new ethers.Contract(window.CONTRACTS.PAC_REWARD, PAC_REWARD_ABI, signer);

      this.connected = true;
      return userAddress;
    } catch (err) {
      console.error("connect err", err);
      return null;
    }
  },

  getBalances: async function(address) {
    if (!provider) return { stt: 0, pac: 0 };
    const stt = await provider.getBalance(address);
    const pacAbi = [{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}];
    const pac = new ethers.Contract(window.CONTRACTS.PAC_TOKEN, pacAbi, provider);
    const pacBal = await pac.balanceOf(address);
    return { stt: ethers.utils.formatEther(stt), pac: ethers.utils.formatEther(pacBal) };
  },

  startGameOnchain: async function() {
    if (!rewardContract) return null;
    const tx = await rewardContract.startGame({ value: ethers.utils.parseEther("0.01") });
    return tx;
  },

  submitScoreOnchain: async function(points) {
    if (!rewardContract) return null;
    const tx = await rewardContract.submitScore(points, { value: ethers.utils.parseEther("0.001") });
    return tx;
  }
};
