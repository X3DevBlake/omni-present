/**
 * Rate Limit Handler - Gracefully handles API rate limits with exponential backoff
 */

class RateLimitHandler {
  constructor() {
    this.requestQueue = [];
    this.retryDelays = [1000, 2000, 5000, 10000]; // Exponential backoff
    this.maxRetries = 4;
  }

  async executeWithRetry(apiCall, retryCount = 0) {
    try {
      const response = await apiCall();
      return response;
    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error.response?.status === 429 || error.status === 429) {
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelays[retryCount] || 10000;
          
          // Show user-friendly notification
          this.notifyUser(`Rate limit reached. Retrying in ${delay / 1000}s...`, 'info');
          
          await this.sleep(delay);
          return this.executeWithRetry(apiCall, retryCount + 1);
        } else {
          this.notifyUser('Rate limit exceeded. Please try again later.', 'error');
          throw error;
        }
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  notifyUser(message, type) {
    // Dispatch custom event for UI to catch
    window.dispatchEvent(new CustomEvent('rateLimitNotification', {
      detail: { message, type }
    }));
  }

  // Throttle requests to prevent hitting rate limits
  throttle(func, limit = 1000) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export const rateLimitHandler = new RateLimitHandler();