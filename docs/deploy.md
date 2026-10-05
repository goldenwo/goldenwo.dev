# Deploying goldenwo.dev

Hosting: Cloudflare Workers (static assets only), built by Workers Builds from `goldenwo/goldenwo.dev`.
Config: `wrangler.jsonc`. Build output: `dist/`. Security headers: `public/_headers`. Every step here is the
owner's to do in the Cloudflare dashboard.

## A. Connect the repo (one time, preview only)

1. **Workers & Pages** → **Create** → **Import a repository**.
2. Connect GitHub. When asked which repositories Cloudflare may access, choose **Only select repositories** →
   `goldenwo/goldenwo.dev` (add it to the existing selection that holds `blindly-site`).
3. Settings:
   - Project name: **goldenwo-dev** (must match `name` in `wrangler.jsonc`)
   - Production branch: **main**
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Preview command (non-production branches): `npx wrangler preview`
   - Preview builds: on. Cloudflare Access: off (public site).
   - Advanced: path `/`; let Cloudflare create the API token; no variables.
4. **Deploy**. Open the `*.workers.dev` URL and review the page and copy.

Since go-live, `wrangler.jsonc` sets `"workers_dev": false`: production is only served at `goldenwo.dev`. Branch
pushes still get preview URLs (`preview_urls` is explicitly true), shown on the Workers Builds deployment.

## B. Attach the domain (after visual sign-off)

1. **Apex:** **Workers & Pages** → **goldenwo-dev** → **Domains** → **Add Domain** → `goldenwo.dev`. Do this here,
   not via `routes` in `wrangler.jsonc`: the Workers Builds token cannot create DNS records (code 10013).
2. **www (redirect only):**
   - **DNS** → **Records** → `AAAA`, name `www`, address `100::`, **Proxied**.
   - **Rules** → **Redirect Rules** → template "Redirect from WWW to root", rule name `www to apex`: **Wildcard
     pattern**, request URL `https://www.goldenwo.dev/*` → target `https://goldenwo.dev/${1}`, **301**,
     **Preserve query string** on.
3. **SSL/TLS** → **Edge Certificates** → **Always Use HTTPS**: **On**.
4. **Anti-spoofing** (goldenwo.dev sends and receives no mail):
   - `MX`, name `@`, mail server `.`, priority `0` (null MX, RFC 7505).
   - `TXT`, name `@`, content `v=spf1 -all`.
   - `TXT`, name `_dmarc`, content `v=DMARC1; p=reject; adkim=s; aspf=s;`.
   If the dashboard refuses `.` as a mail server, skip the null MX and tell Claude; SPF and DMARC still block
   spoofing, and `verify-live.mjs` gets its MX check removed.
5. **Domain Registration** → **goldenwo.dev** → confirm **Auto-renew** is on (expires 2027-10-05).
6. Run `npm run verify:live -- --skip-old-url`. All checks must pass.

## C. Old URL (after B passes)

Claude replaces `goldenwo/goldenwo.github.io`'s `gh-pages` and `master` content with a stub pointing to
`https://goldenwo.dev/` (owner's OK first). Then run `npm run verify:live` with no flags. All checks must pass.

## Never

- Add a wildcard record, or any record other than the apex, `www` and `_dmarc` ones above.
- Set a custom domain on `goldenwo/goldenwo.github.io`: it would move project sites such as `/ai-x-feed/`.
