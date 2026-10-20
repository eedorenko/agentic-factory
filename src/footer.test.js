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

describe('footer item count', () => {
  it('should include item count when provided', () => {
    assert.strictEqual(getFooterContent('S', 5).itemCountText, 'Searching 5 items');
    assert.ok(renderFooter('S', 5).includes('Searching 5 items'));
  });

  it('should include zero count', () => {
    assert.ok(renderFooter('S', 0).includes('Searching 0 items'));
  });

  it('should be unchanged without item count', () => {
    assert.strictEqual(getFooterContent('S').itemCountText, undefined);
    assert.ok(!renderFooter('S').includes('Searching'));
  });
});
