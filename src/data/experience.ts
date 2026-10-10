import type { Role } from './types';

// Source: the public résumé (public/golden-wo-resume.pdf, refreshed 2026-10-10). Keep titles and dates in step with it.
export const roles: Role[] = [
  {
    id: 'fidelity-ai',
    when: '2026 – now',
    title: 'Software Engineer',
    org: 'Fidelity Investments',
    summary:
      'Piloted spec-driven, AI-driven development: a C# to Angular conversion proof of concept cut effort by at least 50%, and the pilot helped get Claude Code approved for other teams. Built the AI-ready repo scaffolding that loads for every developer in my area, and the evals that test it.',
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
  { id: 'umass', when: '2022', title: 'B.S. Computer Science', org: 'UMass Amherst' },
];
