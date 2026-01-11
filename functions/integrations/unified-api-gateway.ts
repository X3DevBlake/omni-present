import { base44 } from '@/api/base44Client';

// Intelligent caching system
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  set(key, value, ttlMs = 5 * 60 * 1000) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + ttlMs);
    
    // Auto-cleanup old entries
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }

  get(key) {
    const ttl = this.ttls.get(key);
    if (!ttl || Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return this.cache.get(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, ttl] of this.ttls) {
      if (now > ttl) {
        this.cache.delete(key);
        this.ttls.delete(key);
        this.stats.evictions++;
      }
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0,
      ...this.stats,
    };
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
  }
}

// Request deduplication and batching
class RequestBatcher {
  constructor(batchDelay = 50) {
    this.batchDelay = batchDelay;
    this.batches = new Map();
    this.timers = new Map();
    this.deduplicationMap = new Map();
  }

  async addRequest(service, request) {
    const requestKey = JSON.stringify(request);
    
    // Check if identical request is pending
    if (this.deduplicationMap.has(requestKey)) {
      return this.deduplicationMap.get(requestKey);
    }

    if (!this.batches.has(service)) {
      this.batches.set(service, []);
    }

    const promise = new Promise((resolve, reject) => {
      this.batches.get(service).push({
        request,
        resolve,
        reject,
        key: requestKey,
      });

      // Clear existing timer
      if (this.timers.has(service)) {
        clearTimeout(this.timers.get(service));
      }

      // Set new timer to execute batch
      const timer = setTimeout(() => {
        this.executeBatch(service);
      }, this.batchDelay);

      this.timers.set(service, timer);
    });

    // Store promise for deduplication
    this.deduplicationMap.set(requestKey, promise);
    promise.finally(() => this.deduplicationMap.delete(requestKey));

    return promise;
  }

  async executeBatch(service) {
    const requests = this.batches.get(service) || [];
    if (requests.length === 0) return;

    this.batches.set(service, []);

    try {
      const responses = await base44.integrations.Core.InvokeLLM({
        prompt: `Batch process ${service} requests:
        ${requests.map((r, i) => `${i + 1}. ${JSON.stringify(r.request)}`).join('\n')}`,
      });

      requests.forEach((item, idx) => {
        item.resolve(responses[idx] || responses);
      });
    } catch (error) {
      requests.forEach(item => item.reject(error));
    }
  }
}

// Connection pooling
class ConnectionPool {
  constructor(maxConnections = 6) {
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.queue = [];
    this.connectionStats = {
      totalRequests: 0,
      totalTime: 0,
      averageTime: 0,
    };
  }

  async execute(task) {
    const startTime = Date.now();

    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      
      try {
        const result = await task();
        this.recordStats(Date.now() - startTime);
        return result;
      } finally {
        this.activeConnections--;
        this.processQueue();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.queue.push({ task, resolve, reject, startTime });
      });
    }
  }

  processQueue() {
    if (this.queue.length === 0 || this.activeConnections >= this.maxConnections) {
      return;
    }

    const { task, resolve, reject, startTime } = this.queue.shift();
    this.activeConnections++;

    task()
      .then(result => {
        this.recordStats(Date.now() - startTime);
        resolve(result);
      })
      .catch(reject)
      .finally(() => {
        this.activeConnections--;
        this.processQueue();
      });
  }

  recordStats(duration) {
    this.connectionStats.totalRequests++;
    this.connectionStats.totalTime += duration;
    this.connectionStats.averageTime = 
      this.connectionStats.totalTime / this.connectionStats.totalRequests;
  }

  getStats() {
    return {
      ...this.connectionStats,
      queueLength: this.queue.length,
      activeConnections: this.activeConnections,
    };
  }
}

// Unified API Gateway
export class UnifiedAPIGateway {
  constructor() {
    this.cache = new IntelligentCache();
    this.batcher = new RequestBatcher();
    this.pools = new Map();
    this.services = new Set();
    this.middlewares = [];
    
    // Initialize pools for common services
    ['twilio', 'elevenlabs', 'snowflake', 'googledocs', 'slack'].forEach(service => {
      this.pools.set(service, new ConnectionPool(6));
    });
  }

  // Register middleware
  use(middleware) {
    this.middlewares.push(middleware);
  }

  // Core request handler
  async request(service, operation, data, options = {}) {
    const cacheKey = `${service}:${operation}:${JSON.stringify(data)}`;
    
    // Check cache
    if (options.cacheable !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Apply middlewares
    let finalData = data;
    for (const middleware of this.middlewares) {
      finalData = await middleware(service, operation, finalData);
    }

    // Get or create pool
    const pool = this.pools.get(service) || new ConnectionPool();
    if (!this.pools.has(service)) {
      this.pools.set(service, pool);
    }

    // Execute with connection pooling
    const result = await pool.execute(async () => {
      return this.batcher.addRequest(service, {
        operation,
        data: finalData,
      });
    });

    // Cache result
    if (options.cacheable !== false) {
      this.cache.set(cacheKey, result, options.cacheTTL);
    }

    return result;
  }

  // Specialized request handlers
  async querySnowflake(sql, params = {}) {
    return this.request('snowflake', 'query', { sql, params });
  }

  async sendTwilioMessage(to, message) {
    return this.request('twilio', 'send', { to, message });
  }

  async generateVoiceover(text, options = {}) {
    return this.request('elevenlabs', 'generate', { text, ...options });
  }

  async updateGoogleDoc(docId, content) {
    return this.request('googledocs', 'update', { docId, content });
  }

  async sendSlackMessage(channel, message) {
    return this.request('slack', 'send', { channel, message });
  }

  // Batch operations
  async batchRequests(requests) {
    return Promise.all(
      requests.map(req => 
        this.request(req.service, req.operation, req.data, req.options)
      )
    );
  }

  // Get gateway stats
  getStats() {
    const poolStats = {};
    for (const [service, pool] of this.pools) {
      poolStats[service] = pool.getStats();
    }

    return {
      cache: this.cache.getStats(),
      pools: poolStats,
      servicesRegistered: this.services.size,
      totalRequests: Array.from(this.pools.values()).reduce(
        (sum, pool) => sum + pool.connectionStats.totalRequests,
        0
      ),
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton
export const apiGateway = new UnifiedAPIGateway();