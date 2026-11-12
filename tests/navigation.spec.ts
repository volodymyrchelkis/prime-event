import { expect, test } from '@playwright/test';
import { nav } from '../src/data/site';
import { langs, localizePath, t } from '../src/i18n';

const headings = {
  '/': 'home',
  '/services': 'services',
  '/characters': 'characters',
  '/contacts': 'contacts',
} as const;

for (const lang of langs) {
  for (const item of nav) {
    const url = localizePath(lang, item.path);
    const text = t(lang);

    test(`${url} renders in ${lang} and marks its tab as current`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page).toHaveTitle(/Prime Event/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        text[headings[item.path]].title,
      );

      const current = page.getByRole('navigation').locator('[aria-current="page"]');
      await expect(current).toHaveText(text.nav[item.key]);
    });

    test(`${url} has no horizontal scroll`, async ({ page }) => {
      await page.goto(url);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test('pages show real translations, not the Russian fallback', async ({ page }) => {
  await page.goto('/uk');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Свята, які запам’ятовуються');
  await page.goto('/bg/services');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Услуги');
  await expect(page.getByText('Празник до ключ').first()).toBeVisible();
});

test('header tabs keep the current language', async ({ page }) => {
  await page.goto('/uk');
  const nav = page.getByRole('navigation');

  await nav.getByRole('link', { name: 'Персонажі' }).click();
  await expect(page).toHaveURL(/\/uk\/characters\/?$/);

  await nav.getByRole('link', { name: 'Контакти' }).click();
  await expect(page).toHaveURL(/\/uk\/contacts\/?$/);
});

test('language switcher opens the same page in another language', async ({ page }) => {
  await page.goto('/services');
  const switcher = page.getByRole('list', { name: 'Язык сайта' });
  await expect(switcher.getByRole('link')).toHaveText(['RU', 'UA', 'BG']);
  await expect(switcher.locator('[aria-current="true"]')).toHaveText('RU');

  await switcher.getByRole('link', { name: 'Українська' }).click();
  await expect(page).toHaveURL(/\/uk\/services\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Послуги');

  await page
    .getByRole('list', { name: 'Мова сайту' })
    .getByRole('link', { name: 'Български' })
    .click();
  await expect(page).toHaveURL(/\/bg\/services\/?$/);

  await page
    .getByRole('list', { name: 'Език на сайта' })
    .getByRole('link', { name: 'Русский' })
    .click();
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/services\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test('every page links its translations for search engines', async ({ page }) => {
  await page.goto('/bg/contacts');
  for (const lang of langs) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute(
      'href',
      localizePath(lang, '/contacts'),
    );
  }
});

test('other services list starts with turnkey party, without kids room or kids events', async ({
  page,
}) => {
  for (const [url, title, first, removed] of [
    ['/services', 'Другие услуги', 'Праздник под ключ', /Детская комната|Детские мероприятия/],
    ['/uk/services', 'Інші послуги', 'Свято під ключ', /Дитяча кімната|Дитячі заходи/],
    ['/bg/services', 'Други услуги', 'Празник до ключ', /Детски кът|Детски събития/],
  ] as const) {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible();
    const services = page.locator('article:not(.package) h3');
    await expect(services.first()).toHaveText(first);
    await expect(page.locator('body')).not.toContainText(removed);
  }
  await page.goto('/');
  await expect(page.locator('body')).not.toContainText(/комнат/i);
});
