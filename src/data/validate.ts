import { findPrivateData } from '../privacy.mjs';
import { PROJECT_GROUPS, type Content } from './types';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** `publicFileExists` receives a site path such as "/resume.pdf" and reports whether public/ holds it. */
export function validateContent(content: Content, publicFileExists: (path: string) => boolean): string[] {
  const errors: string[] = [];
  const { site, roles, groups, projects, studio } = content;

  const checkIds = (kind: string, list: readonly { id: string }[]) => {
    const seen = new Set<string>();
    for (const { id } of list) {
      if (!KEBAB.test(id)) errors.push(`${kind} ${id}: id must be kebab-case`);
      if (seen.has(id)) errors.push(`${kind} ${id}: duplicate id`);
      seen.add(id);
    }
  };
  checkIds('role', roles);
  checkIds('group', groups);
  checkIds('project', projects);

  const links: [string, string | undefined][] = [
    ['site.url', site.url],
    ['site.links.linkedin', site.links.linkedin],
    ['site.links.github', site.links.github],
    ['studio.url', studio.url],
    ['studio.featured.url', studio.featured.url],
    ...projects.flatMap((p) => Object.entries(p.links).map(([kind, url]): [string, string | undefined] => [`project ${p.id} ${kind}`, url])),
  ];
  for (const [where, url] of links) {
    if (url !== undefined && !url.startsWith('https://')) errors.push(`${where}: link must use https`);
  }

  for (const g of groups) {
    if (!(PROJECT_GROUPS as readonly string[]).includes(g.id)) errors.push(`group ${g.id}: unknown group`);
    else if (!projects.some((p) => p.group === g.id)) errors.push(`group ${g.id}: no projects`);
  }
  for (const p of projects) {
    if (!groups.some((g) => g.id === p.group)) errors.push(`project ${p.id}: unknown group "${p.group}"`);
    if (p.private && Object.values(p.links).some(Boolean)) errors.push(`project ${p.id}: a private project cannot have links`);
  }

  content.focus.forEach((f, i) => {
    if (!f.title.trim() || !f.text.trim()) errors.push(`focus ${i}: needs a title and text`);
  });

  if (!site.photoAlt.trim()) errors.push('site.photoAlt: the photo needs alt text');
  if (!studio.featured.art.alt.trim()) errors.push('studio.featured.art: the art needs alt text');

  if (site.resumePdf !== null) {
    if (!/^\/[\w./-]+\.pdf$/.test(site.resumePdf)) errors.push('site.resumePdf must be an absolute path to a .pdf');
    else if (!publicFileExists(site.resumePdf)) errors.push(`site.resumePdf: public${site.resumePdf} does not exist`);
  }

  for (const { kind, count } of findPrivateData(JSON.stringify(content))) errors.push(`private data: ${count} ${kind} match(es)`);

  return errors;
}

export function assertValidContent(content: Content, publicFileExists: (path: string) => boolean): void {
  const errors = validateContent(content, publicFileExists);
  if (errors.length > 0) throw new Error(`Invalid content:\n- ${errors.join('\n- ')}`);
}
