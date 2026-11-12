import type { UI } from '../i18n/ui';

export type CharacterTag = keyof UI['characters']['tags'];

export interface Character {
  name: string;
  tag: CharacterTag;
}

// TODO: заменить на настоящих персонажей и фото от Prime Event.
export const characters: Character[] = [
  { name: 'Персонаж 1', tag: 'princess' },
  { name: 'Персонаж 2', tag: 'superhero' },
  { name: 'Персонаж 3', tag: 'cartoon' },
  { name: 'Персонаж 4', tag: 'princess' },
  { name: 'Персонаж 5', tag: 'superhero' },
  { name: 'Персонаж 6', tag: 'cartoon' },
  { name: 'Персонаж 7', tag: 'princess' },
  { name: 'Персонаж 8', tag: 'cartoon' },
];
