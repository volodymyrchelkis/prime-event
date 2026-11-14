import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = ({ site: origin }) =>
  new Response(
    `User-agent: *\n${site.indexable ? 'Allow' : 'Disallow'}: /\n\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
