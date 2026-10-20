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

  it('should include item count when provided', () => {
    const content = getFooterContent('TestSite', 7);
    assert.strictEqual(content.searchCount, 'Searching 7 items');
  });

  it('should omit item count when not provided', () => {
    const content = getFooterContent('TestSite');
    assert.strictEqual(content.searchCount, undefined);
  });

  it('should include standard links', () => {
    const content = getFooterContent('TestSite');
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
});

describe('renderFooter item count', () => {
  it('should render count only when provided', () => {
    assert.ok(renderFooter('X', 7).includes('<p>Searching 7 items</p>'));
    assert.ok(!renderFooter('X').includes('Searching'));
  });
});
