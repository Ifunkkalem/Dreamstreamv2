// app.js — FINAL SOMNIA ONCHAIN TX READY

import "./wallet.js";
import "./config.js";

let contract = null;

async function initContract() {
  const addr = SOMNIA_CONFIG.pacmanContract.address;
  const abi = SOMNIA_CONFIG.pacmanContract.abi;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  contract = new ethers.Contract(addr, abi, signer);
  return contract;
}

document.querySelector("#btn-metamask").onclick = async () => {
  const address = await connectSomniaWallet();
  if (!address) return;

  contract = await initContract();
  console.log("Contract ready:", contract.address);

  alert("Wallet connected & ready on Somnia Testnet!");
};

// === SEND SCORE TO BLOCKCHAIN ===
window.submitScoreOnchain = async function(score) {
  if (!contract) contract = await initContract();
  const tx = await contract.submitScore(score);
  await tx.wait();
  console.log("Score submitted:", score);
};

// === CLAIM REWARD ===
window.claimReward = async function () {
  if (!contract) contract = await initContract();
  const tx = await contract.claimReward();
  await tx.wait();

  alert("Reward claimed!");
};
