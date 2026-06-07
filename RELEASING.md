# Releasing

`ngx-signal-forms-renderer` follows [semver](https://semver.org). Releases are **automated**:
the library's `version` in `projects/ngx-signal-forms-renderer/package.json` is the single source
of truth — when it changes on `main`, CI publishes to npm and creates a GitHub Release.

## One-time setup

1. Create an npm access token with publish rights — an **Automation** token, or a **Granular**
   token with "Read and write" on packages.
2. Add it as a GitHub repository secret named **`NPM_TOKEN`**
   (Settings → Secrets and variables → Actions → New repository secret).

## Cutting a release

1. Bump the version (this is what triggers a release):
   ```bash
   cd projects/ngx-signal-forms-renderer
   npm version patch   # or: minor | major
   ```
2. Commit and merge that change to `main`.
3. CI (`.github/workflows/publish.yml`) then:
   - **skips** if that version is already on npm (so re-runs are safe),
   - builds the library (`ng build ngx-signal-forms-renderer`),
   - publishes with a dist-tag derived from the version (see below),
   - creates the `v<version>` git tag and a **GitHub Release** with auto-generated notes.

You can also run it manually: Actions → "Publish to npm" → **Run workflow**.

## Prereleases (beta)

The npm **dist-tag** is derived from the version string:

- A **prerelease** version (e.g. `0.0.1-beta.0`) publishes under the **`beta`** tag (the suffix
  before the first `.` becomes the tag, so `-next.0` → `next`, `-rc.1` → `rc`) and the GitHub
  Release is marked _pre-release_. `npm install ngx-signal-forms-renderer` does **not** pull it;
  only `npm install ngx-signal-forms-renderer@beta` does. `latest` stays untouched.
- A **plain** version (e.g. `0.0.1`) publishes to **`latest`**.

```bash
cd projects/ngx-signal-forms-renderer
npm version prerelease --preid beta   # 0.0.1-beta.0 -> 0.0.1-beta.1 -> ...
# when ready to promote to a stable release on `latest`:
npm version 0.0.1                     # (or: npm version patch/minor/major)
```

## Notes

- **Package name / orgs.** The package is published **unscoped** (`ngx-signal-forms-renderer`).
  Unscoped packages are standalone on the public registry; npm **orgs only apply to scoped names**
  (`@org/...`). So this never publishes under an org. Verify any time with a dry run from the built
  output:
  ```bash
  ng build ngx-signal-forms-renderer
  cd dist/ngx-signal-forms-renderer && npm publish --dry-run
  ```
  It prints `name: ngx-signal-forms-renderer` (no scope) and the target registry.
- **Provenance** requires a public repo and `id-token: write` (declared in the workflow).
- **Trusted publishing (optional).** After the first publish you can configure an npm
  [Trusted Publisher](https://docs.npmjs.com/trusted-publishers) (OIDC) for this repo and remove the
  `NPM_TOKEN` secret entirely.
- **Pre-1.0.** While on `0.x`, treat any release as potentially breaking (semver allows it).
- The demo site deploy (GitHub Pages, `.github/workflows/deploy.yml`) is separate from publishing.
