import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
const labels = {
  en: { generate: 'Generate chart', edit: 'Edit birth information', annual: 'Annual transformations', decade: 'Ten-year period (Da Xian)', clear: 'Clear birth information', invalid: 'Enter a real date between 1900 and 2050.' },
  es: { generate: 'Generar carta', edit: 'Editar datos de nacimiento', annual: 'Transformaciones anuales', decade: 'Período de diez años (Da Xian)', clear: 'Borrar datos de nacimiento', invalid: 'Introduce una fecha real entre 1900 y 2050.' },
  ja: { generate: '命盤を作成', edit: '出生情報を編集', annual: '流年四化', decade: '大限（10年運）', clear: '出生情報を消去', invalid: '1900〜2050年の実在する日付を入力してください。' },
  zh: { generate: '生成命盘', edit: '修改出生信息', annual: '流年四化', decade: '大限', clear: '清除出生信息', invalid: '请输入1900至2050年之间真实存在的日期。' },
};
let signatures = [];
try {
  for (const [locale, text] of Object.entries(labels)) {
    const response = await page.goto(`${base}/${locale}`);
    assert.equal(response.status(), 200);
    await page.waitForFunction(lang => document.documentElement.lang === lang, locale === 'zh' ? 'zh-CN' : locale);
    assert.ok((await page.title()).length > 5);
    await page.getByRole('button', { name: text.generate }).click();
    assert.equal(await page.locator('form').getByRole('alert').innerText(), text.invalid);
    await page.locator('[name=name]').fill('Demo');
    await page.locator('[name=date]').fill('1994-06-15');
    await page.locator('[name=time]').fill('08:30');
    await page.getByRole('button', { name: text.generate }).click();
    await page.locator('[data-palace]').first().waitFor();
    assert.equal(await page.locator('[data-palace]').count(), 12);
    assert.equal(await page.locator('[data-transform=overlay]').count(), 0);
    signatures.push(await page.locator('[data-palace]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-palace')).join(',')));
    await page.getByRole('button', { name: text.annual, exact: true }).click();
    await page.locator('select').selectOption('2026');
    await page.waitForFunction(() => document.querySelectorAll('[data-transform=overlay]').length > 0);
    const first = await page.locator('[data-transform=overlay]').allTextContents();
    await page.locator('select').selectOption('2027');
    await page.waitForTimeout(100);
    assert.notDeepEqual(await page.locator('[data-transform=overlay]').allTextContents(), first);
    await page.getByRole('button', { name: text.decade, exact: true }).click();
    await page.locator('select').selectOption('0');
    assert.ok(await page.locator('[data-transform=overlay]').count() > 0);
    await page.locator('[data-palace="5"]').click();
    assert.equal(await page.locator('[data-palace="5"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/${locale}-desktop.png`, fullPage: true });
    await page.getByRole('button', { name: text.edit, exact: true }).click();
    assert.equal(await page.locator('[name=date]').inputValue(), '1994-06-15');
    // A normal locale link must preserve unsent input across route segments.
    await page.getByRole('link', { name: 'Español', exact: true }).click();
    await page.waitForURL('**/es');
    assert.equal(await page.locator('[name=name]').inputValue(), 'Demo');
    assert.equal(await page.locator('[name=date]').inputValue(), '1994-06-15');
    assert.equal(new URL(page.url()).search, '');
    assert.equal(await page.evaluate(() => localStorage.getItem('ziwei-birth')), null);
    await page.reload();
    assert.equal(await page.locator('[name=date]').inputValue(), '', 'reload must clear in-memory birth data');
  }
  assert.equal(new Set(signatures).size, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ['en', 'es', 'ja']) {
    await page.goto(`${base}/${locale}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator('[name=date]').fill('1994-06-15');
    await page.locator('[name=mode]').selectOption('branch');
    await page.locator('[name=branch]').selectOption('4');
    await page.getByRole('button', { name: labels[locale].generate }).click();
    await page.locator('[data-palace]').first().waitFor();
    assert.equal(await page.locator('[data-palace]').count(), 12);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const themeButton = page.locator('header button');
    await themeButton.click();
    assert.ok(['dark', 'light'].includes(await page.locator('html').getAttribute('data-theme')));
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/${locale}-mobile.png`, fullPage: true });
    await page.getByRole('button', { name: labels[locale].clear, exact: true }).click();
    assert.equal(await page.locator('[name=date]').inputValue(), '');
  }
  assert.equal((await page.goto(`${base}/fr`)).status(), 404);
  const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text();
  for (const locale of Object.keys(labels)) assert.ok(sitemap.includes(`/${locale}</loc>`));
  // Saved light theme used to hydrate with a different first-render icon.
  for (const theme of ['light', 'dark']) {
    await page.evaluate(t => localStorage.setItem('ziwei-theme', t), theme);
    await page.goto(`${base}/en`);
    await page.waitForTimeout(200);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
  }
  for (const path of ['/', '/chart', '/heming', '/library', '/knowledge']) assert.equal((await page.request.get(`${base}${path}`)).status(), 200);
  assert.deepEqual(errors, []);
  console.log('PASS: 4 locales; translated errors; 12-palace rendering; annual/decade overlays; locale input preservation; refresh privacy; 390px mobile layouts; themes; clearing; 404; sitemap; no browser runtime errors');
} finally { await browser.close(); }
