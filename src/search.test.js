const { describe, it } = require('node:test');
const assert = require('node:assert');
const { scoreItem, searchItems, paginate, formatSearchResults } = require('./search');

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

describe('relevance scoring', () => {
  const items = [
    { title: 'Other', description: 'about apple pie' },
    { title: 'Green apple tart', description: 'dessert' },
    { title: 'Apple', description: 'fruit' },
    { title: 'Apple pie', description: 'apple filling' },
  ];

  it('scores exact title, partial title and description matches', () => {
    assert.strictEqual(scoreItem(items[2], 'apple'), 100);
    assert.strictEqual(scoreItem(items[1], 'apple'), 50);
    assert.strictEqual(scoreItem(items[0], 'apple'), 10);
    assert.strictEqual(scoreItem(items[3], 'apple'), 60);
    assert.strictEqual(scoreItem(items[0], 'zzz'), 0);
  });

  it('sorts by score descending and includes score', () => {
    const results = searchItems(items, 'apple');
    assert.deepStrictEqual(results.map(r => r.score), [100, 60, 50, 10]);
    assert.strictEqual(results[0].title, 'Apple');
  });

  it('keeps original order for ties and excludes non-matches', () => {
    const r = searchItems([{ title: 'b x', description: '' }, { title: 'a x', description: '' }, { title: 'q', description: '' }], 'x');
    assert.deepStrictEqual(r.map(i => i.title), ['b x', 'a x']);
  });
});
