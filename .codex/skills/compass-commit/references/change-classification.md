# Change Classification

Use this guide to decide whether a diff is one commit or several.

## Keep Together

- Code change and its matching tests.
- Code change and matching documentation/changelog updates.
- Dependency addition and code that uses it.
- Prisma schema change, migration, generated client lockfile changes, and related service updates.
- Swagger setup, Swagger decorators, README/docs/changelog updates for the same feature.

## Split Apart

- Unrelated features.
- Refactor plus behavior change when they can be separated.
- Formatting-only churn mixed with logic changes.
- Skill/configuration changes mixed with app runtime changes.
- Documentation updates for a different feature than the implementation.
- Dependency updates unrelated to the changed code.

## Compass-Specific Examples

- `feat(swagger)`: package changes, `main.ts` Swagger setup, controller/DTO decorators, README, `docs/swagger.md`, changelog.
- `fix(auth)`: auth service/controller changes, relevant DTO or guard changes, tests, security docs if behavior changed.
- `feat(locations)`: location endpoint/service changes, DTOs, Socket.IO docs if event behavior changed, tests.
- `docs(skills)`: `.codex/skills/**` changes only.

## Ambiguity Rule

If a change could belong to two commits, prefer the split that makes code review easiest and rollback safest.
