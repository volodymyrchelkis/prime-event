import type { ImageMetadata } from 'astro';
import type { UI } from '../i18n/ui';

export type CharacterTag = keyof UI['characters']['tags'];

export interface Character {
  /** Shown under the photo; costumes without a name show only their group. */
  name?: string;
  tag: CharacterTag;
  image?: ImageMetadata;
}

// The list itself is built from the photos in characterPhotos.ts (Vite-only, so tests do not import it).
