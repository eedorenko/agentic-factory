/**
 * Plugin system for custom search filters.
 * Plugins are pipeline filters: (query, items) => items.
 * Plugins only receive query and items (no cache access).
 */
const fs = require('fs');
const path = require('path');

function createPluginManager({ logger = console } = {}) {
  const plugins = new Map();
  const hooks = { beforeFilter: [], afterFilter: [] };

  function register(name, filterFn) {
    if (typeof name !== 'string' || !name) throw new TypeError('Plugin name must be a non-empty string');
    if (typeof filterFn !== 'function') throw new TypeError('Plugin filter must be a function');
    if (plugins.has(name)) throw new Error(`Plugin already registered: ${name}`);
    plugins.set(name, filterFn);
  }

  function unregister(name) {
    return plugins.delete(name);
  }

  function addHook(event, fn) {
    if (!hooks[event]) throw new Error(`Unknown hook: ${event}`);
    if (typeof fn !== 'function') throw new TypeError('Hook must be a function');
    hooks[event].push(fn);
  }

  function runHooks(event, query, items) {
    let current = items;
    for (const fn of hooks[event]) {
      try {
        const result = fn(query, current);
        if (Array.isArray(result)) current = result;
      } catch (err) {
        logger.error(`Hook ${event} failed: ${err.message}`);
      }
    }
    return current;
  }

  function apply(query, items) {
    let current = runHooks('beforeFilter', query, items);
    for (const [name, fn] of plugins) {
      try {
        const result = fn(query, current);
        if (!Array.isArray(result)) throw new TypeError('Plugin must return an array');
        current = result;
      } catch (err) {
        logger.error(`Plugin "${name}" failed: ${err.message}`);
      }
    }
    return runHooks('afterFilter', query, current);
  }

  function loadFromDirectory(dir) {
    const loaded = [];
    if (!fs.existsSync(dir)) return loaded;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
    for (const file of files) {
      const name = path.basename(file, '.js');
      try {
        const mod = require(path.resolve(dir, file));
        const fn = typeof mod === 'function' ? mod : mod && mod.filter;
        register(name, fn);
        loaded.push(name);
      } catch (err) {
        logger.error(`Failed to load plugin "${name}": ${err.message}`);
      }
    }
    return loaded;
  }

  return {
    register,
    unregister,
    addHook,
    apply,
    loadFromDirectory,
    list: () => [...plugins.keys()],
  };
}

const exactMatch = (query, items) => {
  const q = String(query).toLowerCase();
  return items.filter(i => i.title.toLowerCase() === q);
};

// Subsequence match: all query characters appear in order in the title.
const fuzzyMatch = (query, items) => {
  const q = String(query).toLowerCase();
  return items.filter(i => {
    const t = i.title.toLowerCase();
    let pos = 0;
    for (const ch of q) {
      pos = t.indexOf(ch, pos);
      if (pos === -1) return false;
      pos++;
    }
    return true;
  });
};

// query may be { from, to } (Date or parsable); items use `date`.
const dateRange = (query, items) => {
  const from = query && query.from ? new Date(query.from) : null;
  const to = query && query.to ? new Date(query.to) : null;
  return items.filter(i => {
    const d = new Date(i.date);
    if (isNaN(d)) return false;
    return (!from || d >= from) && (!to || d <= to);
  });
};

const builtins = { exactMatch, fuzzyMatch, dateRange };

module.exports = { createPluginManager, builtins };
