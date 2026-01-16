// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [
    react(), 
    clerk({
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});