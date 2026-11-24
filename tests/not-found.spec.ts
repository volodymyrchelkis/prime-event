import { expect, test } from '@playwright/test';
import { langs, localizePath, t } from '../src/i18n';

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
