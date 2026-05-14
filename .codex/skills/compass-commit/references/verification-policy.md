# Verification Policy

Choose the smallest useful verification before commit.

## Always Consider

- `git diff --check`: whitespace/conflict marker sanity.
- `npm run check`: format check, lint, and build.

## Run `npm run check`

Run for TypeScript source changes, config changes, package changes, Swagger decorators/setup, Prisma client-facing code, or test changes.

## Run `npm run test`

Run when business logic, services, auth, guards, DTO validation, mappers, Prisma behavior, or controllers with tests changed.

## Prisma Commands

- `npm run prisma:generate`: after `prisma/schema.prisma` changes.
- `npm run prisma:migrate:dev`: only when a local DB migration is intended and environment is ready.

## Docs-Only Changes

For README/docs/changelog/skill-only changes, tests are usually not required. Still run `git diff --check`.

## Failed Checks

If a check fails:

- Stop before commit.
- Explain the failing command and relevant output.
- Fix if the failure is in the requested scope.
- Do not commit with failed checks unless the user explicitly approves committing despite the failure.
