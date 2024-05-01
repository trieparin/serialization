import { ReactNode, createContext, useMemo, useState } from 'react';

interface ILoadingContext {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export const LoadingContext = createContext<ILoadingContext>(null!);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const isLoading = useMemo(
    () => ({ loading, startLoading, stopLoading }),
    [loading]
  );

  return (
    <LoadingContext.Provider value={isLoading}>
      {children}
    </LoadingContext.Provider>
  );
};
