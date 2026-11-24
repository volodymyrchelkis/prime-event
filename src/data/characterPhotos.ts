import type { ImageMetadata } from 'astro';
import { placeholderCharacters, type Character, type CharacterTag } from './characters';

// Owner's photos: src/assets/characters/<group>/NN.jpg, resized and stripped of
// metadata from photos/персонажі/. A new photo in a group folder appears on the site.
const photos = import.meta.glob<ImageMetadata>('../assets/characters/*/*.jpg', {
  eager: true,
  import: 'default',
});
const groups: CharacterTag[] = ['girls', 'boys', 'universal'];
export const photoCharacters: Character[] = groups.flatMap((tag) =>
  Object.keys(photos)
    .filter((path) => path.includes(`/characters/${tag}/`))
    .sort()
    .map((path) => ({ tag, image: photos[path] })),
);

export const characters: Character[] = [...photoCharacters, ...placeholderCharacters];
