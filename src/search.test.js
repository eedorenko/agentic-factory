const { describe, it } = require('node:test');
const assert = require('node:assert');
const { searchItems, paginate, formatSearchResults } = require('./search');

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
    assert.strictEqual(result.totalPages, 3);
  });

  it('should not add a page for an exact multiple of the page size', () => {
    const result = paginate(testItems.slice(0, 20), 1, 10);
    assert.strictEqual(result.totalPages, 2);
  });

  it('should return zero total pages for empty items', () => {
    const result = paginate([], 1, 10);
    assert.strictEqual(result.totalPages, 0);
  });

  it('should return items for the last page', () => {
    const { totalPages } = paginate(testItems, 1, 10);
    const result = paginate(testItems, totalPages, 10);
    assert.deepStrictEqual(result.items, testItems.slice(20));
  });
});

describe('formatSearchResults', () => {
  it('should include summary', () => {
    const results = paginate(testItems, 1, 10);
    const formatted = formatSearchResults(results);
    assert.ok(formatted.summary.includes('page 1'));
  });
});
