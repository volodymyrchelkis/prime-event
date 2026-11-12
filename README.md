# Prime Event

Website for **Prime Event** — children's party animators and turnkey events in Varna, Bulgaria.

Pages: Home · Services · Characters · Contacts, in Russian (main), Ukrainian and Bulgarian.

## Tech stack

- [Astro](https://astro.build) — pages are prerendered, the lead form API runs as a serverless function
- [Tailwind CSS](https://tailwindcss.com) v4 — styling
- TypeScript
- [Vercel](https://vercel.com) — hosting, preview deployment for every pull request

## Getting started

Requires Node.js 22+.

```sh
npm install
npm run dev       # http://localhost:4321
```

| Command          | Action                                     |
| :--------------- | :----------------------------------------- |
| `npm run dev`    | Start the local dev server                 |
| `npm run build`  | Build for Vercel to `.vercel/output/`      |
| `npm run check`  | Type-check the project                     |
| `npm run format` | Format all files with Prettier             |
| `npm test`       | Run unit and end-to-end tests (Playwright) |

## Quality checks

Every push and pull request runs [CI](.github/workflows/ci.yml) on GitHub Actions:

- **Formatting** — Prettier, with Astro and Tailwind class-order plugins
- **Type-check** — `astro check`
- **Build** — production build must succeed
- **E2E tests** — Playwright on desktop and mobile (Pixel 7) viewports: every page renders in every language, tabs and the language switcher navigate, the character filter works, contact links are correct, the lead form sends and handles errors, no horizontal scroll on phones
- **Unit tests** — lead validation, the Telegram message format and language routing

Run the tests locally once with `npx playwright install chromium`, then `npm test`.

## Lead form

The form on the Contacts page posts to [`/api/lead`](src/pages/api/lead.ts), which validates the input ([`src/lib/lead.ts`](src/lib/lead.ts)) and sends it to Telegram through a bot. A hidden honeypot field filters out simple spam bots.

It needs two environment variables, set in **Vercel → Settings → Environment Variables** (see [`.env.example`](.env.example)):

| Variable             | Value                                                  |
| :------------------- | :----------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather)    |
| `TELEGRAM_CHAT_ID`   | Chat id of the person or group that receives the leads |

Without them the API answers `503` and the form asks visitors to write in Telegram instead.

## Languages

| Language       | URLs                     |
| :------------- | :----------------------- |
| Russian (main) | `/`, `/services`, …      |
| Ukrainian      | `/uk`, `/uk/services`, … |
| Bulgarian      | `/bg`, `/bg/services`, … |

- Interface texts live in [`src/i18n/ui.ts`](src/i18n/ui.ts); TypeScript fails the build if a translation is missing.
- Service texts are translated in [`src/data/services.ts`](src/data/services.ts).
- Each page is one view in `src/views/`, rendered by `src/pages/*.astro` (Russian) and `src/pages/[lang]/*.astro` (other languages).
- The header switcher keeps the current page; pages declare their translations with `hreflang` links.
- Lead notifications stay in Russian for the owner and say which language the visitor used.

## Search engines

While the site is a draft, `indexable: false` in [`src/data/site.ts`](src/data/site.ts) adds a `noindex` meta tag and a `Disallow` rule in `robots.txt`. Set it to `true` at launch.

## Project structure

```text
src/
├── components/   # Reusable UI pieces
├── data/         # Site content: contacts, services, characters
├── i18n/         # Languages, interface translations, localized URLs
├── layouts/      # Shared page layout (header, footer, language switcher)
├── lib/          # Logic shared by pages and API routes
├── pages/        # Routes: Russian at the root, [lang]/ for uk and bg, api/ for server endpoints
├── styles/       # Global styles and theme tokens
└── views/        # Page bodies shared by all languages
```

Content lives in `src/data/` and `src/i18n/` — edit those files to change texts, services or characters without touching the layout.
