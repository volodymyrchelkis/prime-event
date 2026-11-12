import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { formatLead, leadButtons, parseLead } from '../../lib/lead';

export const prerender = false;

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'Некорректный запрос' });
  }

  const result = parseLead(data);
  if (!result.ok) {
    // Pretend success to bots so they do not retry.
    if (result.error === 'spam') return json(200, { ok: true });
    return json(422, { error: result.error });
  }

  const token = getSecret('TELEGRAM_BOT_TOKEN');
  const chatId = getSecret('TELEGRAM_CHAT_ID');
  if (!token || !chatId) {
    console.error('Lead form: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set');
    return json(503, { error: 'Форма временно недоступна' });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatLead(result.lead),
      reply_markup: {
        inline_keyboard: [leadButtons(result.lead, new URL(request.url).origin)],
      },
    }),
  });

  if (!res.ok) {
    console.error('Lead form: Telegram API responded', res.status, await res.text());
    return json(502, { error: 'Не удалось отправить заявку' });
  }

  return json(200, { ok: true });
};
