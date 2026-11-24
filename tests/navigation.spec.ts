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
  // Visible label first, full name for screen readers after it (WCAG 2.5.3 label in name).
  await expect(switcher.getByRole('link')).toHaveText([
    'RU Русский',
    'UA Українська',
    'BG Български',
  ]);
  await expect(switcher.locator('[aria-current="true"]')).toHaveAccessibleName('RU Русский');

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
      `https://prime-event-tau.vercel.app${localizePath(lang, '/contacts')}`,
    );
  }
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    'https://prime-event-tau.vercel.app/contacts',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://prime-event-tau.vercel.app/bg/contacts',
  );
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

test('consultation is listed on the services page but not on the home page', async ({ page }) => {
  for (const [lang, consultation] of [
    ['ru', 'Консультация организатора'],
    ['uk', 'Консультація організатора'],
    ['bg', 'Консултация с организатор'],
  ] as const) {
    await page.goto(localizePath(lang, '/services'));
    await expect(page.locator('article:not(.package) h3').last()).toHaveText(consultation);

    await page.goto(localizePath(lang, '/'));
    const cards = page.locator('main article h3');
    await expect(cards).toHaveCount(2);
    // The tiles are plain cards, not links.
    await expect(page.locator('main a h3')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(consultation);
  }
});

test('home page shows the two hero photos next to the title', async ({ page }) => {
  for (const lang of langs) {
    await page.goto(localizePath(lang, '/'));
    const photos = page.locator('main section').first().locator('img');
    await expect(photos).toHaveCount(2);
    // Confetti show first, animators second.
    await expect(photos.nth(0)).toHaveAttribute('src', /hero-confetti/);
    await expect(photos.nth(1)).toHaveAttribute('src', /hero-characters/);
    for (const [i, alt] of t(lang).home.heroPhotos.entries()) {
      const img = photos.nth(i);
      await expect(img).toHaveAttribute('alt', alt);
      await expect(img).toHaveAttribute('srcset', /webp/);
      await expect(img).toHaveJSProperty('complete', true);
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test('turnkey party and event organization show their photos on home and services', async ({
  page,
}) => {
  for (const url of ['/', '/services', '/bg', '/uk/services']) {
    await page.goto(url);
    for (const [title, file] of [
      [/Праздник под ключ|Свято під ключ|Празник до ключ/, /turnkey-party/],
      [/Организация события|Організація події|Организация на събития/, /event-organization/],
    ] as const) {
      const card = page
        .locator('main article')
        .filter({ has: page.locator('h3', { hasText: title }) });
      const img = card.locator('img');
      await expect(img).toHaveAttribute('src', file);
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
        .toBeGreaterThan(0);
    }
  }
});
