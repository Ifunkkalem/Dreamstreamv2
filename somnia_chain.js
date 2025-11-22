// somnia_chain.js
async function addOrSwitchSomnia() {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const chain = {
    chainId: window.SOMNIA_CONFIG.chainIdHex,
    chainName: 'Somnia Testnet',
    rpcUrls: [window.SOMNIA_CONFIG.rpc],
    nativeCurrency: { name: 'Somnia Token', symbol: 'STT', decimals: 18 },
    blockExplorerUrls: ['https://explorer-testnet.somnia.network']
  };
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.chainId }] });
    return { switched: true };
  } catch (err) {
    if (err.code === 4902 || (err.message && err.message.includes('Unrecognized chain'))) {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [chain] });
      return { added: true };
    } else throw err;
  }
}
window.addOrSwitchSomnia = addOrSwitchSomnia;
