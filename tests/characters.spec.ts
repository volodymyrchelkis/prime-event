import { expect, test } from '@playwright/test';
import { characters } from '../src/data/characters';

test('category filter shows only matching characters', async ({ page }) => {
  await page.goto('/characters');
  const cards = page.locator('figure.character');
  await expect(cards.filter({ visible: true })).toHaveCount(characters.length);

  const tag = characters[0].tag;
  const expected = characters.filter((c) => c.tag === tag).length;

  await page.getByRole('button', { name: tag }).click();
  await expect(cards.filter({ visible: true })).toHaveCount(expected);
  for (const card of await cards.filter({ visible: true }).all()) {
    await expect(card).toContainText(tag);
  }

  await page.getByRole('button', { name: 'Все' }).click();
  await expect(cards.filter({ visible: true })).toHaveCount(characters.length);
});
