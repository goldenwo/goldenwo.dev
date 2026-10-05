import type { Project, ProjectGroupInfo } from './types';

export const groups: ProjectGroupInfo[] = [
  { id: 'agent-tooling', title: 'Agent tooling' },
  { id: 'research', title: 'Research and data' },
];

export const projects: Project[] = [
  {
    id: 'universal-memory',
    name: 'universal-memory',
    tagline: 'Memory for LLM agents',
    description: 'Self-hosted, markdown-first memory that follows your agents across devices and sessions.',
    group: 'agent-tooling',
    links: { source: 'https://github.com/goldenwo/universal-memory' },
  },
  {
    id: 'claude-state-drift',
    name: 'claude-state-drift',
    tagline: 'Keeps long Claude Code sessions on track',
    description:
      'A per-project state layer: an orientation block at session start, the goal re-injected as you work, and a nudge when state goes stale.',
    group: 'agent-tooling',
    links: { source: 'https://github.com/goldenwo/claude-state-drift' },
  },
  {
    id: 'attune',
    name: 'attune',
    tagline: 'Explanations tuned to you',
    description: 'A Claude plugin that asks once how you like things explained, remembers, and matches it in every reply.',
    group: 'agent-tooling',
    links: { source: 'https://github.com/goldenwo/attune' },
  },
  {
    id: 'edge-catcher',
    name: 'edge-catcher',
    tagline: 'Prediction-market research pipeline',
    description: 'Takes a market hunch from hypothesis to backtest to paper trader, with the same code at every step.',
    group: 'research',
    links: { source: 'https://github.com/goldenwo/edge-catcher' },
  },
  {
    id: 'ai-x-feed',
    name: 'ai-x-feed',
    tagline: 'Daily AI signal',
    description: 'Curated summaries from 35 vetted accounts, refreshed every four hours by a Raspberry Pi.',
    group: 'research',
    links: { site: 'https://goldenwo.github.io/ai-x-feed/', source: 'https://github.com/goldenwo/ai-x-feed' },
  },
  {
    id: 'product-search-ai-agent',
    name: 'product-search-ai-agent',
    tagline: 'Shopping research agent',
    description: 'A FastAPI agent that turns a product search into a short list of the best options.',
    group: 'research',
    links: { source: 'https://github.com/goldenwo/product-search-ai-agent' },
  },
];
