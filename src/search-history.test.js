const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SearchHistory } = require('./search-history');

describe('SearchHistory', () => {
  it('stores query, timestamp and result count', () => {
    const h = new SearchHistory();
    h.add('foo', 3);
    const [entry] = h.getHistory();
    assert.strictEqual(entry.query, 'foo');
    assert.strictEqual(entry.resultCount, 3);
    assert.strictEqual(typeof entry.timestamp, 'number');
  });

  it('returns history newest first', () => {
    const h = new SearchHistory();
    h.add('a', 1);
    h.add('b', 2);
    h.add('c', 3);
    assert.deepStrictEqual(h.getHistory().map((e) => e.query), ['c', 'b', 'a']);
  });

  it('keeps at most 10 entries, removing the oldest', () => {
    const h = new SearchHistory();
    for (let i = 0; i < 12; i++) h.add(`q${i}`, i);
    const queries = h.getHistory().map((e) => e.query);
    assert.strictEqual(queries.length, 10);
    assert.strictEqual(queries[0], 'q11');
    assert.strictEqual(queries[9], 'q2');
  });

  it('updates duplicate queries and moves them to most recent', () => {
    const h = new SearchHistory();
    h.add('a', 1);
    h.add('b', 2);
    const before = h.getHistory()[1].timestamp;
    h.add('a', 5);
    const history = h.getHistory();
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].query, 'a');
    assert.strictEqual(history[0].resultCount, 5);
    assert.ok(history[0].timestamp >= before);
  });

  it('duplicate at full capacity does not evict anything', () => {
    const h = new SearchHistory();
    for (let i = 0; i < 10; i++) h.add(`q${i}`, i);
    h.add('q0', 99);
    const queries = h.getHistory().map((e) => e.query);
    assert.strictEqual(queries.length, 10);
    assert.strictEqual(queries[0], 'q0');
    assert.ok(queries.includes('q1'));
  });

  it('getHistory returns copies', () => {
    const h = new SearchHistory();
    h.add('a', 1);
    h.getHistory()[0].query = 'x';
    assert.strictEqual(h.getHistory()[0].query, 'a');
  });

  it('clear empties the history', () => {
    const h = new SearchHistory();
    h.add('a', 1);
    h.clear();
    assert.deepStrictEqual(h.getHistory(), []);
  });
});
