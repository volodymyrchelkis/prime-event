import { expect, test } from '@playwright/test';
import { site } from '../src/data/site';

test('contact channels link to phone, Telegram and Instagram', async ({ page }) => {
  await page.goto('/contacts');
  const main = page.getByRole('main');

  await expect(main.getByRole('link', { name: /Телефон/ })).toHaveAttribute(
    'href',
    `tel:${site.phone}`,
  );
  await expect(main.getByRole('link', { name: /Telegram/ })).toHaveAttribute('href', site.telegram);
  await expect(main.getByRole('link', { name: /Instagram/ })).toHaveAttribute(
    'href',
    site.instagram,
  );
});

test('draft site is hidden from search engines', async ({ page, request }) => {
  test.skip(site.indexable, 'site is open for indexing');

  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /');
});
