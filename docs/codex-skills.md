# Codex Skills

This repository includes local Codex skills under `.codex/skills`. They do not create separate agents or background processes. They give Codex project-specific instructions so it can adopt the right role for the task.

## Available Skills

| Skill | Use it for |
| --- | --- |
| `$compass-backend` | Implement or modify Compass backend code while respecting NestJS, Prisma, PostgreSQL, JWT, Socket.IO, and project conventions. |
| `$compass-documentation` | Keep README, docs, Swagger/OpenAPI notes, diagrams, changelog, API contracts, and developer workflow documentation synchronized with code changes. |
| `$compass-code-review` | Review PRs or diffs for architecture, security, SQL, performance, naming, NestJS patterns, and test risk. |
| `$compass-commit` | Prepare safe atomic commits with explicit staging, checks, Conventional Commit messages, and user approval before committing. |

## Recommended Workflow

For implementation work:

```text
Use $compass-backend to implement <change>.
Use $compass-documentation to update affected docs.
Use $compass-code-review to review the changes.
Use $compass-commit to prepare a safe atomic commit.
```

For documentation-only work:

```text
Use $compass-documentation to update <docs>.
Use $compass-commit to prepare a safe atomic commit.
```

For reviewing existing changes:

```text
Use $compass-code-review to review the current diff.
```

For committing approved changes:

```text
Use $compass-commit to commit only the approved files.
```

## Commit Control

`$compass-commit` may prepare a plan, propose commit splits, run checks, and write a commit message. It should only stage and commit after explicit approval or a direct request such as "commit it" or "create the commit".

## When Documentation Is Needed

Run `$compass-documentation` when changes affect:

- Public REST endpoints, DTOs, request/response contracts, or Swagger/OpenAPI behavior.
- Socket.IO events, payloads, rooms, or location visibility rules.
- Prisma schema, migrations, indexes, or data model behavior.
- Environment variables, setup, scripts, or developer workflow.
- Architecture, diagrams, security/privacy behavior, README, or changelog.

For internal skill-only changes, document the workflow here instead of expanding product API docs.
