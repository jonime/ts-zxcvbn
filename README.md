# ts-zxcvbn

This is typescript version of [zxcvbn](https://github.com/dropbox/zxcvbn)

The package supports both CommonJS and ES module consumption: use `require('ts-zxcvbn')` or `import zxcvbn from 'ts-zxcvbn'`.

## Automated npm releases

This repository is configured for automated semantic versioning and npm publishing via
[`semantic-release`](https://semantic-release.gitbook.io/semantic-release/).

### How version bumps are decided

Release type is inferred from Conventional Commit messages:

- `fix:` → patch release (e.g. `1.2.3` → `1.2.4`)
- `feat:` → minor release (e.g. `1.2.3` → `1.3.0`)
- `feat!:` or commits with `BREAKING CHANGE:` footer → major release (e.g. `1.2.3` → `2.0.0`)

### CI release workflow

On every push to `main` or `master`, GitHub Actions will:

1. install dependencies
2. run tests
3. build the package
4. run `semantic-release`

If releasable commits are present, it will publish to npm and create a GitHub release.

### npm Trusted Publishing (no npm tokens)

Publishing uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) with OIDC. You do **not** need to create or store any npm tokens.

Setup:

1. In npm: package → **Settings** → **Trusted publishers** → Add **GitHub Actions**, and register this repo and workflow file (`.github/workflows/publish.yml`).
2. In this repo: keep the `id-token: write` permission in `publish.yml` (already set).

`GITHUB_TOKEN` is provided automatically by Actions. No `NPM_TOKEN` or other npm secrets are used.
