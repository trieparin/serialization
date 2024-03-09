import { ReactNode, createContext, useMemo, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export const LoadingContext = createContext<LoadingContextType>(null!);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const loading = useMemo(
    () => ({ isLoading, startLoading, stopLoading }),
    [isLoading]
  );

  return (
    <LoadingContext.Provider value={loading}>
      {children}
    </LoadingContext.Provider>
  );
};
