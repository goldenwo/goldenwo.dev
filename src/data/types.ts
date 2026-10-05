export const PROJECT_GROUPS = ['agent-tooling', 'research'] as const;
export type ProjectGroupId = (typeof PROJECT_GROUPS)[number];

export interface Site {
  name: string;
  /** origin, no trailing slash */
  url: string;
  title: string;
  description: string;
  headline: string;
  /** two sentences */
  bio: string;
  /** JSON-LD jobTitle */
  jobTitle: string;
  links: { linkedin: string; github: string };
  /** public path of the redacted résumé PDF; null hides the button */
  resumePdf: string | null;
  photoAlt: string;
  ogImageAlt: string;
}

export interface Role {
  /** kebab-case, unique */
  id: string;
  /** display text, e.g. "2023 – now" */
  when: string;
  title: string;
  org: string;
  /** one line */
  summary?: string;
}

export interface ProjectGroupInfo {
  id: ProjectGroupId;
  title: string;
}

export interface Project {
  /** kebab-case, unique */
  id: string;
  name: string;
  /** one line */
  tagline: string;
  /** one or two sentences */
  description: string;
  group: ProjectGroupId;
  /** https only */
  links: { site?: string; source?: string };
}

export interface Studio {
  name: string;
  url: string;
  role: string;
  /** completes "I run <name>, …" */
  blurb: string;
  featured: { name: string; url: string; art: { src: string; alt: string; width: number; height: number } };
}

export interface Content {
  site: Site;
  roles: Role[];
  groups: ProjectGroupInfo[];
  projects: Project[];
  studio: Studio;
}
