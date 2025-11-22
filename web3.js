// web3.js — Ethers helpers for Somnia + contract actions
let provider, signer, userAddress, pacmanContract;

async function connectMetaMask() {
  if(!window.ethereum) throw new Error('MetaMask not found');
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  // try switch/add
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: window.SOMNIA_CONFIG.chainIdHex }]});
  } catch (e) {
    if (e.code === 4902 || (e.message&&e.message.includes('Unrecognized'))) {
      await addOrSwitchSomnia();
    } else {
      console.warn('Switch chain error', e);
    }
  }

  pacmanContract = new ethers.Contract(window.SOMNIA_CONFIG.pacmanContract.address, window.SOMNIA_CONFIG.pacmanContract.abi, signer);
  return { provider, signer, userAddress, pacmanContract };
}

// read-only provider helper (RPC)
function getRpcProvider() {
  return new ethers.providers.JsonRpcProvider(window.SOMNIA_CONFIG.rpc);
}
