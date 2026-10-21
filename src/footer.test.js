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

describe('getFooterContent item count', () => {
  it('should include item count when provided', () => {
    const content = getFooterContent('TestSite', 42);
    assert.strictEqual(content.searchInfo, 'Searching 42 items');
  });

  it('should include zero count', () => {
    assert.strictEqual(getFooterContent('TestSite', 0).searchInfo, 'Searching 0 items');
  });

  it('should omit search info for non-numeric count', () => {
    assert.strictEqual(getFooterContent('TestSite', '<b>x</b>').searchInfo, undefined);
  });

  it('should omit search info when count not provided', () => {
    const content = getFooterContent('TestSite');
    assert.strictEqual(content.searchInfo, undefined);
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
