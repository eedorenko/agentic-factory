const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SearchCache } = require('./search-cache');

describe('SearchCache', () => {
  it('tracks hits, misses and hit rate', () => {
    const cache = new SearchCache();
    assert.deepStrictEqual(cache.stats(), {
      hits: 0, misses: 0, evictions: 0, expirations: 0, size: 0, hitRate: 0,
    });
    assert.strictEqual(cache.get('missing'), undefined);
    cache.set('query', []);
    assert.deepStrictEqual(cache.get('query'), []);
    assert.strictEqual(cache.get('other'), undefined);
    assert.deepStrictEqual(cache.stats(), {
      hits: 1, misses: 2, evictions: 0, expirations: 0, size: 1, hitRate: 1 / 3,
    });
  });

  it('expires at the default five-minute TTL without extending it on hits', () => {
    let time = 0;
    const cache = new SearchCache({ now: () => time });
    cache.set('query', 'result');
    time = 299999;
    assert.strictEqual(cache.get('query'), 'result');
    time = 300000;
    assert.strictEqual(cache.get('query'), undefined);
    assert.strictEqual(cache.get('query'), undefined);
    assert.deepStrictEqual(cache.stats(), {
      hits: 1, misses: 2, evictions: 0, expirations: 1, size: 0, hitRate: 1 / 3,
    });
  });

  it('refreshes TTL and recency when replacing an entry', () => {
    let time = 0;
    const cache = new SearchCache({ ttlMs: 10, maxSize: 2, now: () => time });
    cache.set('a', 1);
    cache.set('b', 2);
    time = 5;
    cache.set('a', 3);
    assert.strictEqual(cache.stats().evictions, 0);
    cache.set('c', 4);
    assert.strictEqual(cache.get('b'), undefined);
    time = 10;
    assert.strictEqual(cache.get('a'), 3);
    time = 15;
    assert.strictEqual(cache.get('a'), undefined);
  });

  it('evicts the least recently used entry and stays bounded', () => {
    const cache = new SearchCache({ maxSize: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    assert.strictEqual(cache.get('a'), 1);
    cache.set('c', 3);
    assert.strictEqual(cache.get('b'), undefined);
    assert.strictEqual(cache.get('a'), 1);
    assert.strictEqual(cache.get('c'), 3);
    for (let i = 0; i < 100; i++) {
      cache.set(`query-${i}`, i);
      assert.strictEqual(cache.stats().size, 2);
    }
    assert.strictEqual(cache.stats().evictions, 101);
  });

  it('invalidates matching entries and clears without resetting counters', () => {
    const cache = new SearchCache();
    cache.set('a', [1]);
    cache.set('b', [2]);
    cache.invalidate((key, value) => key === 'a' && value.includes(1));
    assert.strictEqual(cache.get('a'), undefined);
    assert.deepStrictEqual(cache.get('b'), [2]);
    cache.clear();
    assert.strictEqual(cache.stats().size, 0);
    assert.strictEqual(cache.stats().hits, 1);
    cache.set('c', []);
    cache.invalidate();
    assert.strictEqual(cache.stats().size, 0);
  });

  it('rejects invalid configuration', () => {
    for (const ttlMs of [0, -1, NaN, Infinity, '10', null]) {
      assert.throws(() => new SearchCache({ ttlMs }), RangeError);
    }
    for (const maxSize of [0, -1, 1.5, NaN, Infinity, '10', null]) {
      assert.throws(() => new SearchCache({ maxSize }), RangeError);
    }
    assert.throws(() => new SearchCache({ now: 0 }), TypeError);
  });
});
