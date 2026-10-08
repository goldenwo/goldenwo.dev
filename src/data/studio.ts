import type { Studio } from './types';

export const studio: Studio = {
  name: 'Blindly',
  url: 'https://blindly.ai/',
  role: 'Founder',
  blurb:
    'where I build on my own time: agent tooling first, plus Raccoon Heist: Idle Crates, a game I’m making for fun (in closed testing on Android). It’s where ideas get tried before they meet production constraints at work.',
  featured: {
    name: 'Raccoon Heist',
    url: 'https://raccoon.blindly.ai/',
    art: {
      src: '/art/raccoon-heist-feature.png',
      alt: 'Pixel-art raccoon beside a stack of treasure crates under the title Raccoon Heist',
      width: 1024,
      height: 500,
    },
  },
};
