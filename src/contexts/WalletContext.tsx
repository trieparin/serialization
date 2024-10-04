import { BrowserProvider, Provider } from 'ethers';
import { ReactNode, createContext, useEffect, useState } from 'react';

export const WalletContext = createContext<Provider | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<Provider>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  return (
    <WalletContext.Provider value={provider}>{children}</WalletContext.Provider>
  );
};
