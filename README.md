# ts-zxcvbn

This is typescript version of [zxcvbn](https://github.com/dropbox/zxcvbn)

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

### npm trusted publishing

This workflow is configured for npm trusted publishing from GitHub Actions (OIDC).

Required setup:

- In npm package settings, add this GitHub repository/workflow as a trusted publisher.
- Keep `id-token: write` permission in `.github/workflows/publish.yml`.
- `GITHUB_TOKEN` is provided automatically by GitHub Actions.
- `NPM_TOKEN` is **not required** when trusted publishing is configured correctly.
