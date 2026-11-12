import { expect, test } from '@playwright/test';
import {
  formatLead,
  internationalDigits,
  leadButtons,
  parseLead,
  type Lead,
} from '../src/lib/lead';

test.describe('parseLead', () => {
  const valid = { name: ' Анна ', phone: '+359 (88) 123-45-67' };

  test('accepts a valid lead, trims fields and applies defaults', () => {
    expect(parseLead(valid)).toEqual({
      ok: true,
      lead: {
        name: 'Анна',
        phone: '+359 (88) 123-45-67',
        contact: 'any',
        package: null,
        date: '',
        comment: '',
        lang: 'ru',
      },
    });
  });

  test('keeps a known contact method and language', () => {
    const result = parseLead({ ...valid, contact: 'viber', lang: 'bg' });
    expect(result.ok && [result.lead.contact, result.lead.lang]).toEqual(['viber', 'bg']);
  });

  for (const [data, error] of [
    [{ ...valid, name: '   ' }, 'name'],
    [{ ...valid, phone: 'abc' }, 'phone'],
    [{ ...valid, phone: '123' }, 'phone'],
    [{ ...valid, date: '20.12.2026' }, 'date'],
    [{ ...valid, contact: 'pigeon' }, 'contact'],
    [{ ...valid, contact: 'toString' }, 'contact'],
    [{ ...valid, package: 'gold' }, 'package'],
    [{ ...valid, package: 'toString' }, 'package'],
    [{ ...valid, lang: 'en' }, 'lang'],
    [{ ...valid, lang: 'constructor' }, 'lang'],
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

test.describe('internationalDigits', () => {
  for (const [input, expected] of [
    ['+359 (88) 123-45-67', '359881234567'],
    ['+380 95 042 44 28', '380950424428'],
    ['00359 88 123 4567', '359881234567'],
    ['088 123 4567', '359881234567'],
  ]) {
    test(`${input} -> ${expected}`, () => {
      expect(internationalDigits(input)).toBe(expected);
    });
  }
});

const lead: Lead = {
  name: 'Анна',
  phone: '088 123 4567',
  contact: 'viber',
  package: null,
  date: '',
  comment: '',
  lang: 'uk',
};

test('formatLead shows phone, contact and language, and skips empty optional fields', () => {
  expect(formatLead(lead)).toBe(
    '🎉 Новая заявка с сайта\n\nИмя: Анна\nТелефон: +359881234567\nСвязь: Viber\nЯзык сайта: Українська',
  );
});

test('formatLead names the chosen program with its price', () => {
  expect(formatLead({ ...lead, package: 'premium' })).toContain('Программа: Премиум (140 €)');
});

test('parseLead keeps a known program', () => {
  const result = parseLead({ name: 'Анна', phone: '+359881234567', package: 'maximum' });
  expect(result.ok && result.lead.package).toBe('maximum');
});

test('leadButtons link to every messenger, preferred one first', () => {
  expect(leadButtons(lead, 'https://example.com')).toEqual([
    { text: '📱 Viber', url: 'https://example.com/go/viber?n=359881234567' },
    { text: '💬 WhatsApp', url: 'https://wa.me/359881234567' },
    { text: '✈️ Telegram', url: 'https://t.me/+359881234567' },
  ]);
});

test('leadButtons keep the default order when no messenger is preferred', () => {
  const texts = leadButtons({ ...lead, contact: 'call' }, 'https://example.com').map((b) => b.text);
  expect(texts).toEqual(['💬 WhatsApp', '✈️ Telegram', '📱 Viber']);
});

test('leadButtons drop the Viber link when the site is not served over https', () => {
  const texts = leadButtons(lead, 'http://localhost:4321').map((b) => b.text);
  expect(texts).toEqual(['💬 WhatsApp', '✈️ Telegram']);
});
