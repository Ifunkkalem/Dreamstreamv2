// wallet.js — FINAL STABLE SOMNIA TESTNET (50312)

const SOMNIA = {
  chainId: "0xc488",
  chainName: "Somnia Testnet",
  rpcUrls: ["https://dream-rpc.somnia.network"],
  currency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18
  }
};

let provider = null;
let signer = null;
let userAddress = null;

async function ensureSomniaNetwork() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SOMNIA.chainId }]
    });
  } catch (err) {
    // Chain belum terpasang
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SOMNIA.chainId,
          chainName: SOMNIA.chainName,
          rpcUrls: SOMNIA.rpcUrls,
          nativeCurrency: SOMNIA.currency
        }]
      });
    } else {
      throw err;
    }
  }
}

async function connectSomniaWallet() {
  try {
    await ensureSomniaNetwork();

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    console.log("Connected:", userAddress);

    // Update UI
    document.querySelector("#wallet-input").value = userAddress;
    document.querySelector("#btn-metamask").innerHTML =
      "Connected: " + userAddress.slice(0, 6) + "...";

    return userAddress;

  } catch (err) {
    console.error("Wallet connect failed:", err);
    alert("Failed to connect wallet: " + err.message);
  }
}

window.connectSomniaWallet = connectSomniaWallet;
