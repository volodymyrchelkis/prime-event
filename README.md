# Prime Event

Website for **Prime Event** — children's party animators and turnkey events in Varna, Bulgaria.

Pages: Home · Services · Characters · Contacts.

## Tech stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS](https://tailwindcss.com) v4 — styling
- TypeScript

## Getting started

Requires Node.js 22+.

```sh
npm install
npm run dev       # http://localhost:4321
```

| Command           | Action                               |
| :---------------- | :----------------------------------- |
| `npm run dev`     | Start the local dev server           |
| `npm run build`   | Build the production site to `dist/` |
| `npm run preview` | Preview the production build         |

## Project structure

```text
src/
├── components/   # Reusable UI pieces
├── data/         # Site content: contacts, services, characters
├── layouts/      # Shared page layout (header, footer)
├── pages/        # One file per page / route
└── styles/       # Global styles and theme tokens
```

Content lives in `src/data/` — edit those files to change texts, services or characters without touching the layout.
