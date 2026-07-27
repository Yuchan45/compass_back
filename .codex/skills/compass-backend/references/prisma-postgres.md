# Prisma, PostgreSQL, And Schema Design

## Schema Changes

- Treat `prisma/schema.prisma` as the source of truth.
- Add a migration in `prisma/migrations/<timestamp>_<name>/migration.sql` for every DB schema change.
- Do not edit old migrations unless explicitly requested and the database lifecycle is understood.
- Regenerate the Prisma Client after schema changes with `npm run prisma:generate`.
- Apply local migrations with `npm run prisma:migrate:dev`.

## Model Rules

- Database IDs are `BigInt`; API-facing IDs are strings.
- Use `parseId` before querying by request-provided IDs.
- Add indexes for common lookup/filter paths, especially relation IDs and time-series queries.
- Keep unique constraints for identity fields such as email, username, and provider subject IDs.
- Prefer nullable provider-specific fields over fake values for users without a local password.

## Query Practices

- Use narrow `select` statements for user records; reuse `userPublicSelect`.
- Avoid loading full relation graphs unless the endpoint needs them.
- Use transactions when multiple writes must succeed or fail together.
- For location history and latest-location reads, order and index by user/time paths.
- Serialize raw `bigint` output with `serializeBigInts` or map it to public string IDs.
