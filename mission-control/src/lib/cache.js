// Simple TTL cache
class Cache {
  constructor(ttlMs = 30000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key) {
    if (key) this.store.delete(key);
    else this.store.clear();
  }
}

module.exports = Cache;
