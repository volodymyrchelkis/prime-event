import type { Localized } from '../i18n';

// Prices come from the price cards on varnaevent.mssg.me (checked 2026-11-12).
// The cards show lev and euro; the site shows euro. Where a card has lev only,
// euro uses the owner's own 2:1 rounding (e.g. 200 лв / 100 € for the consultation).

export interface Package {
  id: 'standard' | 'premium' | 'maximum';
  name: Localized;
  priceEur: number;
  characters: Localized;
  duration: Localized;
  features: Record<keyof Localized, string[]>;
}

export const packages: Package[] = [
  {
    id: 'standard',
    name: { ru: 'Стандарт', uk: 'Стандарт', bg: 'Стандарт' },
    priceEur: 90,
    characters: { ru: '1 персонаж', uk: '1 персонаж', bg: '1 герой' },
    duration: { ru: '60–80 минут', uk: '60–80 хвилин', bg: '60–80 минути' },
    features: {
      ru: [
        'Музыкальное сопровождение',
        'Игры по возрасту и увлечениям ребёнка',
        'Аквагрим, мыльные пузыри и другие спокойные развлечения между играми',
        'Интерактив с педагогическим подходом к детям',
      ],
      uk: [
        'Музичний супровід',
        'Ігри за віком і захопленнями дитини',
        'Аквагрим, мильні бульбашки та інші спокійні розваги між іграми',
        'Інтерактив із педагогічним підходом до дітей',
      ],
      bg: [
        'Музикален съпровод',
        'Игри според възрастта и интересите на детето',
        'Рисуване по лицето, сапунени балони и други спокойни забавления между игрите',
        'Интерактивни забавления с педагогически подход към децата',
      ],
    },
  },
  {
    id: 'premium',
    name: { ru: 'Премиум', uk: 'Преміум', bg: 'Премиум' },
    priceEur: 140,
    characters: { ru: '2 персонажа', uk: '2 персонажі', bg: '2 героя' },
    duration: { ru: '90–100 минут', uk: '90–100 хвилин', bg: '90–100 минути' },
    features: {
      ru: ['Всё из программы «Стандарт»', 'Квест в программе', '+1 персонаж'],
      uk: ['Усе з програми «Стандарт»', 'Квест у програмі', '+1 персонаж'],
      bg: ['Всичко от програма „Стандарт“', 'Куест в програмата', '+1 герой'],
    },
  },
  {
    id: 'maximum',
    name: { ru: 'Максимум', uk: 'Максимум', bg: 'Максимум' },
    priceEur: 190,
    characters: { ru: '2 персонажа', uk: '2 персонажі', bg: '2 героя' },
    duration: { ru: '2,5–3 часа', uk: '2,5–3 години', bg: '2,5–3 часа' },
    features: {
      ru: ['Максимально насыщенная программа и игры', 'Интересно детям любого возраста'],
      uk: ['Максимально насичена програма та ігри', 'Цікаво дітям будь-якого віку'],
      bg: ['Максимално наситена програма и игри', 'Интересно за деца от всяка възраст'],
    },
  },
];

export type PackageId = Package['id'];

export interface Extra {
  name: Localized;
  /** "from" price in euro; null when it depends on the party. */
  fromEur: number | null;
  perHour?: boolean;
  note?: Localized;
}

export const extras: Extra[] = [
  {
    name: { ru: 'Ведущий', uk: 'Ведучий', bg: 'Водещ' },
    fromEur: 100,
    perHour: true,
    note: {
      ru: 'Встреча за 3 дня до праздника: тайминг, гости, пожелания и табу',
      uk: 'Зустріч за 3 дні до свята: таймінг, гості, побажання та табу',
      bg: 'Среща 3 дни преди празника: програма, гости, желания и табута',
    },
  },
  {
    name: { ru: 'Пиньята', uk: 'Піньята', bg: 'Пинята' },
    fromEur: 15,
  },
  {
    name: { ru: 'Конфетти-шоу', uk: 'Конфеті-шоу', bg: 'Конфети шоу' },
    fromEur: 75,
  },
  {
    name: { ru: 'Шоу опытов', uk: 'Шоу експериментів', bg: 'Шоу с експерименти' },
    fromEur: 100,
  },
  {
    name: {
      ru: 'Шоу мыльных пузырей',
      uk: 'Шоу мильних бульбашок',
      bg: 'Шоу със сапунени балони',
    },
    fromEur: 100,
  },
  {
    name: { ru: 'Мастер-класс', uk: 'Майстер-клас', bg: 'Работилница' },
    fromEur: null,
  },
];
