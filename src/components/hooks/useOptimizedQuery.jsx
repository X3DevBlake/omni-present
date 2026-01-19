import { useQuery } from '@tanstack/react-query';
import { rateLimitHandler } from '../utils/rateLimitHandler';
import { optimizedQueryConfig, realtimeQueryConfig, staticQueryConfig } from '../utils/performanceOptimizer';

/**
 * Enhanced useQuery hook with rate limit handling and optimized caching
 */
export function useOptimizedQuery(queryKey, queryFn, options = {}) {
  const { queryType = 'optimized', ...restOptions } = options;

  // Select config based on query type
  let baseConfig;
  if (queryType === 'realtime') {
    baseConfig = realtimeQueryConfig;
  } else if (queryType === 'static') {
    baseConfig = staticQueryConfig;
  } else {
    baseConfig = optimizedQueryConfig;
  }

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Wrap query function with rate limit handler
      return rateLimitHandler.executeWithRetry(queryFn);
    },
    ...baseConfig,
    ...restOptions,
  });
}

/**
 * Hook for paginated queries with automatic optimization
 */
export function usePaginatedQuery(queryKey, queryFn, pageSize = 20) {
  const [page, setPage] = React.useState(1);

  const query = useOptimizedQuery(
    [...queryKey, { page, pageSize }],
    () => queryFn({ 
      skip: (page - 1) * pageSize, 
      limit: pageSize 
    }),
    {
      keepPreviousData: true,
    }
  );

  return {
    ...query,
    page,
    pageSize,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    setPage,
  };
}

/**
 * Hook for infinite scroll queries
 */
export function useInfiniteOptimizedQuery(queryKey, queryFn, pageSize = 20) {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      return rateLimitHandler.executeWithRetry(() => 
        queryFn({ skip: pageParam, limit: pageSize })
      );
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < pageSize) return undefined;
      return pages.length * pageSize;
    },
    ...optimizedQueryConfig,
  });
}