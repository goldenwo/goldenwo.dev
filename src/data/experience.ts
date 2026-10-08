import type { Role } from './types';

// Source: the owner's résumé as of 2026-10-05 (marked old). Replace from the updated résumé when it arrives.
export const roles: Role[] = [
  {
    id: 'fidelity-ai',
    when: '2026 – now',
    title: 'Software Engineer',
    org: 'Fidelity Investments',
    summary: 'AI-driven code migrations and AI developer tooling: multi-agent orchestration, MCP servers and spec-driven pipelines.',
  },
  {
    id: 'fidelity-platform',
    when: '2023 – 2026',
    title: 'Software Engineer',
    org: 'Fidelity Investments',
    summary: 'Frontend platform work in an Angular monorepo: shared libraries used by 5+ teams, test infrastructure, and migrations done by hand.',
  },
  { id: 'state-street', when: '2018, 2021', title: 'Intern', org: 'State Street', summary: 'IT (2018) and Securities Finance (2021).' },
  { id: 'umass', when: '2022', title: 'B.S. Information & Computer Sciences', org: 'UMass Amherst' },
];
