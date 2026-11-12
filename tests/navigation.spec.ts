import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', heading: 'Праздники, которые запоминаются', nav: 'Главная' },
  { path: '/services', heading: 'Услуги', nav: 'Услуги' },
  { path: '/characters', heading: 'Персонажи', nav: 'Персонажи' },
  { path: '/contacts', heading: 'Контакты', nav: 'Контакты' },
];

for (const page of pages) {
  test(`${page.path} renders and marks its tab as current`, async ({ page: p }) => {
    const response = await p.goto(page.path);
    expect(response?.status()).toBe(200);

    await expect(p).toHaveTitle(/Prime Event/);
    await expect(p.getByRole('heading', { level: 1 })).toHaveText(page.heading);

    const current = p.getByRole('navigation').locator('[aria-current="page"]');
    await expect(current).toHaveText(page.nav);
  });

  test(`${page.path} has no horizontal scroll`, async ({ page: p }) => {
    await p.goto(page.path);
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('header tabs navigate between pages', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation');

  await nav.getByRole('link', { name: 'Персонажи' }).click();
  await expect(page).toHaveURL(/\/characters\/?$/);

  await nav.getByRole('link', { name: 'Контакты' }).click();
  await expect(page).toHaveURL(/\/contacts\/?$/);
});
