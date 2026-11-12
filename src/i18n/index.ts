import { ui, type UI } from './ui';

// Order matters: it is the order of the language switcher. Russian is the main language
// and lives at the site root; the others get a prefix (/uk/..., /bg/...).
export const languages = {
  ru: { label: 'RU', name: 'Русский' },
  uk: { label: 'UA', name: 'Українська' },
  bg: { label: 'BG', name: 'Български' },
} as const;

export type Lang = keyof typeof languages;
export type Localized = Record<Lang, string>;

export const defaultLang: Lang = 'ru';
export const langs = Object.keys(languages) as Lang[];

export const isLang = (value: unknown): value is Lang =>
  typeof value === 'string' && Object.hasOwn(languages, value);

export const t = (lang: Lang): UI => ui[lang];

/** getStaticPaths for pages under src/pages/[lang]/: every language except the default. */
export const prefixedLangPaths = () =>
  langs.filter((lang) => lang !== defaultLang).map((lang) => ({ params: { lang } }));

/** "/services" -> "/uk/services" for Ukrainian, unchanged for Russian. */
export function localizePath(lang: Lang, path: string): string {
  if (lang === defaultLang) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

/** "/uk/services/" -> { lang: "uk", path: "/services" }. */
export function splitPath(pathname: string): { lang: Lang; path: string } {
  const [, first, ...rest] = pathname.replace(/\/+$/, '').split('/');
  if (isLang(first) && first !== defaultLang) {
    return { lang: first, path: `/${rest.join('/')}` };
  }
  return { lang: defaultLang, path: pathname.replace(/\/+$/, '') || '/' };
}
