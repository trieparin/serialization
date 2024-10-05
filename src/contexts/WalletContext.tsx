import { BrowserProvider, JsonRpcApiProvider, JsonRpcProvider } from 'ethers';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface IWalletProvider {
  provider: BrowserProvider | JsonRpcApiProvider | undefined;
  setMode: Dispatch<SetStateAction<string | undefined>>;
}

export const WalletContext = createContext<IWalletProvider>(null!);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<
    BrowserProvider | JsonRpcApiProvider | undefined
  >(undefined);
  const [mode, setMode] = useState<string | undefined>(
    process.env.NEXT_PUBLIC_WALLET_MODE
  );

  const wallet = useMemo(() => {
    console.log('memo');
    if (mode === 'test') {
      const localProvider = new JsonRpcProvider('http://127.0.0.1:8545');
      setProvider(localProvider);
    } else {
      if (typeof window !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);
      }
    }
    return {
      provider,
      setMode,
    };
  }, [mode, provider]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
};
