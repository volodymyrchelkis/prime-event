import { expect, test } from '@playwright/test';
import { packages } from '../src/data/packages';
import { site } from '../src/data/site';
import { langs, localizePath, t } from '../src/i18n';

for (const lang of langs) {
  test(`home page shows every section in ${lang}`, async ({ page }) => {
    const text = t(lang).home;
    await page.goto(localizePath(lang, '/'));

    for (const heading of [
      text.programsTitle,
      text.stepsTitle,
      t(lang).characters.title,
      text.whatWeDo,
      text.ctaTitle,
    ]) {
      await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    }
    await expect(page.locator('#programs a h3')).toHaveText(packages.map((p) => p.name[lang]));
    await expect(page.locator('#steps li')).toHaveCount(4);
    await expect(page.locator('#home-characters figure')).toHaveCount(4);
  });
}

test('new year block follows the season flag', async ({ page }) => {
  await page.goto('/uk');
  const block = page.locator('#new-year');
  if (site.newYearSeason) {
    await expect(block.getByRole('heading', { name: 'Новорічна програма' })).toBeVisible();
    await expect(block.getByRole('link', { name: 'Забронювати' })).toHaveAttribute(
      'href',
      '/uk/contacts',
    );
  } else {
    await expect(block).toHaveCount(0);
  }
});

test('a program card opens the form with that program chosen', async ({ page }) => {
  await page.goto('/');
  await page.locator('#programs a', { hasText: 'Максимум' }).click();
  await expect(page.getByLabel('Программа')).toHaveValue('maximum');
});

test('unknown pages answer 404 with a way back in every language', async ({ page }) => {
  for (const url of ['/no-such-page', '/uk/no-such-page', '/services/old']) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Страница не найдена');
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
    for (const lang of langs) {
      await expect(
        page.getByRole('link', { name: t(lang).notFound.home, exact: true }),
      ).toHaveAttribute('href', localizePath(lang, '/'));
    }
  }
});
