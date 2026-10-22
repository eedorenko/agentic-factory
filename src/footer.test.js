const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getFooterContent, renderFooter } = require('./footer');

describe('getFooterContent', () => {
  it('should include site name in copyright', () => {
    const content = getFooterContent('TestSite');
    assert.ok(content.copyright.includes('TestSite'));
  });

  it('should show current year', () => {
    const content = getFooterContent('TestSite');
    const currentYear = new Date().getFullYear();
    // This test currently FAILS because year is hardcoded to 2024
    assert.ok(content.copyright.includes(String(currentYear)));
  });

  it('should include standard links', () => {
    const content = getFooterContent('TestSite');
    assert.strictEqual(content.links.length, 3);
  });
});

describe('item count', () => {
  it('includes item count when provided', () => {
    assert.strictEqual(getFooterContent('TestSite', 42).searchInfo, 'Searching 42 items');
    assert.ok(renderFooter('TestSite', 0).includes('Searching 0 items'));
    assert.ok(renderFooter('TestSite', 42).includes('Searching 42 items'));
  });

  it('works without item count (backward compatible)', () => {
    assert.strictEqual(getFooterContent('TestSite').searchInfo, undefined);
    assert.ok(!renderFooter('TestSite').includes('Searching'));
  });
});

describe('renderFooter', () => {
  it('should render HTML footer', () => {
    const html = renderFooter('TestSite');
    assert.ok(html.includes('<footer>'));
    assert.ok(html.includes('</footer>'));
  });

  it('should include copyright text', () => {
    const html = renderFooter('TestSite');
    assert.ok(html.includes('Copyright'));
  });
});
