const { describe, it } = require('node:test');
const assert = require('node:assert');
const { searchItems, paginate, formatSearchResults, highlightResults } = require('./search');

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

describe('highlightResults', () => {
  const items = [{ title: 'Apple pie', description: 'An apple a day' }];

  it('highlights a single match in title and description', () => {
    const [r] = highlightResults(items, 'pie');
    assert.strictEqual(r.title, 'Apple <mark>pie</mark>');
    assert.strictEqual(r.description, 'An apple a day');
  });

  it('highlights multiple matches case-insensitively', () => {
    const [r] = highlightResults(items, 'APPLE');
    assert.strictEqual(r.title, '<mark>Apple</mark> pie');
    assert.strictEqual(r.description, 'An <mark>apple</mark> a day');
    const [m] = highlightResults([{ title: 'aa Aa', description: '' }], 'aa');
    assert.strictEqual(m.title, '<mark>aa</mark> <mark>Aa</mark>');
  });

  it('returns unchanged copies for no match and empty query', () => {
    assert.deepStrictEqual(highlightResults(items, 'zzz'), items);
    const out = highlightResults(items, '');
    assert.deepStrictEqual(out, items);
    assert.notStrictEqual(out[0], items[0]);
  });

  it('escapes regex special characters', () => {
    const [r] = highlightResults([{ title: 'a.b (c)', description: 'axb' }], '.');
    assert.strictEqual(r.title, 'a<mark>.</mark>b (c)');
    assert.strictEqual(r.description, 'axb');
  });

  it('does not alter tags or entities', () => {
    const [r] = highlightResults([{ title: '<b class="amp">x</b> &amp; amp', description: '' }], 'amp');
    assert.strictEqual(r.title, '<b class="amp">x</b> &amp; <mark>amp</mark>');
  });

  it('supports a custom wrapper and does not mutate input', () => {
    const [r] = highlightResults(items, 'pie', { wrapper: ['<em>', '</em>'] });
    assert.strictEqual(r.title, 'Apple <em>pie</em>');
    assert.strictEqual(items[0].title, 'Apple pie');
  });
});
