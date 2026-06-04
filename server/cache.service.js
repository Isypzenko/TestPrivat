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

    return cachedItem.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clearBannersCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('banners_page_')) {
        this.cache.delete(key);
      }
    }
    console.log('🧹 [CACHE CLEAR] Весь кеш баннерів успішно скинуто');
  }
}

const bannersCached = new Cache();
module.exports = bannersCached;
