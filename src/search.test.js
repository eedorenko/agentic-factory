const { describe, it } = require('node:test');
const assert = require('node:assert');
const { searchItems, createCachedSearch, paginate, formatSearchResults } = require('./search');

const testItems = Array.from({ length: 25 }, (_, i) => ({
  title: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}));

describe('searchItems', () => {
  it('should find items by title', () => {
    const results = searchItems(testItems, 'Item 1');
    assert.ok(results.length > 0);
  });

  it('should return empty array for empty query', () => {
    const results = searchItems(testItems, '');
    assert.strictEqual(results.length, 0);
  });

  it('should be case insensitive', () => {
    const results = searchItems(testItems, 'item 1');
    assert.ok(results.length > 0);
  });
});

describe('createCachedSearch', () => {
  it('shares normalized keys and returns hits without re-filtering', () => {
    let reads = 0;
    const item = {
      get title() {
        reads++;
        return 'Item 1';
      },
      description: 'Example',
    };
    const store = createCachedSearch([item]);
    assert.deepStrictEqual(store.search('Item 1'), [item]);
    const readsAfterMiss = reads;
    assert.deepStrictEqual(store.search(' item 1 '), [item]);
    assert.strictEqual(reads, readsAfterMiss);
    assert.deepStrictEqual(store.search('missing'), []);
    assert.deepStrictEqual(store.search('missing'), []);
    assert.strictEqual(store.stats().hits, 2);
    assert.strictEqual(store.stats().misses, 2);
  });

  it('bypasses caching and metrics for empty or falsy queries', () => {
    const store = createCachedSearch(testItems);
    for (const query of ['', '   ', null, undefined, false, 0]) {
      assert.deepStrictEqual(store.search(query), []);
    }
    assert.strictEqual(store.stats().size, 0);
    assert.strictEqual(store.stats().misses, 0);
    assert.strictEqual(store.stats().hits, 0);
  });

  it('re-filters after the configured TTL', () => {
    let time = 0;
    const store = createCachedSearch(testItems, { ttlMs: 10, now: () => time });
    const first = store.search('item 1');
    time = 9;
    assert.deepStrictEqual(store.search('item 1'), first);
    time = 10;
    assert.deepStrictEqual(store.search('item 1'), first);
    assert.strictEqual(store.stats().hits, 1);
    assert.strictEqual(store.stats().misses, 2);
    assert.strictEqual(store.stats().expirations, 1);
  });

  it('invalidates only matching queries on add, including cached empty results', () => {
    const store = createCachedSearch([]);
    store.search('apple');
    store.search('fruit');
    store.search('pear');
    const item = { title: 'APPLE', description: 'A FRUIT' };
    store.addItem(item);
    assert.strictEqual(store.stats().size, 1);
    assert.deepStrictEqual(store.search('apple'), [item]);
    assert.deepStrictEqual(store.search('fruit'), [item]);
    assert.deepStrictEqual(store.search('pear'), []);
    assert.strictEqual(store.stats().hits, 1);
    assert.strictEqual(store.stats().misses, 5);
  });

  it('invalidates removed items by reference or predicate, preserving unrelated queries', () => {
    const apple = { title: 'Apple', description: 'fruit' };
    const pear = { title: 'Pear', description: 'fruit' };
    const store = createCachedSearch([apple, pear, apple]);
    store.search('apple');
    store.search('fruit');
    store.search('pear');
    store.removeItem({ title: 'Apple', description: 'fruit' });
    assert.strictEqual(store.stats().size, 3);
    store.removeItem(apple);
    assert.strictEqual(store.stats().size, 1);
    assert.deepStrictEqual(store.search('apple'), []);
    assert.deepStrictEqual(store.search('fruit'), [pear]);
    assert.deepStrictEqual(store.search('pear'), [pear]);
    assert.strictEqual(store.stats().hits, 1);
    store.removeItem(item => item.title === 'Pear');
    assert.deepStrictEqual(store.search('fruit'), []);
    assert.deepStrictEqual(store.search('pear'), []);
  });

  it('protects the owned list and cached arrays from caller mutation', () => {
    const items = testItems.slice();
    const store = createCachedSearch(items);
    items.length = 0;
    const first = store.search('item');
    first.length = 0;
    const second = store.search('item');
    assert.strictEqual(second.length, testItems.length);
    second.push({ title: 'Other', description: '' });
    assert.deepStrictEqual(store.search('item'), testItems);
  });

  it('applies the configured LRU bound to searches', () => {
    const store = createCachedSearch(testItems, { maxSize: 2 });
    store.search('item 1');
    store.search('item 2');
    store.search('item 1');
    store.search('item 3');
    assert.strictEqual(store.stats().size, 2);
    assert.strictEqual(store.stats().evictions, 1);
    store.search('item 2');
    assert.strictEqual(store.stats().misses, 4);
  });
});

describe('paginate', () => {
  it('should return correct page of items', () => {
    const result = paginate(testItems, 1, 10);
    assert.strictEqual(result.items.length, 10);
    assert.strictEqual(result.page, 1);
  });

  it('should calculate correct total pages', () => {
    // 25 items / 10 per page = 3 pages (ceil)
    const result = paginate(testItems, 1, 10);
    // This test currently FAILS because of the Math.floor bug
    assert.strictEqual(result.totalPages, 3);
  });

  it('should return items for the last page', () => {
    const result = paginate(testItems, 3, 10);
    assert.strictEqual(result.items.length, 5);
  });
});

describe('formatSearchResults', () => {
  it('should include summary', () => {
    const results = paginate(testItems, 1, 10);
    const formatted = formatSearchResults(results);
    assert.ok(formatted.summary.includes('page 1'));
  });
});
