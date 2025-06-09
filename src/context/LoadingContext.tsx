"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  LoadingContextType,
  LoadingProviderProps,
} from "@/interfaces/interface";

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const setLoading = useCallback((loading: boolean, text?: string) => {
    setIsLoading(loading);
    if (text) setLoadingText(text);
  }, []);

  const showPageLoader = useCallback(
    (text = "Loading page...") => {
      setLoading(true, text);
    },
    [setLoading]
  );

  const hidePageLoader = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const contextValue: LoadingContextType = {
    isLoading,
    setLoading,
    showPageLoader,
    hidePageLoader,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && (
        <LoadingSpinner fullScreen={true} text={loadingText} size="lg" />
      )}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
