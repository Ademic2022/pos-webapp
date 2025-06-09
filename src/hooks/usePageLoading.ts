"use client";
import { useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { UsePageLoadingOptions } from "@/interfaces/interface";

export const usePageLoading = (options: UsePageLoadingOptions = {}) => {
  const { showPageLoader, hidePageLoader } = useLoading();
  const { text = "Loading page...", delay = 0, minDuration = 500 } = options;

  useEffect(() => {
    // Show loader immediately or after delay
    const showTimer = setTimeout(() => {
      showPageLoader(text);
    }, delay);

    // Hide loader after minimum duration
    const hideTimer = setTimeout(() => {
      hidePageLoader();
    }, delay + minDuration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      hidePageLoader();
    };
  }, [showPageLoader, hidePageLoader, text, delay, minDuration]);

  return { showPageLoader, hidePageLoader };
};

// Hook for async operations
export const useAsyncLoading = () => {
  const { setLoading } = useLoading();

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    loadingText: string = "Processing..."
  ): Promise<T> => {
    try {
      setLoading(true, loadingText);
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { withLoading, setLoading };
};
