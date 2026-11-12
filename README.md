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
| `npm run check`   | Type-check the project               |
| `npm run format`  | Format all files with Prettier       |
| `npm test`        | Run end-to-end tests (Playwright)    |

## Quality checks

Every push and pull request runs [CI](.github/workflows/ci.yml) on GitHub Actions:

- **Formatting** — Prettier, with Astro and Tailwind class-order plugins
- **Type-check** — `astro check`
- **Build** — production build must succeed
- **E2E tests** — Playwright on desktop and mobile (Pixel 7) viewports: every page renders, tabs navigate, the character filter works, contact links are correct, no horizontal scroll on phones

Run the tests locally once with `npx playwright install chromium`, then `npm test`.

## Search engines

While the site is a draft, `indexable: false` in [`src/data/site.ts`](src/data/site.ts) adds a `noindex` meta tag and a `Disallow` rule in `robots.txt`. Set it to `true` at launch.

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
