---
name: compass-code-review
description: Compass backend code review agent for PRs, diffs, commits, architecture changes, NestJS modules, Prisma/PostgreSQL schema and SQL, security/auth, location privacy, performance, naming conventions, and test risk. Use when Codex is asked to review a pull request, inspect a diff, audit backend implementation quality, assess security or performance, enforce NestJS patterns, or evaluate database/migration safety in the Compass backend.
---

# Code Review Agent

## Review Contract

Act as a risk-focused reviewer for the Compass NestJS backend. Prefer concrete defects, security issues, data integrity problems, performance risks, API contract regressions, and missing tests over broad style commentary.

Combine this skill with the local `compass-backend` skill when available. Load only the reference files that match the changed area.

## Workflow

1. Determine the review target: PR URL, branch diff, commit range, staged diff, working tree diff, or named files.
2. Inspect the diff first, then read enough surrounding code to understand contracts, callers, DTOs, guards, services, Prisma queries, migrations, and tests.
3. Classify touched areas and load the matching references:
   - `references/nestjs-architecture.md` for modules, controllers, services, DTOs, guards, WebSocket patterns, and API contracts.
   - `references/security-privacy.md` for auth, authorization, Google Sign-In, JWT, secrets, validation, IDOR, and location privacy.
   - `references/database-sql-performance.md` for Prisma schema, migrations, SQL, indexes, transactions, query shape, and performance.
   - `references/naming-and-style.md` for project naming conventions, file layout, DTO names, route naming, and style checks.
   - `references/review-output.md` for severity, output format, and verification reporting.
4. Check the project-specific rules before generic preferences: `parseId`, `serializeBigInts`, `userPublicSelect`, `mapToPublicUser`, `JwtAuthGuard`, `CurrentUser`, and Socket.IO `user:{id}` rooms.
5. Run the smallest useful verification when it is practical:
   - `npm run check` for format, lint, and build.
   - `npm run test` when business logic, auth, services, or mappers changed.
   - `npm run prisma:generate` after Prisma schema changes.
   - `npm run prisma:migrate:dev` only when local DB state and migration intent are clear.
6. Report findings first, ordered by severity. Include exact file/line references and concrete fix direction.

## Review Priorities

- Security and privacy: broken auth, missing ownership checks, cross-user data leaks, token misuse, secret exposure, precise location leakage, unsafe logs.
- Data correctness: broken BigInt handling, unsafe migrations, missing transactions, nullability mistakes, invalid status transitions, raw Prisma records in responses.
- API contracts: breaking response shapes, missing validation, route behavior regressions, inconsistent HTTP exceptions.
- Performance: unbounded queries, missing pagination, missing indexes, N+1 patterns, over-fetching, expensive migrations.
- NestJS architecture: bloated controllers, business logic outside services, DTO gaps, broad module exports, duplicated helpers, improper dependency injection.
- Naming and maintainability: misleading domain names, inconsistent DTO/file names, unclear route names, test names that hide behavior, style drift that makes review or maintenance harder.
- Tests: missing negative auth cases, ownership cases, migration/data scenarios, service edge cases, and regression tests for fixed bugs.

## Review Stance

Do not approve by checklist alone. Trace the changed behavior through request input, auth state, service rules, database writes/reads, response mapping, and tests.

Do not report pure preference as a finding. If naming, style, or architecture is mentioned, tie it to a concrete maintenance, correctness, security, or performance risk.

## Output

Use the format in `references/review-output.md`.

If no issues are found, say that clearly and still mention verification run and residual risk.
