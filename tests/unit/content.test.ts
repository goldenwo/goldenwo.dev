import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { content } from '../../src/data/content';
import { validateContent } from '../../src/data/validate';

const inPublic = (path: string) => existsSync(`public${path}`);

test('shipped content passes validation', () => {
  expect(validateContent(content, inPublic)).toEqual([]);
});

test('timeline shows the Fidelity progression, newest first', () => {
  expect(content.roles.map((r) => r.id)).toEqual(['fidelity-ai', 'fidelity-platform', 'state-street', 'umass']);
});

test('focus lists the three things to be known for', () => {
  expect(content.focus.map((f) => f.title)).toEqual(['Agent reliability', 'AI-driven development', 'Regulated environments']);
});

test('projects lead with reliability', () => {
  expect(content.groups.map((g) => g.id)).toEqual(['reliability', 'agent-tooling', 'research']);
  const ids = (group: string) => content.projects.filter((p) => p.group === group).map((p) => p.id);
  expect(ids('reliability')).toEqual(['claude-harness-toolkit', 'claude-state-drift', 'fleet-watchdog']);
  expect(ids('agent-tooling')).toEqual(['universal-memory', 'attune']);
  expect(ids('research')).toEqual(['edge-catcher', 'ai-x-feed']);
  expect(content.projects.filter((p) => p.private).map((p) => p.id)).toEqual(['claude-harness-toolkit', 'fleet-watchdog']);
});

test('the studio art ships with the site', () => {
  expect(inPublic(content.studio.featured.art.src)).toBe(true);
});

// Positioning rules from the owner's career-direction brief.
test('no job-seeking language anywhere while still employed', () => {
  expect(JSON.stringify(content)).not.toMatch(/open to (work|roles|opportunities)|looking for|job search|available for hire|#opentowork/i);
});

test('Angular is evidence, never the pitch', () => {
  for (const text of [content.site.headline, content.site.bio, content.site.description, ...content.focus.map((f) => f.text)]) {
    expect(text).not.toMatch(/angular/i);
  }
});

test('the OG image carries the current headline', () => {
  expect(readFileSync('scripts/make-images.mjs', 'utf8')).toContain(content.site.headline);
});
