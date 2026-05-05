---
name: compass-backend
description: Backend engineering guide for the Compass location-sharing app. Use when Codex works in or discusses this NestJS, Prisma, PostgreSQL, JWT authentication, Google Sign-In, Socket.IO real-time location backend; when adding modules, controllers, services, DTOs, Prisma models/migrations, auth guards, friendship/location flows, tests, or refactors; or when asked to preserve the project's architecture and best practices.
---

# Compass Backend

## Workflow

1. Inspect the repo before changing behavior. Read nearby modules, DTOs, Prisma schema, migrations, and tests instead of inventing patterns.
2. Keep NestJS modules thin and consistent: controllers handle routing, DTOs validate input, services contain business logic, Prisma stays behind services.
3. Preserve the existing API contract unless the user explicitly asks for a breaking change.
4. Treat auth, IDs, and real-time location data as sensitive surfaces. Prefer explicit validation, ownership checks, and narrow Prisma selects.
5. Run focused verification after changes. Prefer `npm run check` and `npm run test`; run Prisma commands when schema/client changes.

## Project References

Read only the reference files needed for the task:

- `references/architecture.md`: clean architecture, NestJS module boundaries, REST conventions.
- `references/prisma-postgres.md`: Prisma schema, migrations, PostgreSQL and SQL performance.
- `references/security-auth.md`: JWT, Google Sign-In, API security, input validation, OWASP concerns.
- `references/testing.md`: unit testing approach and verification commands.
- `references/location-privacy.md`: real-time location handling, friendship visibility, privacy rules.
- `references/project-guide.md`: compact all-in-one project summary when a task cuts across several areas.

## Local Rules

- Use `parseId` before converting request string IDs to DB `BigInt`.
- Use `serializeBigInts` or public mappers before returning objects that contain raw `bigint`.
- Reuse `userPublicSelect` and `mapToPublicUser` for user responses.
- Keep passwords and provider secrets out of responses and logs.
- For Google auth, validate ID tokens server-side and store Google `sub` as `googleSub`; do not treat email as the stable identity.
- For protected REST endpoints, use `JwtAuthGuard` and `CurrentUser`.
- For WebSocket auth, verify the JWT at connection time and join the `user:{id}` room.
- Add Prisma migrations for schema changes and regenerate Prisma Client.

## Verification

Use the smallest useful check first, then broaden:

- Type/build or broad validation: `npm run check`
- Unit tests: `npm run test`
- Prisma client update: `npm run prisma:generate`
- Local migration: `npm run prisma:migrate:dev`

If a command cannot run because of environment, permissions, database availability, or Windows file locks, report the blocker and the command that should be run next.
