import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { content } from '../../src/data/content';
import { validateContent } from '../../src/data/validate';

const inPublic = (path: string) => existsSync(`public${path}`);

test('shipped content passes validation', () => {
  expect(validateContent(content, inPublic)).toEqual([]);
});

test('three timeline rows, newest first', () => {
  expect(content.roles.map((r) => r.id)).toEqual(['fidelity', 'state-street', 'umass']);
});

test('six projects in two groups of three', () => {
  expect(content.groups.map((g) => g.id)).toEqual(['agent-tooling', 'research']);
  expect(content.projects.filter((p) => p.group === 'agent-tooling').map((p) => p.id)).toEqual(['universal-memory', 'claude-state-drift', 'attune']);
  expect(content.projects.filter((p) => p.group === 'research').map((p) => p.id)).toEqual(['edge-catcher', 'ai-x-feed', 'product-search-ai-agent']);
});

test('the studio art ships with the site', () => {
  expect(inPublic(content.studio.featured.art.src)).toBe(true);
});
