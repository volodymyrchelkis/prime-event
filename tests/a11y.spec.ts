import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { nav } from '../src/data/site';
import { langs, localizePath } from '../src/i18n';

// Automated WCAG 2.2 A/AA checks. They catch roughly a third of real problems;
// keyboard and screen-reader checks stay manual.
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const lang of langs) {
  for (const item of nav) {
    const url = localizePath(lang, item.path);

    test(`${url} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(url);
      const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(
        violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target).join(', ')})`),
      ).toEqual([]);
    });
  }
}

test('the 404 page has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/no-such-page');
  const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
