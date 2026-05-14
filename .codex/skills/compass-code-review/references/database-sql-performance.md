# Database, SQL, And Performance Review

## Prisma Schema And Migrations

- Treat `prisma/schema.prisma` as the source of truth.
- Every schema change needs a matching migration under `prisma/migrations/<timestamp>_<name>/migration.sql`.
- Do not edit old migrations unless explicitly requested and the database lifecycle is understood.
- Check migrations against existing data: nullability, defaults, unique constraints, backfills, destructive changes, table rewrites, and lock risk.
- Regenerate Prisma Client after schema changes with `npm run prisma:generate`.
- Apply local migrations with `npm run prisma:migrate:dev` only when local DB state and migration intent are clear.

## Model And API Boundaries

- Database IDs are `BigInt`; API-facing IDs are strings.
- Use `parseId` before querying by request-provided IDs.
- Serialize raw `bigint` output with `serializeBigInts` or map to public string IDs.
- Reuse `userPublicSelect` and `mapToPublicUser` for user responses.
- Keep unique constraints for identity fields such as email, username, and provider subject IDs.
- Prefer nullable provider-specific fields over fake values for users without a local password.

## Query Correctness

- Use transactions when multiple writes must succeed or fail together.
- Ensure relation filters include the authenticated actor or visibility boundary.
- Avoid partial writes that leave friendships, users, auth providers, or location state inconsistent.
- Check nullable fields before hashing, comparing, filtering, or returning them.
- Avoid raw SQL. If raw SQL is necessary, require parameter binding and a clear reason.

## Performance

- Look for N+1 queries, relation graph over-fetching, unbounded reads, missing pagination, and missing limits.
- Use narrow `select` statements, especially for user records and auth flows.
- Check filters and ordering against available indexes.
- Add indexes for common lookup/filter paths, especially relation IDs and time-series queries.
- For latest-location and location-history reads, order and index by user/time paths.
- Watch for migrations that rewrite large tables or add non-null columns without defaults/backfills.

## Review Smells

- `include` loads full users or deep relations for response mapping.
- Location or friendship endpoints read without pagination or limits.
- Multiple dependent writes happen outside a transaction.
- Migration adds a required column to a populated table without a safe default or backfill.
- Query converts IDs ad hoc instead of using `parseId`.
- API response contains raw `bigint` values or private Prisma fields.
