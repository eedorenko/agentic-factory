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

  it('should include item count when provided', () => {
    const content = getFooterContent('TestSite', 42);
    assert.strictEqual(content.searchInfo, 'Searching 42 items');
  });

  it('should omit item count when not provided (backward compat)', () => {
    const content = getFooterContent('TestSite');
    assert.strictEqual(content.searchInfo, undefined);
    assert.strictEqual(content.links.length, 3);
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

  it('should render item count when provided', () => {
    assert.ok(renderFooter('TestSite', 7).includes('Searching 7 items'));
    assert.ok(!renderFooter('TestSite').includes('Searching'));
  });
});
