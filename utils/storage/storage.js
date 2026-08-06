/**
 * ==========================================================================
 * File: /utils/storage/storage.js
 * Description: Safe LocalStorage Abstraction Wrapper with Caching & Quota Checking
 * Compatibility: preserves key names, isAvailable_(), and public APIs (set, get, remove, clear)
 * ==========================================================================
 */

const StorageHelper = {
  // Cache availability internally to avoid repetitive test write penalties
  isSupported_: null,

  /**
   * Safe check to verify if LocalStorage is writable and accessible.
   * @private
   */
  isAvailable_() {
    if (this.isSupported_ !== null) {
      return this.isSupported_;
    }
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      this.isSupported_ = true;
    } catch (e) {
      this.isSupported_ = false;
    }
    return this.isSupported_;
  },

  /**
   * Set JSON serializable item to LocalStorage.
   * @param {string} key 
   * @param {*} value 
   */
  set(key, value) {
    if (!this.isAvailable_()) return false;
    try {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
      return true;
    } catch (error) {
      console.error(`StorageHelper.set failed for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Get parsed item from LocalStorage.
   * @param {string} key 
   * @param {*} fallback fallback value if key does not exist or storage is offline
   */
  get(key, fallback = null) {
    if (!this.isAvailable_()) return fallback;
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return JSON.parse(value);
    } catch (error) {
      console.error(`StorageHelper.get failed for key "${key}":`, error);
      return fallback;
    }
  },

  /**
   * Remove item from LocalStorage.
   * @param {string} key 
   */
  remove(key) {
    if (!this.isAvailable_()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`StorageHelper.remove failed for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all store-associated items.
   */
  clear() {
    if (!this.isAvailable_()) return false;
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('StorageHelper.clear failed:', error);
      return false;
    }
  }
};