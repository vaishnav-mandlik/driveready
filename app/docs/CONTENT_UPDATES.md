# Content updates (Cloudflare R2)

Fix or add questions, lessons, state facts and translations **without a Play Store release**. The app stays
offline-first: everything is bundled, and updates download quietly in the background and apply on the next launch.

## How it works

```
npm run content:publish
  └─ validates all content (0 errors required)
  └─ uploads only new files to R2 as blobs/<sha256>.json   (immutable, cached 1 year)
  └─ uploads manifest.json LAST                            (cached 5 minutes)

App (src/content/updates.ts)
  launch  → applies the update installed last time (before the first screen; bundled content is the fallback)
  ~5 s later, at most every 20 h → GET manifest.json → download only files whose SHA-256 differs from the
            bundled copy → verify hash + shape of every file → one atomic commit → used on the next launch
```

Safety rules built into the client:
- Any failure (offline, timeout, wrong hash, bad JSON, too large) leaves the current content untouched.
- `minAppVersion` in the manifest keeps content away from app versions that cannot show it.
- Questions that reference a sign image or topic the installed app does not have are dropped (not shown broken).
- A new app build automatically discards updates installed for an older build (its bundled content is newer).
- Only paths under `questions/`, `states/`, `lessons/` and `i18n/` are accepted; sign artwork ships with the app.
- No identifiers are sent (plain HTTPS GETs). Privacy policy: "Question updates" section.

Cost at 100k monthly users ≈ $0 (R2 free tier: 10 GB storage, 10M reads/month, no egress fees) plus a domain.

## One-time setup (owner)

1. **Cloudflare account** (free) → add your domain (or buy one in Cloudflare Registrar).
2. **R2 → Create bucket**, e.g. `driveready-content` (location: Automatic).
3. **Bucket → Settings → Custom Domains → Connect domain**, e.g. `content.yourdomain.com`.
   Do not use the `r2.dev` URL in production (rate-limited, not cached).
4. **Caching:** Cloudflare dashboard → Caching → Cache Rules → "Cache everything" for `content.yourdomain.com/*`
   (the upload script sets `Cache-Control`: blobs 1 year, manifest 5 minutes).
5. **R2 → Manage API tokens → Create token** with *Object Read & Write* on that bucket only. Note the Access Key
   ID, Secret Access Key and your Account ID. Keep them out of git (e.g. in your shell or a password manager).
6. In `app/src/config.ts` set `CONTENT_BASE_URL = 'https://content.yourdomain.com/v1'` and release the app once.

## Publishing an update

```bash
cd app
export R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=driveready-content CONTENT_PREFIX=v1
npm run content:release          # optional: writes the release to ../research/release-preview to inspect
npm run content:publish          # validate + upload; prints which files changed
```

Options: `--min-app 1.2.0` when content needs a newer app (new sign codes, new topics, new fields);
`EXCLUDE_STATES=XX` / `EXCLUDE_FILES=name.json` to hold back unfinished content (same as the index script).
`node scripts/publish-content.mjs --self-test` checks the request signer against AWS's published test vector.

## Releasing a new app version

Publish the content first, then build the app: the app bundles the same files, so users of the new version
download nothing until the next content change.
