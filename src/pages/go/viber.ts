import type { APIRoute } from 'astro';

export const prerender = false;

// Telegram buttons cannot link to viber:// directly, so the lead message links here
// and this page hands over to the Viber app. Only a bare phone number is accepted.
export const GET: APIRoute = ({ url }) => {
  const number = url.searchParams.get('n') ?? '';
  if (!/^\d{7,15}$/.test(number)) {
    return new Response('Invalid number', { status: 400 });
  }

  const viber = `viber://chat?number=%2B${number}`;
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Открыть Viber</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;padding:3rem 1rem;color:#2b2622;background:#faf7f2}a{display:inline-block;margin-top:1rem;padding:.9rem 1.6rem;background:#7360f2;color:#fff;border-radius:.5rem;text-decoration:none}</style>
</head>
<body>
<p>Открываем чат в Viber с +${number}…</p>
<a href="${viber}">Открыть Viber</a>
<script>location.href=${JSON.stringify(viber)}</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
