import type { FocusItem } from './types';

// The three things to be known for, from the owner's career-direction brief.
export const focus: FocusItem[] = [
  {
    title: 'Agent reliability',
    text: 'Two-layer evals (deterministic checks plus LLM-as-judge) with negative controls and ablations, and hooks as guardrails.',
  },
  {
    title: 'AI-driven development',
    text: 'Spec-driven, multi-agent workflows and agent scaffolding. In a proof of concept they cut effort by at least half.',
  },
  {
    title: 'Regulated environments',
    text: 'Software that has to be correct, traceable and reviewable, learned in financial services.',
  },
];
