import { BrowserProvider, JsonRpcProvider } from 'ethers';

export const checkWallet = () => {
  if (
    process.env.NEXT_PUBLIC_WALLET_MODE === 'live' &&
    typeof window !== 'undefined' &&
    window.ethereum
  ) {
    return true;
  } else {
    return false;
  }
};

export const connectWallet = async () => {
  if (checkWallet()) {
    return new BrowserProvider(window.ethereum);
  } else {
    return new JsonRpcProvider('http://127.0.0.1:8545');
  }
};
