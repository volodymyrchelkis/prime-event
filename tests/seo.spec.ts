import { expect, test } from '@playwright/test';
import { nav } from '../src/data/site';
import { langs, localizePath, t } from '../src/i18n';

const SITE = 'https://prime-event-tau.vercel.app';

test('sitemap lists every page in every language with its translations', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/xml');
  const xml = await response.text();

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toHaveLength(nav.length * langs.length);
  for (const item of nav) {
    for (const lang of langs) {
      expect(locs).toContain(new URL(localizePath(lang, item.path), SITE).href);
    }
  }
  expect(xml.match(/<xhtml:link /g)).toHaveLength(nav.length * langs.length * langs.length);
  expect(xml).not.toContain('/api/');
});

test('robots.txt points to the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

for (const lang of langs) {
  test(`home page in ${lang} describes the business for search engines`, async ({ page }) => {
    await page.goto(localizePath(lang, '/'));
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(json ?? '{}');

    expect(data['@type']).toBe('EntertainmentBusiness');
    expect(data.name).toBe('Prime Event');
    expect(data.description).toBe(t(lang).description);
    expect(data.url).toBe(new URL(localizePath(lang, '/'), SITE).href);
    expect(data.address.addressLocality).toBe('Varna');
    expect(data.priceRange).toBe('90–190 €');
    expect(data.inLanguage).toBe(lang);
  });
}

test('only the home page carries the business card', async ({ page }) => {
  await page.goto('/services');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});
