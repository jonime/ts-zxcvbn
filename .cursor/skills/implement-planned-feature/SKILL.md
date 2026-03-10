---
name: implement-planned-feature
description: Implements a previously agreed plan by creating a branch, implementing changes and tests where needed, running the test suite, and opening a PR. Use when the user asks to implement a planned feature, execute the plan, or do the full flow (branch, implement, test, PR).
---

# Implement Planned Feature

When the user asks to implement a planned feature or execute the plan, follow this workflow. The plan comes from the current conversation (e.g. a confirmed plan or CreatePlan output).

## 1. Branch

- Ensure working tree is clean. If there are uncommitted changes, stash or commit them only if the user is okay with it; otherwise ask.
- Create a branch from the default branch (`main` or `master`). Use `git branch` or check the remote to determine which exists.
- Branch name: `feat/short-description` or `feature/<plan-summary>`, derived from the plan title or a short summary (lowercase, hyphens).

```bash
git checkout main   # or master
git pull
git checkout -b feat/short-description
```

## 2. Implement

- Apply the plan: make the code and config changes described in the plan.
- Add or update tests when adding or changing behavior; include test coverage when the plan implies new or modified behavior.
- Follow existing project style and structure.

## 3. Run tests

- Run the project’s test command. Do not open a PR until tests pass.
- If tests fail: fix the code or tests, then re-run until the suite is green.

**In this repo**: `npm test` (Jest + packaging tests). Run from repo root.

## 4. Commit and create PR

- Stage changes: `git add` (only what the plan covers).
- Commit with a clear message. This repo uses semantic-release, so prefer conventional commits (e.g. `feat(scope): description` or `fix(scope): description`).
- Push the branch: `git push -u origin <branch-name>`.
- Create the PR with GitHub CLI (requires `gh` installed and authenticated, e.g. `gh auth status`):

```bash
gh pr create --title "Title from plan" --body "Summary of changes. Optionally reference the plan or issue."
```

- PR body: brief summary of what changed and why; link to plan or issue if relevant.

## Project-specific (ts-zxcvbn)

- Default branch: `main` or `master` (see `.github/workflows/ci.yml`).
- Test: `npm test`.
- Use `gh` for PR creation; ensure `gh auth status` succeeds before creating the PR.

When you copy this skill to another repo (e.g. `~/.cursor/skills/`), adjust or generalize the “In this repo” / “Project-specific” section for that project’s test command and default branch.
