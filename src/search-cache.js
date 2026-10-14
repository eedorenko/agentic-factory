/**
 * In-memory cache with TTL expiration and LRU eviction.
 * Stored and returned arrays are copied so callers cannot mutate cached state.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_SIZE = 100;

class SearchCache {
  constructor({ ttlMs = DEFAULT_TTL_MS, maxSize = DEFAULT_MAX_SIZE, now = Date.now } = {}) {
    if (maxSize < 1) throw new RangeError('maxSize must be at least 1');
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.now = now;
    this.entries = new Map(); // insertion order == LRU order (oldest first)
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  static normalizeKey(query) {
    return String(query).trim().toLowerCase();
  }

  get(query) {
    const key = SearchCache.normalizeKey(query);
    const entry = this.entries.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (this.now() >= entry.expiresAt) {
      this.entries.delete(key);
      this.misses++;
      return undefined;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    this.hits++;
    return entry.results.slice();
  }

  set(query, results) {
    const key = SearchCache.normalizeKey(query);
    this.entries.delete(key);
    this.entries.set(key, { results: results.slice(), expiresAt: this.now() + this.ttlMs });
    while (this.entries.size > this.maxSize) {
      this.entries.delete(this.entries.keys().next().value);
      this.evictions++;
    }
  }

  // Removes entries for which predicate(key, results) is true; with no predicate, clears all.
  invalidate(predicate) {
    if (!predicate) {
      const count = this.entries.size;
      this.entries.clear();
      return count;
    }
    let count = 0;
    for (const [key, entry] of this.entries) {
      if (predicate(key, entry.results)) {
        this.entries.delete(key);
        count++;
      }
    }
    return count;
  }

  stats() {
    return {
      size: this.entries.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
    };
  }
}

module.exports = { SearchCache, DEFAULT_TTL_MS, DEFAULT_MAX_SIZE };
