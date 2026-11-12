import { expect, test, type Page } from '@playwright/test';

async function fillRequired(page: Page) {
  await page.getByLabel('Имя *').fill('Анна');
  await page.getByLabel('Телефон *').fill('+359 88 123 4567');
}

test.describe('lead form UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts');
  });

  test('sends the filled fields and shows success', async ({ page }) => {
    let sent: Record<string, string> | undefined;
    await page.route('**/api/lead', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });

    await fillRequired(page);
    await page.getByLabel('Дата праздника').fill('2026-12-20');
    await page.getByLabel('Комментарий').fill('Ребёнку 6 лет');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(/Заявка отправлена/);
    expect(sent).toMatchObject({
      name: 'Анна',
      phone: '+359 88 123 4567',
      date: '2026-12-20',
      comment: 'Ребёнку 6 лет',
      website: '',
    });
    await expect(page.getByLabel('Имя *')).toHaveValue('');
  });

  test('shows the server error and keeps the input', async ({ page }) => {
    await page.route('**/api/lead', (route) =>
      route.fulfill({ status: 503, json: { error: 'Форма временно недоступна' } }),
    );

    await fillRequired(page);
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toHaveText(/Форма временно недоступна.*Telegram/);
    await expect(page.getByLabel('Имя *')).toHaveValue('Анна');
  });

  test('does not send when required fields are empty', async ({ page }) => {
    let requests = 0;
    await page.route('**/api/lead', (route) => {
      requests++;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByLabel('Имя *')).toBeFocused();
    expect(requests).toBe(0);
  });
});

test.describe('lead API', () => {
  test('rejects an invalid phone', async ({ request }) => {
    const res = await request.post('/api/lead', { data: { name: 'Анна', phone: '12' } });
    expect(res.status()).toBe(422);
    expect(await res.json()).toEqual({ error: 'Проверьте номер телефона' });
  });

  test('silently accepts honeypot submissions without sending', async ({ request }) => {
    const res = await request.post('/api/lead', {
      data: { name: 'Bot', phone: '+359881234567', website: 'spam.example' },
    });
    expect(res.status()).toBe(200);
  });
});
