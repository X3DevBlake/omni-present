import React, { useMemo, useCallback } from 'react';

export const useOptimizedQuery = (queryKey, queryFn, options = {}) => {
  return useMemo(() => ({
    ...options,
    staleTime: options.staleTime ?? 5 * 60 * 1000,
    gcTime: options.gcTime ?? 10 * 60 * 1000,
    retry: options.retry ?? 1,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false
  }), []);
};

export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

export const OptimizedComponent = React.memo(({ children, ...props }) => {
  return <div {...props}>{children}</div>;
});