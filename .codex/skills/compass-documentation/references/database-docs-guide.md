# Database Docs Guide

Use this guide when Prisma schema, migrations, data model behavior, indexes, or setup assumptions change.

## Source Files To Inspect

- `prisma/schema.prisma`.
- Latest migration SQL files.
- Services that read/write affected models.
- Public mappers and serialization helpers.
- Tests for model behavior and migration-sensitive assumptions.

## What To Document

- Model purpose and important relations when useful to developers.
- ID behavior: database `BigInt`, API string IDs.
- Unique constraints and indexes that matter for query behavior.
- Migration/setup commands when they change.
- Any required local migration or client generation step.
- Data lifecycle or privacy-sensitive retention notes when relevant.

## Avoid

- Rewriting the whole Prisma schema in docs.
- Duplicating migration SQL unless the exact SQL is the point.
- Promising performance characteristics not enforced by indexes or queries.
- Documenting future model fields before they exist.
