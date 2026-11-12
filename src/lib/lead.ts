export interface Lead {
  name: string;
  phone: string;
  date: string;
  comment: string;
}

export type LeadResult = { ok: true; lead: Lead } | { ok: false; error: string };

const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const field = (data: Record<string, unknown>, key: string, max: number) =>
  String(data[key] ?? '')
    .trim()
    .slice(0, max);

export function parseLead(data: Record<string, unknown>): LeadResult {
  // Honeypot: real visitors never see this field, bots tend to fill it.
  if (field(data, 'website', 200)) return { ok: false, error: 'spam' };

  const lead: Lead = {
    name: field(data, 'name', 100),
    phone: field(data, 'phone', 30),
    date: field(data, 'date', 10),
    comment: field(data, 'comment', 1000),
  };

  if (!lead.name) return { ok: false, error: 'Укажите имя' };
  if (!PHONE_RE.test(lead.phone)) return { ok: false, error: 'Проверьте номер телефона' };
  if (lead.date && !DATE_RE.test(lead.date)) return { ok: false, error: 'Проверьте дату' };

  return { ok: true, lead };
}

export function formatLead(lead: Lead): string {
  const lines = ['🎉 Новая заявка с сайта', '', `Имя: ${lead.name}`, `Телефон: ${lead.phone}`];
  if (lead.date) lines.push(`Дата праздника: ${lead.date}`);
  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  return lines.join('\n');
}
