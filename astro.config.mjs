// @ts-check
import { createHash } from 'node:crypto';
import { defineConfig } from 'astro/config';
import { INLINE_SCRIPTS } from './src/inline-scripts.mjs';

/** @param {string} source */
const sha256 = (source) => /** @type {`sha256-${string}`} */ (`sha256-${createHash('sha256').update(source).digest('base64')}`);

export default defineConfig({
  site: 'https://goldenwo.dev',
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
      scriptDirective: { hashes: Object.values(INLINE_SCRIPTS).map(sha256) },
    },
  },
});
