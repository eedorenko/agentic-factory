const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SearchCache } = require('./search-cache');
const { createCachedSearch } = require('./search');

describe('SearchCache', () => {
  it('returns a hit for a normalized key', () => {
    const cache = new SearchCache();
    cache.set('  Foo ', [1]);
    assert.deepStrictEqual(cache.get('foo'), [1]);
    assert.strictEqual(cache.stats().hits, 1);
  });

  it('returns undefined on miss', () => {
    const cache = new SearchCache();
    assert.strictEqual(cache.get('nope'), undefined);
    assert.strictEqual(cache.stats().misses, 1);
  });

  it('expires entries after TTL', () => {
    let t = 0;
    const cache = new SearchCache({ ttlMs: 1000, now: () => t });
    cache.set('a', [1]);
    t = 999;
    assert.ok(cache.get('a'));
    t = 1000;
    assert.strictEqual(cache.get('a'), undefined);
  });

  it('defaults TTL to 5 minutes', () => {
    assert.strictEqual(new SearchCache().ttlMs, 300000);
  });

  it('evicts least recently used entry', () => {
    const cache = new SearchCache({ maxSize: 2 });
    cache.set('a', [1]);
    cache.set('b', [2]);
    cache.get('a');
    cache.set('c', [3]);
    assert.strictEqual(cache.get('b'), undefined);
    assert.ok(cache.get('a'));
    assert.ok(cache.get('c'));
    assert.strictEqual(cache.stats().evictions, 1);
  });

  it('invalidates by predicate or entirely', () => {
    const cache = new SearchCache();
    cache.set('a', [1]);
    cache.set('b', [2]);
    assert.strictEqual(cache.invalidate(key => key === 'a'), 1);
    assert.strictEqual(cache.get('a'), undefined);
    assert.strictEqual(cache.invalidate(), 1);
    assert.strictEqual(cache.stats().size, 0);
  });

  it('is safe against mutation of stored and returned arrays', () => {
    const cache = new SearchCache();
    const input = [1, 2];
    cache.set('a', input);
    input.push(3);
    const out = cache.get('a');
    out.push(4);
    assert.deepStrictEqual(cache.get('a'), [1, 2]);
  });
});

describe('createCachedSearch', () => {
  const a = { title: 'Apple', description: 'fruit' };
  const b = { title: 'Banana', description: 'yellow fruit' };

  it('caches repeated queries', () => {
    const s = createCachedSearch([a, b]);
    assert.deepStrictEqual(s.search('apple'), [a]);
    assert.deepStrictEqual(s.search(' APPLE'), [a]);
    assert.deepStrictEqual([s.stats().hits, s.stats().misses], [1, 1]);
  });

  it('invalidates matching entries when an item is added', () => {
    const s = createCachedSearch([a]);
    s.search('apple');
    s.search('fruit');
    const c = { title: 'Apple pie', description: 'dessert' };
    s.addItem(c);
    assert.deepStrictEqual(s.search('apple'), [a, c]);
    assert.strictEqual(s.stats().size, 2);
  });

  it('invalidates entries containing a removed item', () => {
    const s = createCachedSearch([a, b]);
    s.search('fruit');
    s.search('apple');
    assert.strictEqual(s.removeItem(b), true);
    assert.deepStrictEqual(s.search('fruit'), [a]);
    assert.strictEqual(s.removeItem(b), false);
  });
});
