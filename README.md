https://codelabs.developers.google.com/codelabs/sign-in-with-google-button?hl=vi#7
https://developers.google.com/identity/gsi/web/guides/verify-google-id-token?hl=vi#node.js

## Configuration and verification

See [EDIT_HISTORY.md](EDIT_HISTORY.md) for the review, test results, configuration details and unresolved business rules.

```dotenv
NUXT_PUBLIC_SITE_URL=https://3d2ds.com
NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_ADSENSE_CLIENT_ID=
NUXT_PUBLIC_ADSENSE_ENABLED=false
```

AdSense uses a `ca-pub-` client ID with 16 digits, not an HTML snippet. Set the ID and enable flag, restart the application and configure Auto ads in AdSense. `/ads.txt` is generated from the same ID. `/sitemap.xml` contains active products; `/robots.txt` points to it.

```sh
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm test
pnpm typecheck
pnpm build
```

Prisma generation requires `DATABASE_URL`; a placeholder URL suffices for tests/builds. On Nix, use `nix-shell shell.nix` for Prisma engine paths. Unit tests mock external services; the revenue SQL test also requires Python 3 with sqlite3.

For browser regression tests, run `pnpm test:browser:serve`, start Chrome headless with `--remote-debugging-port=9229` and then run `pnpm test:browser`. This fixture uses the real frontend with synthetic API responses, separate from production data. Test screenshots and measurements from this review are in [review-artifacts](review-artifacts).

`pnpm test:smoke` expects a local production server on port 4013 started with test credentials, `NODE_ENV=test` (disables scheduled backup), and `NUXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456`. Do not use that publisher ID on the live website. The smoke test only requests robots/ads.txt and unauthenticated protected routes. Set `SMOKE_ORIGIN` to change the test server URL.
