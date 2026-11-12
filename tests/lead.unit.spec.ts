import { expect, test } from '@playwright/test';
import { formatLead, parseLead } from '../src/lib/lead';

test.describe('parseLead', () => {
  const valid = { name: ' Анна ', phone: '+359 (88) 123-45-67' };

  test('accepts a valid lead and trims fields', () => {
    expect(parseLead(valid)).toEqual({
      ok: true,
      lead: { name: 'Анна', phone: '+359 (88) 123-45-67', date: '', comment: '' },
    });
  });

  for (const [data, error] of [
    [{ ...valid, name: '   ' }, 'Укажите имя'],
    [{ ...valid, phone: 'abc' }, 'Проверьте номер телефона'],
    [{ ...valid, phone: '123' }, 'Проверьте номер телефона'],
    [{ ...valid, date: '20.12.2026' }, 'Проверьте дату'],
    [{ ...valid, website: 'x' }, 'spam'],
  ] as const) {
    test(`rejects ${JSON.stringify(data)} with "${error}"`, () => {
      expect(parseLead(data)).toEqual({ ok: false, error });
    });
  }

  test('cuts overlong fields', () => {
    const result = parseLead({ ...valid, comment: 'x'.repeat(5000) });
    expect(result.ok && result.lead.comment.length).toBe(1000);
  });
});

test('formatLead skips empty optional fields', () => {
  const text = formatLead({ name: 'Анна', phone: '+359881234567', date: '', comment: '' });
  expect(text).toBe('🎉 Новая заявка с сайта\n\nИмя: Анна\nТелефон: +359881234567');
});
