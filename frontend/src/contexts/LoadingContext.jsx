import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const loading = loadingCount > 0;

  const showLoading = useCallback(() => {
    setLoadingCount(prev => prev + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount(prev => Math.max(0, prev - 1));
  }, []);

  const resetLoading = useCallback(() => {
    setLoadingCount(0);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading, resetLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;
