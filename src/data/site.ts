export const site = {
  name: 'Prime Event',
  phone: '+380950424428',
  phoneDisplay: '+380 95 042 44 28',
  telegram: 'https://t.me/iri_prime',
  instagram: 'https://instagram.com/prime_event_nk',
  instagramHandle: '@prime_event_nk',
  // Пока сайт черновик, поисковики его не индексируют. Поставить true к запуску.
  indexable: false,
  // Новогодний блок на главной. Выключить (false) после праздников.
  newYearSeason: true,
};

// Paths without the language prefix; labels come from src/i18n/ui.ts.
export const nav = [
  { path: '/', key: 'home' },
  { path: '/services', key: 'services' },
  { path: '/characters', key: 'characters' },
  { path: '/contacts', key: 'contacts' },
] as const;
