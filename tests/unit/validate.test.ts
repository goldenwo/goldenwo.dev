import { describe, expect, test } from 'vitest';
import type { Content } from '../../src/data/types';
import { assertValidContent, validateContent } from '../../src/data/validate';

const valid = (): Content => ({
  site: {
    name: 'A Person',
    url: 'https://person.example',
    title: 'A Person',
    description: 'About a person.',
    headline: 'Engineer.',
    bio: 'Builds things.',
    jobTitle: 'Engineer',
    links: { linkedin: 'https://www.linkedin.com/in/someone/', github: 'https://github.com/someone' },
    resumePdf: null,
    photoAlt: 'Portrait of A Person',
    ogImageAlt: 'A Person',
  },
  roles: [{ id: 'job', when: '2020 – now', title: 'Engineer', org: 'Org' }],
  groups: [
    { id: 'agent-tooling', title: 'Agent tooling' },
    { id: 'research', title: 'Research and data' },
  ],
  projects: [
    { id: 'tool', name: 'tool', tagline: 'A tool', description: 'Does things.', group: 'agent-tooling', links: { source: 'https://github.com/someone/tool' } },
    { id: 'study', name: 'study', tagline: 'A study', description: 'Finds things.', group: 'research', links: {} },
  ],
  studio: {
    name: 'Studio',
    url: 'https://studio.example/',
    role: 'Founder',
    blurb: 'a studio.',
    featured: { name: 'Game', url: 'https://game.example/', art: { src: '/art/game.png', alt: 'Game art', width: 10, height: 10 } },
  },
});
const noFiles = () => false;

describe('validateContent', () => {
  test('accepts valid content', () => {
    expect(validateContent(valid(), noFiles)).toEqual([]);
  });

  test('rejects duplicate and non-kebab-case ids', () => {
    const c = valid();
    c.projects.push({ ...c.projects[0] });
    c.roles.push({ ...c.roles[0], id: 'Bad_Id' });
    const errors = validateContent(c, noFiles);
    expect(errors).toContain('project tool: duplicate id');
    expect(errors).toContain('role Bad_Id: id must be kebab-case');
  });

  test('requires https on every link', () => {
    const c = valid();
    c.site.links.github = 'http://github.com/someone';
    c.projects[0].links.site = 'http://tool.example';
    c.studio.featured.url = 'http://game.example/';
    const errors = validateContent(c, noFiles);
    expect(errors).toContain('site.links.github: link must use https');
    expect(errors).toContain('project tool site: link must use https');
    expect(errors).toContain('studio.featured.url: link must use https');
  });

  test('every group has a project and every project a listed group', () => {
    const c = valid();
    c.projects = [{ ...c.projects[0], group: 'music' as never }];
    const errors = validateContent(c, noFiles);
    expect(errors).toContain('group research: no projects');
    expect(errors).toContain('project tool: unknown group "music"');
  });

  test('rejects unknown group ids', () => {
    const c = valid();
    c.groups.push({ id: 'games' as never, title: 'Games' });
    expect(validateContent(c, noFiles)).toContain('group games: unknown group');
  });

  test('requires alt text on the photo and the studio art', () => {
    const c = valid();
    c.site.photoAlt = ' ';
    c.studio.featured.art.alt = '';
    const errors = validateContent(c, noFiles);
    expect(errors).toContain('site.photoAlt: the photo needs alt text');
    expect(errors).toContain('studio.featured.art: the art needs alt text');
  });

  test('the résumé PDF must be an absolute .pdf path that exists', () => {
    const c = valid();
    c.site.resumePdf = '/cv.pdf';
    expect(validateContent(c, noFiles)).toContain('site.resumePdf: public/cv.pdf does not exist');
    expect(validateContent(c, (path) => path === '/cv.pdf')).toEqual([]);
    c.site.resumePdf = 'cv.docx';
    expect(validateContent(c, () => true)).toContain('site.resumePdf must be an absolute path to a .pdf');
  });

  test('rejects email addresses and phone numbers anywhere in the content', () => {
    const c = valid();
    c.site.bio = 'Reach me at someone@example.com or (617) 555-0123.';
    const errors = validateContent(c, noFiles);
    expect(errors).toContain('private data: 1 email match(es)');
    expect(errors).toContain('private data: 1 phone match(es)');
  });
});

describe('assertValidContent', () => {
  test('throws with every problem listed', () => {
    const c = valid();
    c.site.photoAlt = '';
    expect(() => assertValidContent(c, noFiles)).toThrow('Invalid content:\n- site.photoAlt: the photo needs alt text');
  });

  test('passes valid content', () => {
    expect(() => assertValidContent(valid(), noFiles)).not.toThrow();
  });
});
