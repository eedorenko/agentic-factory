const { describe, it } = require('node:test');
const assert = require('node:assert');
const { searchItems, paginate, formatSearchResults, exportToCSV } = require('./search');

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

describe('exportToCSV', () => {
  it('should export normal results', () => {
    const csv = exportToCSV({ items: [{ title: 'A', description: 'B' }, { title: 'C', description: 'D' }] });
    assert.strictEqual(csv, 'title,description\nA,B\nC,D');
  });

  it('should return only header for empty results', () => {
    assert.strictEqual(exportToCSV({ items: [] }), 'title,description');
  });

  it('should escape commas and quotes', () => {
    const csv = exportToCSV({ items: [{ title: 'a, b', description: 'say "hi"' }] });
    assert.strictEqual(csv, 'title,description\n"a, b","say ""hi"""');
  });

  it('should quote values with newlines', () => {
    const csv = exportToCSV({ items: [{ title: 'x\ny', description: 'z' }] });
    assert.strictEqual(csv, 'title,description\n"x\ny",z');
  });
});
