import type { ImageMetadata } from 'astro';
import type { UI } from '../i18n/ui';

export type CharacterTag = keyof UI['characters']['tags'];

export interface Character {
  /** Shown under the photo; costumes without a name show only their group. */
  name?: string;
  tag: CharacterTag;
  image?: ImageMetadata;
}

// Real photos come from characterPhotos.ts (Vite-only, so tests do not import it).
export const placeholderCharacters: Character[] = [
  // TODO: holiday costumes are still placeholders until the owner sends photos.
  { name: 'Персонаж 9', tag: 'newYear' },
  { name: 'Персонаж 10', tag: 'newYear' },
  { name: 'Персонаж 11', tag: 'halloween' },
  { name: 'Персонаж 12', tag: 'halloween' },
];
