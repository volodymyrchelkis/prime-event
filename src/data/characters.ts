import type { UI } from '../i18n/ui';

export type CharacterTag = keyof UI['characters']['tags'];

export interface Character {
  name: string;
  tag: CharacterTag;
}

// TODO: заменить на настоящих персонажей и фото от Prime Event.
export const characters: Character[] = [
  { name: 'Персонаж 1', tag: 'girls' },
  { name: 'Персонаж 2', tag: 'boys' },
  { name: 'Персонаж 3', tag: 'universal' },
  { name: 'Персонаж 4', tag: 'girls' },
  { name: 'Персонаж 5', tag: 'boys' },
  { name: 'Персонаж 6', tag: 'universal' },
  { name: 'Персонаж 7', tag: 'girls' },
  { name: 'Персонаж 8', tag: 'universal' },
  { name: 'Персонаж 9', tag: 'newYear' },
  { name: 'Персонаж 10', tag: 'newYear' },
  { name: 'Персонаж 11', tag: 'halloween' },
  { name: 'Персонаж 12', tag: 'halloween' },
];
