/**
 * Smart Caching Service for Konoz Yemen
 * Supports TTL (Time To Live) to ensure data freshness
 */

const CACHE_PREFIX = "knz_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 Minutes in milliseconds

const cacheService = {
  /**
   * Save data to cache
   * @param {string} key 
   * @param {any} data 
   * @param {number} ttl - ms
   */
  set: (key, data, ttl = DEFAULT_TTL) => {
    const item = {
      data,
      expiry: Date.now() + ttl,
    };
    try {
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.warn("Cache write failed (likely quota exceeded)", e);
    }
  },

  /**
   * Get data from cache
   * @param {string} key 
   * @returns {any|null}
   */
  get: (key) => {
    const itemStr = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        sessionStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return item.data;
    } catch (e) {
      return null;
    }
  },

  /**
   * Clear specific cache or all knz cache
   * @param {string} [key] 
   */
  clear: (key) => {
    if (key) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
    } else {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      });
    }
  },
};

export default cacheService;
