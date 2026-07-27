# Compass Backend Project Guide

## Architecture

- Stack: NestJS 11, TypeScript, Prisma 6, PostgreSQL, Passport JWT, Socket.IO.
- Entry points: `src/main.ts` sets `/api`, Helmet, CORS, global validation, and HTTP exception filter.
- Root module: `src/app.module.ts` wires config, health, auth, users, friendships, locations, and realtime modules.
- Modules live under `src/modules/<domain>` with `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs, and local types as needed.
- Shared infrastructure lives under `src/common`, `src/config`, and `src/database`.

## Data Model

- Prisma source of truth: `prisma/schema.prisma`.
- IDs are PostgreSQL `BIGINT`; API-facing IDs are strings.
- Existing user fields include email, username, display name, optional avatar, nullable password hash, optional Google subject, language, role, friendships, and locations.
- Add migrations under `prisma/migrations/<timestamp>_<name>/migration.sql`; do not edit old migrations unless the user explicitly asks and the DB state permits it.
- After schema changes, run `npm run prisma:generate`; for local DB application run `npm run prisma:migrate:dev`.

## Auth

- Internal app auth uses JWT payload `{ sub, email, username }`.
- REST protection uses `JwtAuthGuard` and `CurrentUser`.
- Classic register/login still use bcrypt password hashes.
- Google login verifies a Google ID token with `google-auth-library`, checks audience against `GOOGLE_CLIENT_ID`, requires verified email, and persists Google `sub` in `users.google_sub`.
- Never expose `passwordHash`, provider tokens, or secrets.

## API Patterns

- Controllers should only parse route/body context and call services.
- DTOs should use `class-validator`; global validation already whitelists and rejects non-whitelisted fields.
- Services should throw Nest HTTP exceptions (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, `ConflictException`) with clear messages.
- Use narrow Prisma `select`/`include`; avoid returning full user records.
- Use public response mappers for users and `serializeBigInts` for raw Prisma objects containing `bigint`.

## Friendships And Locations

- Friend requests must prevent self-request and duplicate bidirectional friendships.
- Accept/decline operations must verify the current user is the addressee and the request is pending.
- Location reads should only expose accepted friends' latest locations.
- Location writes should update `lastSeenAt` when appropriate and return serializable values.

## Realtime

- Gateway namespace is `/locations`.
- Accept JWT from `handshake.auth.token` or `Authorization: Bearer ...`.
- On successful connection, store the authenticated user in socket data and join `user:{id}`.
- Broadcast friend location updates only to accepted friend rooms.

## Coding Standards

- Follow repo formatting: 2 spaces, single quotes, semicolons, max width 100.
- Prefer existing helpers and constants over duplicating logic.
- Keep changes scoped; avoid unrelated refactors.
- Add focused tests for new auth, validation, ownership, query, or realtime behavior.
- Run `npm run check` before finishing when feasible.
