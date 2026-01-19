/**
 * Performance Optimizer - Enhanced caching and query optimization
 */

export const optimizedQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 2,
};

export const realtimeQueryConfig = {
  staleTime: 0,
  cacheTime: 1 * 60 * 1000, // 1 minute
  refetchInterval: 5000, // 5 seconds
  retry: 1,
};

export const staticQueryConfig = {
  staleTime: Infinity,
  cacheTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

// Pagination helper
export class PaginationManager {
  constructor(pageSize = 20) {
    this.pageSize = pageSize;
    this.currentPage = 1;
  }

  getQueryParams() {
    return {
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.pageSize,
    };
  }

  nextPage() {
    this.currentPage++;
    return this.getQueryParams();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    return this.getQueryParams();
  }

  reset() {
    this.currentPage = 1;
  }
}

// Debounce for search inputs
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Batch API calls
export class BatchProcessor {
  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  async add(item) {
    this.queue.push(item);
    
    if (!this.processing) {
      this.processing = true;
      await this.process();
    }
  }

  async process() {
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await Promise.all(batch.map(item => item()));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    this.processing = false;
  }
}