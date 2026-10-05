import type { Role } from './types';

// Source: the owner's résumé as of 2026-10-05 (marked old). Replace from the updated résumé when it arrives.
export const roles: Role[] = [
  {
    id: 'fidelity',
    when: '2023 – now',
    title: 'Full-Stack Software Engineer',
    org: 'Fidelity Investments',
    summary: 'Shared Angular libraries and micro-frontends used by 5+ teams; led LLM integration in the monorepo.',
  },
  { id: 'state-street', when: '2018, 2021', title: 'Intern', org: 'State Street', summary: 'IT (2018) and Securities Finance (2021).' },
  { id: 'umass', when: '2022', title: 'B.S. Information & Computer Sciences', org: 'UMass Amherst' },
];
