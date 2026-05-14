# Swagger

Compass exposes Swagger UI for the REST API when the NestJS app is running.

## URL

```text
GET /api/docs
```

The route uses the same `/api` global prefix as the REST API.

## Conventions

- Controllers are grouped by domain tags: health, auth, users, friendships, and locations.
- Protected endpoints use bearer JWT metadata.
- DTO decorators describe request bodies and examples.
- API-facing IDs are documented as strings because database IDs are `BigInt`.
- Response descriptions must stay public-safe and must not expose `passwordHash`, provider tokens, secrets, or raw private Prisma fields.

## Maintenance

Update Swagger decorators when changing:

- Controller paths, methods, params, or auth guards.
- DTO fields, validators, optionality, or examples.
- Public response behavior or status codes.
- Auth, friendship, location visibility, or privacy rules.

Run the normal project verification after Swagger changes:

```bash
npm run check
```
