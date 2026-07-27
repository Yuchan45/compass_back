---
name: compass-commit
description: Safe commit preparation workflow for the Compass backend. Use when Codex is asked to prepare, split, stage, write, or create git commits; generate Conventional Commit messages; verify changes before commit; avoid committing secrets or unrelated files; or decide which checks to run before committing NestJS, Prisma, docs, Swagger, Socket.IO, auth, or test changes. Commit only with explicit user approval.
---

# Compass Commit

## Purpose

Prepare small, reviewable commits for the Compass backend without accidentally staging unrelated changes, secrets, generated noise, or unfinished work.

This skill can prepare a commit plan and message automatically. It must not run `git commit` unless the user explicitly asks to commit or approves the exact commit plan.

## Commit Workflow

1. Inspect current state:
   - `git status --short`
   - `git diff --stat`
   - `git diff --check`
   - targeted `git diff` for changed files.
2. Classify changes with `references/change-classification.md`.
3. Identify unrelated changes and untracked files. Do not stage files that are outside the requested commit.
4. Check for sensitive or accidental content using `references/safety-checklist.md`.
5. Decide verification commands using `references/verification-policy.md`.
6. Propose one atomic commit or multiple commits if the diff mixes unrelated concerns.
7. Generate a Conventional Commit message using `references/message-style.md`.
8. Ask for explicit approval before staging/committing unless the user already gave a direct instruction such as "commit these changes".
9. Stage only the approved files, then run `git status --short` again before committing.
10. Commit with the approved message. Report the resulting commit hash if available.

## Hard Rules

- Never use `git add .` unless the user explicitly approves staging all current changes after seeing the status.
- Never commit `.env`, secrets, credentials, tokens, local logs, cache files, build output, or unrelated generated files.
- Never revert, discard, or overwrite user changes to make a commit cleaner.
- Never amend, rebase, reset, squash, or force-push unless the user explicitly requests that operation.
- Never include untracked files just because they exist. Explain why each untracked file belongs in the commit.
- If checks fail, do not commit unless the user explicitly asks to commit despite the failure.
- If the working tree contains unrelated changes, propose separate commits or ask which subset to commit.

## Default Commit Types

- `feat`: new endpoint, behavior, module, Swagger route, Socket.IO event, or user-visible capability.
- `fix`: bug fix, security/privacy correction, broken validation, wrong response, bad query, or regression.
- `docs`: README, changelog, diagrams, Swagger docs, API docs, or comments-only documentation.
- `test`: test-only additions or updates.
- `refactor`: behavior-preserving code restructuring.
- `perf`: performance improvement with same behavior.
- `chore`: tooling, package metadata, dependency maintenance, scripts, formatting configuration.
- `build`: build system, dependency lockfile, Nest/TypeScript build changes.

Use scopes when useful: `auth`, `users`, `friendships`, `locations`, `swagger`, `docs`, `prisma`, `realtime`, `config`, `tests`.

Use `feat(scope): description` for new features. Do not use `feature(scope): description`.

## Approval Language

If the user asks "prepare a commit", stop after the plan, checks, and proposed message.

If the user asks "commit it", "create the commit", or approves the exact plan, stage and commit the approved files.

Before committing, state:

- Files to stage.
- Verification already run and result.
- Exact commit message.

## Output

For preparation-only requests, return:

- Proposed commit split.
- Files per commit.
- Checks to run or already run.
- Proposed message.
- Risks or blocked items.

For completed commits, return:

- Commit hash and message.
- Files included.
- Checks run.
- Any residual risk.
