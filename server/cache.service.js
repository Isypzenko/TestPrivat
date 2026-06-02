class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 10) {
    const existTime = Date.now() + ttl * 60 * 1000;
    this.cache.set(key, { value, existTime });
  }

  get(key) {
    const cachedItem = this.cache.get(key);
    if (!cachedItem) return null;
    if (Date.now() > cachedItem.existTime) {
      this.cache.delete(key);
      return null;
    }
  }

  delete(key) {
    this.cache.delete(key);
  }
}
const bannersCached = new Cache();
module.exports = bannersCached;
