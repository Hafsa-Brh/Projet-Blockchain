import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    alert("🦊 Please install MetaMask!");
    return null;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet.");
    return null;
  }
}
