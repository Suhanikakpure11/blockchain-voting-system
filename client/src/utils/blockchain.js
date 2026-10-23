import { ethers } from "ethers";

// Default Hardhat accounts for instant testing / demo switcher
export const HARDHAT_DEFAULT_ACCOUNTS = [
  {
    role: "Election Admin",
    name: "Dr. N. M. Kandoi (Admin)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    voterId: "ADMIN-01",
  },
  {
    role: "Voter 1",
    name: "Shravani Raut [27]",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    voterId: "VOTER-27",
  },
  {
    role: "Voter 2",
    name: "Shreya Katole [28]",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb2f958080a149f21341a3e509c1630c79f3131",
    voterId: "VOTER-28",
  },
  {
    role: "Voter 3",
    name: "Suhani Kakpure [33]",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    voterId: "VOTER-33",
  },
];

// Switch MetaMask network to Hardhat Localhost
export async function switchToHardhatNetwork() {
  if (!window.ethereum) throw new Error("MetaMask is not installed in this browser.");

  const hardhatChainId = "0x7a69"; // 31337 in hex

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hardhatChainId }],
    });
  } catch (switchError) {
    // Error 4902 means the chain hasn't been added yet
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hardhatChainId,
              chainName: "Hardhat Localhost",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["http://127.0.0.1:8545"],
            },
          ],
        });
      } catch (addError) {
        throw new Error("Failed to add Hardhat network to MetaMask: " + addError.message);
      }
    } else {
      throw switchError;
    }
  }
}

// Get connected signer & provider
export async function getBlockchainContext(activePreset = null) {
  // If user selected a preset Hardhat wallet
  if (activePreset) {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = new ethers.Wallet(activePreset.privateKey, provider);
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    return {
      provider,
      signer,
      address,
      balanceEth: ethers.formatEther(balance),
      mode: "preset",
    };
  }

  // Otherwise check MetaMask
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    return {
      provider,
      signer,
      address,
      balanceEth: ethers.formatEther(balance),
      network,
      mode: "metamask",
    };
  }

  // Default fallback read-only provider
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return {
    provider,
    signer: null,
    address: null,
    balanceEth: "0",
    mode: "readonly",
  };
}
