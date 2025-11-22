async function addOrSwitchSomnia() {
  if (!window.ethereum)
    throw new Error('MetaMask not found');

  const chain = {
    chainId: "0xc488", // HEX dari 50312
    chainName: "Somnia Testnet",
    rpcUrls: ["https://dream-rpc.somnia.network"],
    nativeCurrency: {
      name: "Somnia Test Token",
      symbol: "STT",
      decimals: 18
    },
    blockExplorerUrls: ["https://explorer-testnet.somnia.network"]
  };

  try {
    // Switch chain kalau sudah ada
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.chainId }]
    });
    return { switched: true };

  } catch (err) {

    // Chain belum ditambahkan
    if (err.code === 4902 || err.message.includes("Unrecognized")) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [chain]
      });
      return { added: true };
    }

    throw err;
  }
}

window.addOrSwitchSomnia = addOrSwitchSomnia;
