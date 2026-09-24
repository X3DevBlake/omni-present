import { base44 } from '@/api/base44Client';

// Request batching and deduplication
export class RequestOptimizer {
  constructor() {
    this.pendingRequests = new Map();
    this.batchDelay = 100; // ms
    this.batchTimeout = null;
  }

  // Deduplicate identical requests
  async request(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    promise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return promise;
  }

  // Batch multiple requests
  async batchRequests(requests) {
    return Promise.all(
      requests.map(req => this.request(req.key, req.fn))
    );
  }
}

// Lazy loading and pagination helper
export class LazyLoader {
  constructor(pageSize = 20) {
    this.pageSize = pageSize;
    this.currentPage = 0;
    this.totalItems = 0;
    this.hasMore = true;
  }

  async loadMore(fetchFn) {
    if (!this.hasMore) return [];

    const items = await fetchFn(this.currentPage, this.pageSize);
    
    if (items.length < this.pageSize) {
      this.hasMore = false;
    }

    this.currentPage++;
    this.totalItems += items.length;

    return items;
  }

  reset() {
    this.currentPage = 0;
    this.totalItems = 0;
    this.hasMore = true;
  }
}

// Response compression and optimization
export async function optimizeResponse(data) {
  try {
    // Compress redundant data
    const optimized = await base44.integrations.Core.InvokeLLM({
      prompt: `Optimize response data:
      
Data: ${JSON.stringify(data)}

Compress by:
1. Removing redundant fields
2. Deduplicating arrays
3. Flattening nested structures where possible
4. Using short keys
5. Removing null values`,
    });

    return optimized;
  } catch (error) {
    console.error('Error optimizing response:', error);
    return data;
  }
}

// Prefetching strategy
export class PrefetchManager {
  constructor() {
    this.prefetchQueue = [];
    this.prefetchedData = new Map();
  }

  prefetch(key, fetchFn) {
    this.prefetchQueue.push({ key, fetchFn });
    
    if (!this.prefetching) {
      this.startPrefetching();
    }
  }

  async startPrefetching() {
    if (this.prefetching || this.prefetchQueue.length === 0) return;

    this.prefetching = true;

    while (this.prefetchQueue.length > 0) {
      const { key, fetchFn } = this.prefetchQueue.shift();
      
      try {
        const data = await fetchFn();
        this.prefetchedData.set(key, data);
      } catch (error) {
        console.error(`Prefetch error for ${key}:`, error);
      }
    }

    this.prefetching = false;
  }

  get(key) {
    return this.prefetchedData.get(key);
  }

  clear() {
    this.prefetchedData.clear();
  }
}

// Connection pooling for better resource usage
export class ConnectionPool {
  constructor(maxConnections = 6) {
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.queue = [];
  }

  async execute(task) {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      
      try {
        return await task();
      } finally {
        this.activeConnections--;
        this.processQueue();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.queue.push({ task, resolve, reject });
      });
    }
  }

  processQueue() {
    if (this.queue.length === 0 || this.activeConnections >= this.maxConnections) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift();
    this.activeConnections++;

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.activeConnections--;
        this.processQueue();
      });
  }
}

// Export singletons
export const requestOptimizer = new RequestOptimizer();
export const prefetchManager = new PrefetchManager();
export const connectionPool = new ConnectionPool();