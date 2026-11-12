import { defaultLang, isLang, languages, type Lang } from '../i18n';

// Labels for the Telegram message the owner reads; the form shows translated ones.
export const contactMethods = {
  any: 'Любой способ',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  call: 'Звонок',
} as const;

export type ContactMethod = keyof typeof contactMethods;

export interface Lead {
  name: string;
  phone: string;
  contact: ContactMethod;
  date: string;
  comment: string;
  lang: Lang;
}

/** Error codes; the form translates them for the visitor. */
export type LeadError = 'spam' | 'contact' | 'lang' | 'name' | 'phone' | 'date';

export type LeadResult = { ok: true; lead: Lead } | { ok: false; error: LeadError };

export interface LeadButton {
  text: string;
  url: string;
}

const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const field = (data: Record<string, unknown>, key: string, max: number) =>
  String(data[key] ?? '')
    .trim()
    .slice(0, max);

const isContactMethod = (value: string): value is ContactMethod =>
  Object.hasOwn(contactMethods, value);

export function parseLead(data: Record<string, unknown>): LeadResult {
  // Honeypot: real visitors never see this field, bots tend to fill it.
  if (field(data, 'website', 200)) return { ok: false, error: 'spam' };

  const contact = field(data, 'contact', 20) || 'any';
  if (!isContactMethod(contact)) return { ok: false, error: 'contact' };

  const lang = field(data, 'lang', 5) || defaultLang;
  if (!isLang(lang)) return { ok: false, error: 'lang' };

  const lead: Lead = {
    name: field(data, 'name', 100),
    phone: field(data, 'phone', 30),
    contact,
    date: field(data, 'date', 10),
    comment: field(data, 'comment', 1000),
    lang,
  };

  if (!lead.name) return { ok: false, error: 'name' };
  if (!PHONE_RE.test(lead.phone)) return { ok: false, error: 'phone' };
  if (lead.date && !DATE_RE.test(lead.date)) return { ok: false, error: 'date' };

  return { ok: true, lead };
}

/**
 * Phone in international digits only, as messenger links need it: "+359 88 123" -> "35988123".
 * Numbers without a country code are treated as Bulgarian: "088 123" -> "35988123".
 */
export function internationalDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.trim().startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `359${digits.slice(1)}`;
  return digits;
}

export function formatLead(lead: Lead): string {
  const lines = [
    '🎉 Новая заявка с сайта',
    '',
    `Имя: ${lead.name}`,
    `Телефон: +${internationalDigits(lead.phone)}`,
    `Связь: ${contactMethods[lead.contact]}`,
    `Язык сайта: ${languages[lead.lang].name}`,
  ];
  if (lead.date) lines.push(`Дата праздника: ${lead.date}`);
  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  return lines.join('\n');
}

/**
 * Buttons under the Telegram message that open a chat with the client.
 * Telegram only allows http(s) button links, so Viber goes through our own /go/viber page.
 */
export function leadButtons(lead: Lead, siteOrigin: string): LeadButton[] {
  const phone = internationalDigits(lead.phone);
  const buttons: Record<'telegram' | 'whatsapp' | 'viber', LeadButton> = {
    whatsapp: { text: '💬 WhatsApp', url: `https://wa.me/${phone}` },
    telegram: { text: '✈️ Telegram', url: `https://t.me/+${phone}` },
    viber: { text: '📱 Viber', url: `${siteOrigin}/go/viber?n=${phone}` },
  };

  // The client's preferred messenger goes first.
  const order = (['whatsapp', 'telegram', 'viber'] as const).toSorted(
    (a, b) => Number(b === lead.contact) - Number(a === lead.contact),
  );
  // Telegram rejects the whole message if a button links to plain http (e.g. local dev).
  return order.map((key) => buttons[key]).filter((b) => b.url.startsWith('https://'));
}
