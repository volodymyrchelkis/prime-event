import type { APIRoute } from 'astro';
import { nav } from '../data/site';
import { langs, localizePath } from '../i18n';

// Every page in every language, each listing its translations, so search engines
// show visitors the version in their own language.
export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const urls = nav.flatMap((item) =>
    langs.map((lang) => {
      const alternates = langs
        .map(
          (l) =>
            `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(localizePath(l, item.path))}"/>`,
        )
        .join('');
      return `<url><loc>${abs(localizePath(lang, item.path))}</loc>${alternates}</url>`;
    }),
  );
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
