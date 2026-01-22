// @ts-check
import { defineConfig } from 'astro/config';
import { esMX } from '@clerk/localizations'
import { dark, neobrutalism } from '@clerk/themes';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [
    react(), 
    clerk({
      signInFallbackRedirectUrl: '/dashboard',
      signUpFallbackRedirectUrl: '/dashboard',
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      localization: esMX,
      appearance: {
        theme: dark,
      },
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify()
});