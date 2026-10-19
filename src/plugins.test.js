const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createPluginManager, builtins } = require('./plugins');

const silent = { error() {} };
const items = [
  { title: 'Apple', date: '2024-01-10' },
  { title: 'Banana', date: '2024-02-10' },
  { title: 'Apricot', date: '2024-03-10' },
];

test('register and unregister', () => {
  const pm = createPluginManager({ logger: silent });
  pm.register('a', (q, i) => i);
  assert.deepStrictEqual(pm.list(), ['a']);
  assert.throws(() => pm.register('a', (q, i) => i));
  assert.throws(() => pm.register('b', 'nope'));
  assert.strictEqual(pm.unregister('a'), true);
  assert.strictEqual(pm.unregister('a'), false);
  assert.deepStrictEqual(pm.list(), []);
});

test('plugins run in registration order and chain', () => {
  const pm = createPluginManager({ logger: silent });
  const order = [];
  pm.register('first', (q, i) => { order.push('first'); return i.filter(x => x.title.startsWith('A')); });
  pm.register('second', (q, i) => { order.push('second'); return i.filter(x => x.title.length > 5); });
  assert.deepStrictEqual(pm.apply('x', items).map(i => i.title), ['Apricot']);
  assert.deepStrictEqual(order, ['first', 'second']);
});

test('failing plugin is logged and skipped', () => {
  const logs = [];
  const pm = createPluginManager({ logger: { error: m => logs.push(m) } });
  pm.register('bad', () => { throw new Error('boom'); });
  pm.register('notarray', () => 5);
  pm.register('good', (q, i) => i.slice(0, 1));
  assert.strictEqual(pm.apply('x', items).length, 1);
  assert.strictEqual(logs.length, 2);
  assert.match(logs[0], /bad/);
});

test('lifecycle hooks run before and after', () => {
  const pm = createPluginManager({ logger: silent });
  pm.addHook('beforeFilter', (q, i) => i.slice(1));
  pm.addHook('afterFilter', (q, i) => i.slice(0, 1));
  pm.register('id', (q, i) => i);
  assert.deepStrictEqual(pm.apply('x', items).map(i => i.title), ['Banana']);
  assert.throws(() => pm.addHook('nope', () => {}));
});

test('failing hook does not break pipeline', () => {
  const pm = createPluginManager({ logger: silent });
  pm.addHook('beforeFilter', () => { throw new Error('x'); });
  assert.strictEqual(pm.apply('x', items).length, 3);
});

test('built-in plugins', () => {
  assert.deepStrictEqual(builtins.exactMatch('apple', items).map(i => i.title), ['Apple']);
  assert.deepStrictEqual(builtins.fuzzyMatch('apt', items).map(i => i.title), ['Apricot']);
  assert.deepStrictEqual(builtins.fuzzyMatch('ape', items).map(i => i.title), ['Apple']);
  const r = builtins.dateRange({ from: '2024-02-01', to: '2024-02-28' }, items);
  assert.deepStrictEqual(r.map(i => i.title), ['Banana']);
  assert.strictEqual(builtins.dateRange({}, items).length, 3);
});

test('discovery loads plugins from directory', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugins-'));
  fs.writeFileSync(path.join(dir, 'a.js'), 'module.exports = (q, i) => i.slice(0, 2);');
  fs.writeFileSync(path.join(dir, 'b.js'), 'module.exports = { filter: (q, i) => i.slice(0, 1) };');
  fs.writeFileSync(path.join(dir, 'broken.js'), 'throw new Error("bad load");');
  fs.writeFileSync(path.join(dir, 'invalid.js'), 'module.exports = 1;');
  const pm = createPluginManager({ logger: silent });
  assert.deepStrictEqual(pm.loadFromDirectory(dir), ['a', 'b']);
  assert.strictEqual(pm.apply('x', items).length, 1);
  assert.deepStrictEqual(pm.loadFromDirectory(path.join(dir, 'missing')), []);
  fs.rmSync(dir, { recursive: true });
});
