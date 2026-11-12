import { expect, test, type Page } from '@playwright/test';

async function fillRequired(page: Page, labels = { name: 'Имя *', phone: 'Телефон *' }) {
  await page.getByLabel(labels.name).fill('Анна');
  await page.getByLabel(labels.phone).fill('+359 88 123 4567');
}

test.describe('lead form UI', () => {
  test('sends the filled fields and shows success', async ({ page }) => {
    await page.goto('/contacts');
    let sent: Record<string, string> | undefined;
    await page.route('**/api/lead', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });

    await fillRequired(page);
    await page.getByLabel('Как удобнее связаться').selectOption('WhatsApp');
    await page.getByLabel('Дата праздника').fill('2026-12-20');
    await page.getByLabel('Комментарий').fill('Ребёнку 6 лет');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(/Заявка отправлена/);
    expect(sent).toMatchObject({
      name: 'Анна',
      phone: '+359 88 123 4567',
      contact: 'whatsapp',
      date: '2026-12-20',
      comment: 'Ребёнку 6 лет',
      lang: 'ru',
      website: '',
    });
    await expect(page.getByLabel('Имя *')).toHaveValue('');
  });

  test('shows the server error and keeps the input', async ({ page }) => {
    await page.goto('/contacts');
    await page.route('**/api/lead', (route) =>
      route.fulfill({ status: 503, json: { error: 'unavailable' } }),
    );

    await fillRequired(page);
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(
      'Форма временно недоступна. Напишите нам в Telegram.',
    );
    await expect(page.getByLabel('Имя *')).toHaveValue('Анна');
  });

  test('falls back to a generic error for an unknown code', async ({ page }) => {
    await page.goto('/contacts');
    await page.route('**/api/lead', (route) => route.fulfill({ status: 500, body: 'oops' }));

    await fillRequired(page);
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(/^Не удалось отправить заявку/);
  });

  test('does not send when required fields are empty', async ({ page }) => {
    await page.goto('/contacts');
    let requests = 0;
    await page.route('**/api/lead', (route) => {
      requests++;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByLabel('Имя *')).toBeFocused();
    expect(requests).toBe(0);
  });

  test('works in Ukrainian and tells the owner the language', async ({ page }) => {
    await page.goto('/uk/contacts');
    let sent: Record<string, string> | undefined;
    await page.route('**/api/lead', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 422, json: { error: 'phone' } });
    });

    await fillRequired(page, { name: 'Ім’я *', phone: 'Телефон *' });
    await page.getByLabel('Як зручніше зв’язатися').selectOption('Viber');
    await page.getByRole('button', { name: 'Надіслати заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(
      'Перевірте номер телефону. Напишіть нам у Telegram.',
    );
    expect(sent).toMatchObject({ lang: 'uk', contact: 'viber' });
  });

  test('works in Bulgarian', async ({ page }) => {
    await page.goto('/bg/contacts');
    await page.route('**/api/lead', (route) => route.fulfill({ json: { ok: true } }));

    await fillRequired(page, { name: 'Име *', phone: 'Телефон *' });
    await page.getByRole('button', { name: 'Изпратете запитване' }).click();

    await expect(page.getByRole('status')).toHaveText(/Запитването е изпратено/);
  });
});

test.describe('lead API', () => {
  test('rejects an invalid phone with an error code', async ({ request }) => {
    const res = await request.post('/api/lead', { data: { name: 'Анна', phone: '12' } });
    expect(res.status()).toBe(422);
    expect(await res.json()).toEqual({ error: 'phone' });
  });

  test('rejects an unknown language', async ({ request }) => {
    const res = await request.post('/api/lead', {
      data: { name: 'Анна', phone: '+359881234567', lang: 'fr' },
    });
    expect(res.status()).toBe(422);
    expect(await res.json()).toEqual({ error: 'lang' });
  });

  test('silently accepts honeypot submissions without sending', async ({ request }) => {
    const res = await request.post('/api/lead', {
      data: { name: 'Bot', phone: '+359881234567', website: 'spam.example' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('Viber hand-off page', () => {
  test('opens a Viber chat with the given number', async ({ request }) => {
    const res = await request.get('/go/viber?n=359881234567');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('viber://chat?number=%2B359881234567');
  });

  for (const n of ['', 'abc', '359<script>', '1'.repeat(16)]) {
    test(`rejects n=${JSON.stringify(n)}`, async ({ request }) => {
      const res = await request.get(`/go/viber?n=${encodeURIComponent(n)}`);
      expect(res.status()).toBe(400);
    });
  }
});

test.describe('party programs', () => {
  test('services page lists programs with prices, extras and payment terms', async ({ page }) => {
    await page.goto('/services');
    const cards = page.locator('article.package');
    await expect(cards).toHaveCount(3);
    await expect(cards.locator('h3')).toHaveText(['Стандарт', 'Премиум', 'Максимум']);
    await expect(cards).toContainText(['90 €', '140 €', '190 €']);
    await expect(page.locator('#extras')).toContainText('Пиньята');
    await expect(page.getByText(/аванс 40%/)).toBeVisible();
  });

  test('choosing a program preselects it in the form and sends it', async ({ page }) => {
    await page.goto('/uk/services');
    let sent: Record<string, string> | undefined;
    await page.route('**/api/lead', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });

    await page
      .locator('article.package[data-package="premium"]')
      .getByRole('link', { name: 'Обрати програму' })
      .click();
    await expect(page).toHaveURL(/\/uk\/contacts\/?\?package=premium#lead-form$/);
    await expect(page.getByLabel('Програма')).toHaveValue('premium');

    await page.getByLabel('Ім’я *').fill('Анна');
    await page.getByLabel('Телефон *').fill('+359 88 123 4567');
    await page.getByRole('button', { name: 'Надіслати заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(/Заявку надіслано/);
    expect(sent).toMatchObject({ package: 'premium', lang: 'uk' });
  });

  test('ignores an unknown program in the link', async ({ page }) => {
    await page.goto('/contacts?package=gold');
    await expect(page.getByLabel('Программа')).toHaveValue('');
  });
});

test('services page lists contractors and equipment in every language', async ({ page }) => {
  for (const [url, heading, item] of [
    ['/services', 'Подрядчики', 'Фотограф / видеограф'],
    ['/uk/services', 'Підрядники', 'Конфеті-гармата'],
    ['/bg/services', 'Изпълнители', 'Машина за дим'],
  ]) {
    await page.goto(url);
    const more = page.locator('#more');
    await expect(more.getByRole('heading', { name: heading })).toBeVisible();
    await expect(more).toContainText(item);
  }
});
