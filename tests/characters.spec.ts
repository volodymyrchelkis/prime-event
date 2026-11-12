import { expect, test } from '@playwright/test';
import { characters } from '../src/data/characters';
import { t } from '../src/i18n';

for (const [lang, url] of [
  ['ru', '/characters'],
  ['bg', '/bg/characters'],
] as const) {
  test(`category filter shows only matching characters (${lang})`, async ({ page }) => {
    const text = t(lang).characters;
    await page.goto(url);
    const cards = page.locator('figure.character');
    await expect(cards.filter({ visible: true })).toHaveCount(characters.length);

    const tag = characters[0].tag;
    const expected = characters.filter((c) => c.tag === tag).length;

    await page.getByRole('button', { name: text.tags[tag] }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(expected);
    for (const card of await cards.filter({ visible: true }).all()) {
      await expect(card).toContainText(text.tags[tag]);
    }

    await page.getByRole('button', { name: text.all }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(characters.length);
  });
}
