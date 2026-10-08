import type { Role } from './types';

// Source: the owner's résumé as of 2026-10-05 (marked old). Replace from the updated résumé when it arrives.
export const roles: Role[] = [
  {
    id: 'fidelity-ai',
    when: '2026 – now',
    title: 'Software Engineer',
    org: 'Fidelity Investments',
    summary:
      'Piloted spec-driven, AI-driven development: a C# to Angular conversion proof of concept cut effort by at least 50%, and the pilot helped get Claude Code approved for other teams. Built the AI-ready repo scaffolding and evals that load for every developer in my area.',
  },
  {
    id: 'fidelity-platform',
    when: '2023 – 2026',
    title: 'Software Engineer',
    org: 'Fidelity Investments',
    summary:
      'Frontend platform work in an Angular/Nx monorepo: shared libraries used by 5+ teams, data stores, framework upgrades, test infrastructure, on-call, and migrations done by hand.',
  },
  { id: 'state-street', when: '2018, 2021', title: 'Intern', org: 'State Street', summary: 'IT (2018) and Securities Finance (2021).' },
  { id: 'umass', when: '2022', title: 'B.S. Information & Computer Sciences', org: 'UMass Amherst' },
];
