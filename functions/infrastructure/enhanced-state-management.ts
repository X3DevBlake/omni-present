import { base44 } from '@/api/base44Client';

// Advanced caching layer for video data
export class VideoDataCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  set(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  // Preload analytics data
  async preloadVideoAnalytics(videoIds, userEmail) {
    try {
      const analyticsData = await base44.integrations.Core.InvokeLLM({
        prompt: `Batch load analytics for videos:
        
VideoIDs: ${videoIds.join(', ')}
User: ${userEmail}

Load all analytics data efficiently and cache.`,
      });

      videoIds.forEach((id, idx) => {
        if (analyticsData[idx]) {
          this.set(`analytics_${id}`, analyticsData[idx]);
        }
      });

      return analyticsData;
    } catch (error) {
      console.error('Error preloading analytics:', error);
      throw error;
    }
  }
}

// Batch processing engine for efficient data operations
export class BatchProcessor {
  constructor(batchSize = 10) {
    this.batchSize = batchSize;
    this.queue = [];
    this.processing = false;
  }

  async add(task) {
    this.queue.push(task);
    if (this.queue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  async processBatch() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      const results = await Promise.all(batch.map(task => task()));
      return results;
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    } finally {
      this.processing = false;
    }
  }

  async flush() {
    while (this.queue.length > 0) {
      await this.processBatch();
    }
  }
}

// Real-time sync engine
export class RealtimeSyncEngine {
  constructor() {
    this.subscriptions = new Map();
    this.syncInterval = 30000; // 30 seconds
  }

  subscribe(entityType, callback) {
    if (!this.subscriptions.has(entityType)) {
      this.subscriptions.set(entityType, []);
      this.startSync(entityType);
    }

    const callbacks = this.subscriptions.get(entityType);
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  async startSync(entityType) {
    setInterval(async () => {
      try {
        const data = await base44.integrations.Core.InvokeLLM({
          prompt: `Get latest ${entityType} data for sync`,
        });

        const callbacks = this.subscriptions.get(entityType) || [];
        callbacks.forEach(cb => cb(data));
      } catch (error) {
        console.error(`Error syncing ${entityType}:`, error);
      }
    }, this.syncInterval);
  }
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  track(metricName, duration) {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }

    this.metrics.get(metricName).push({
      duration,
      timestamp: Date.now(),
    });
  }

  getMetrics(metricName) {
    const data = this.metrics.get(metricName) || [];
    const durations = data.map(d => d.duration);
    
    return {
      count: durations.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      recent: data.slice(-10),
    };
  }

  getAllMetrics() {
    const result = {};
    for (const [name, data] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }
}

// Export singletons
export const videoCache = new VideoDataCache();
export const batchProcessor = new BatchProcessor();
export const realtimeSync = new RealtimeSyncEngine();
export const performanceMonitor = new PerformanceMonitor();