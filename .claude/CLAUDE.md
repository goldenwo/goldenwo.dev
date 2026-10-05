# Project conventions for AI agents

> Universal rules (Always/Never/Ask + C-series conventions) live in
> `~/.claude/CLAUDE.md` and apply automatically to every repo on this
> machine. THIS file is for project-specific framing only.

goldenwo.dev: personal site of Golden Wo (the owner), the counterpart to the studio site blindly.ai.
Design: `docs/superpowers/specs/2026-10-05-goldenwo-dev-design.md`.

## Always do
- Change copy only in `src/data/*.ts`; components only render it.
- Run `npm run check` before calling work done.

## Never do
- Commit an email address, phone number, street address or the private résumé: the repo and the site are public.
  Only the owner's redacted résumé export goes in `public/`. Never weaken or skip the privacy scan.
- Set a custom domain on `goldenwo/goldenwo.github.io` (it would move project sites such as `/ai-x-feed/`).
- Touch DNS records other than the apex, `www` and `_dmarc`. Never create a wildcard record.
- Link blindly.ai to this site; the studio never names the owner.

## Ask first
- Any Cloudflare dashboard, DNS, or deploy change; pushing to GitHub; creating repos.
