/**
 * Bounded in-memory search cache with lazy TTL expiration and LRU eviction.
 */
class SearchCache {
  #entries = new Map();
  #hits = 0;
  #misses = 0;
  #evictions = 0;
  #expirations = 0;
  #ttlMs;
  #maxSize;
  #now;

  constructor({ ttlMs = 300000, maxSize = 100, now = Date.now } = {}) {
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      throw new RangeError('ttlMs must be a positive finite number');
    }
    if (!Number.isSafeInteger(maxSize) || maxSize <= 0) {
      throw new RangeError('maxSize must be a positive safe integer');
    }
    if (typeof now !== 'function') {
      throw new TypeError('now must be a function');
    }
    this.#ttlMs = ttlMs;
    this.#maxSize = maxSize;
    this.#now = now;
  }

  get(key) {
    const entry = this.#entries.get(key);
    if (!entry) {
      this.#misses++;
      return undefined;
    }
    this.#entries.delete(key);
    if (this.#now() >= entry.expiresAt) {
      this.#misses++;
      this.#expirations++;
      return undefined;
    }
    this.#entries.set(key, entry);
    this.#hits++;
    return entry.value;
  }

  set(key, value) {
    this.#entries.delete(key);
    this.#entries.set(key, { value, expiresAt: this.#now() + this.#ttlMs });
    if (this.#entries.size > this.#maxSize) {
      this.#entries.delete(this.#entries.keys().next().value);
      this.#evictions++;
    }
  }

  invalidate(predicate) {
    if (!predicate) {
      this.clear();
      return;
    }
    for (const [key, entry] of this.#entries) {
      if (predicate(key, entry.value)) this.#entries.delete(key);
    }
  }

  clear() {
    this.#entries.clear();
  }

  stats() {
    const requests = this.#hits + this.#misses;
    return {
      hits: this.#hits,
      misses: this.#misses,
      evictions: this.#evictions,
      expirations: this.#expirations,
      size: this.#entries.size,
      hitRate: requests ? this.#hits / requests : 0,
    };
  }
}

module.exports = { SearchCache };
