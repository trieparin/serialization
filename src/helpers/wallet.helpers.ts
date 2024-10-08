import { BrowserProvider, JsonRpcProvider } from 'ethers';

export const connectWallet = async () => {
  if (
    process.env.NEXT_PUBLIC_WALLET_MODE === 'live' &&
    typeof window !== 'undefined' &&
    window.ethereum
  ) {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    return {
      provider,
      accounts,
    };
  } else {
    const provider = new JsonRpcProvider('http://127.0.0.1:8545');
    const accounts = await provider.listAccounts();
    return {
      provider,
      accounts,
    };
  }
};
