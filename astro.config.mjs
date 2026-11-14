// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Absolute links (sitemap, structured data). Change here when the site gets its own domain.
  site: 'https://prime-event-tau.vercel.app',

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),

  env: {
    schema: {
      // Set in Vercel → Settings → Environment Variables. Never commit real values.
      TELEGRAM_BOT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      TELEGRAM_CHAT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
