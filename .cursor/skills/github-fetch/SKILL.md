---
name: github-fetch
description: Fetch GitHub repository information using the GitHub CLI (gh)—issues, pull requests, workflow runs, failed job logs, and run details. Use when the user asks about GitHub issues, PRs, CI failures, workflow runs, or why something failed on GitHub.
---

# GitHub fetch (gh CLI)

Use the **GitHub CLI** (`gh`) to fetch repository information. Ensure `gh` is installed and authenticated (`gh auth status`). Run commands from the repo root or pass `--repo owner/name`.

## Issues

- **List issues**: `gh issue list` — add `-s open|closed|all`, `-L N`, `--assignee @me`, `--author USER`
- **View one**: `gh issue view <number>` or `gh issue view <url>`
- **With comments**: `gh issue view <number> --comments`

## Pull requests

- **List PRs**: `gh pr list` — add `-s open|closed|merged|all`, `-L N`, `--author USER`, `--base BRANCH`
- **View one**: `gh pr view <number>` or `gh pr view <url>`
- **PR checks**: `gh pr checks <number>` — status of CI for that PR
- **PR diff**: `gh pr diff <number>`

## Workflow runs (Actions)

- **List runs**: `gh run list` — add `-w WORKFLOW_NAME`, `-L N`, `--status failure|success|in_progress`
- **View one run**: `gh run view <RUN_ID>` — shows summary and jobs
- **Why it failed**:  
  - `gh run view <RUN_ID>` — see failed jobs in the summary  
  - `gh run view <RUN_ID> --log-failed` — logs only from failed jobs (or `--log` for full logs)
- **List workflows**: `gh workflow list` — get workflow names for `-w`

Use **run ID** from `gh run list` (first column) with `gh run view <RUN_ID>`.

## Quick reference

| Task              | Command |
|-------------------|--------|
| Open issues       | `gh issue list -s open` |
| Recent PRs        | `gh pr list -L 10` |
| Failed runs       | `gh run list --status failure` |
| Why run failed    | `gh run view <RUN_ID> --log-failed` |
| Repo elsewhere    | `gh issue list --repo owner/repo` |

## Notes

- If `--log-failed` returns no output, try `gh run view <RUN_ID> --log` and scan for errors, or use a recent `gh` version (fallback log fetching was improved).
- For JSON: add `--json field1,field2` to list commands (e.g. `gh run list --json databaseId,conclusion,name`).
