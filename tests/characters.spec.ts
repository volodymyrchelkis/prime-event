import { expect, test } from '@playwright/test';
import { placeholderCharacters } from '../src/data/characters';

// The photo list is built by Vite (import.meta.glob), so counts come from the page.
import { t } from '../src/i18n';

for (const [lang, url] of [
  ['ru', '/characters'],
  ['bg', '/bg/characters'],
] as const) {
  test(`category filter shows only matching characters (${lang})`, async ({ page }) => {
    const text = t(lang).characters;
    await page.goto(url);
    const cards = page.locator('figure.character');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);
    await expect(cards.filter({ visible: true })).toHaveCount(total);

    const tag = 'girls';
    const expected = await page.locator(`figure.character[data-tag="${tag}"]`).count();
    expect(expected).toBeGreaterThan(0);

    await page.getByRole('button', { name: text.tags[tag] }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(expected);
    for (const card of await cards.filter({ visible: true }).all()) {
      await expect(card).toContainText(text.tags[tag]);
    }

    await page.getByRole('button', { name: text.all }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(total);
  });
}

test('holiday tabs: New Year and Halloween in every language', async ({ page }) => {
  for (const [url, newYear, halloween] of [
    ['/characters', 'Новый год', 'Хэллоуин'],
    ['/uk/characters', 'Новий рік', 'Гелловін'],
    ['/bg/characters', 'Нова година', 'Хелоуин'],
  ] as const) {
    await page.goto(url);
    const cards = page.locator('figure.character');
    for (const [name, tag] of [
      [newYear, 'newYear'],
      [halloween, 'halloween'],
    ] as const) {
      await page.locator('#filters').getByRole('button', { name }).click();
      const visible = cards.filter({ visible: true });
      await expect(visible).toHaveCount(placeholderCharacters.filter((c) => c.tag === tag).length);
      await expect(visible.first()).toContainText(name);
    }
  }
});

test('character groups: for girls, for boys, universal', async ({ page }) => {
  for (const [url, groups] of [
    ['/characters', ['Для девочек', 'Для мальчиков', 'Универсальные']],
    ['/uk/characters', ['Для дівчаток', 'Для хлопчиків', 'Універсальні']],
    ['/bg/characters', ['За момичета', 'За момчета', 'Универсални']],
  ] as const) {
    await page.goto(url);
    const filters = page.locator('#filters');
    for (const name of groups) {
      await expect(filters.getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(filters).not.toContainText(/Принцес|Супергеро|Мультф|Анимации/);
  }
});

test('real character photos load in each group', async ({ page }) => {
  await page.goto('/characters');
  // Every card in the three groups has a real photo.
  const groupCards = page.locator(
    'figure.character[data-tag="girls"], figure.character[data-tag="boys"], figure.character[data-tag="universal"]',
  );
  await expect(page.locator('figure.character img')).toHaveCount(await groupCards.count());
  for (const tag of ['girls', 'boys', 'universal'] as const) {
    expect(await page.locator(`figure.character[data-tag="${tag}"]`).count()).toBeGreaterThan(0);
    await page
      .locator('#filters')
      .getByRole('button', { name: t('ru').characters.tags[tag], exact: true })
      .click();
    const first = page
      .locator('figure.character', { has: page.locator('img') })
      .filter({ visible: true })
      .first();
    const img = first.locator('img');
    await expect(img).toHaveAttribute(
      'alt',
      `Аниматор Prime Event в костюме · ${t('ru').characters.tags[tag]}`,
    );
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  }
});
