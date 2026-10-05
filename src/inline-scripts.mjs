// src/inline-scripts.mjs: inline <head> scripts. astro.config.mjs hashes each value into the CSP's script-src,
// so the markup and the policy cannot drift. Astro 7 hashes its bundled scripts but not is:inline ones.
export const INLINE_SCRIPTS = {
  /** Lets CSS key the hero animation from first paint; focus.ts loads later. */
  jsClass: "document.documentElement.classList.add('js')",
};
