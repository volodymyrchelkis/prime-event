import { expect, test } from '@playwright/test';
import { localizePath, splitPath } from '../src/i18n';

for (const [lang, path, expected] of [
  ['ru', '/', '/'],
  ['ru', '/services', '/services'],
  ['uk', '/', '/uk'],
  ['bg', '/contacts', '/bg/contacts'],
] as const) {
  test(`localizePath(${lang}, ${path}) -> ${expected}`, () => {
    expect(localizePath(lang, path)).toBe(expected);
  });
}

for (const [pathname, expected] of [
  ['/', { lang: 'ru', path: '/' }],
  ['/services/', { lang: 'ru', path: '/services' }],
  ['/uk', { lang: 'uk', path: '/' }],
  ['/uk/', { lang: 'uk', path: '/' }],
  ['/bg/characters/', { lang: 'bg', path: '/characters' }],
  ['/ru/services', { lang: 'ru', path: '/ru/services' }],
] as const) {
  test(`splitPath(${pathname})`, () => {
    expect(splitPath(pathname)).toEqual(expected);
  });
}
