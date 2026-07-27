# Security And Privacy Review

## Authentication

- JWT payload is `{ sub, email, username }`.
- Protected REST endpoints must use `JwtAuthGuard` and `CurrentUser`.
- WebSocket connections must verify JWTs before joining rooms or accepting events.
- Login and token failures should use generic messages where credential probing is possible.
- Do not log JWTs, OAuth ID tokens, passwords, password hashes, or credentials.

## Authorization And Ownership

- Confirm every user-scoped read or write checks the authenticated actor.
- Check friendship, visibility, ownership, or role rules before returning profiles, friendships, or location data.
- Watch for IDOR issues where `:id`, body IDs, query IDs, or socket payload IDs can access another user's data.
- Avoid trusting client-provided actor IDs, room IDs, or provider identities.
- Sensitive mutations should be idempotent or protected against duplicate submits where repeated calls are realistic.

## Google Sign-In

- Verify Google ID tokens server-side using `google-auth-library`.
- Validate audience against `GOOGLE_CLIENT_ID`, issuer, expiration, `sub`, `email`, and `email_verified`.
- Store Google `sub` as `googleSub`; do not treat email as the stable provider identity.
- Do not store Google access tokens unless a future feature explicitly requires Google API calls.

## Input And Output Safety

- Validate bodies, params, queries, headers, and socket payloads before use.
- Keep global validation strict: whitelist expected fields and reject non-whitelisted fields.
- Avoid mass assignment by passing explicit Prisma `data` objects.
- Never return `passwordHash`, provider tokens, secrets, private config, stack traces, internal errors, or precise internal state.
- Do not expose precise location payloads to users who fail friendship/visibility checks.

## Config, Logs, And Deployment

- Keep secrets out of committed files, client-visible env vars, logs, and error responses.
- Deployed CORS should use narrow origins, not broad wildcard trust.
- Treat `.env` as local-only and `.env.example` as public-safe.
- Dependency changes deserve extra review when they affect auth, parsing, serialization, network access, or crypto.

## Review Smells

- Actor identity comes from request body instead of JWT state.
- Query filters use only target IDs and omit actor/ownership constraints.
- Socket event handler trusts client room or user ID.
- New logs include tokens, credentials, coordinates, or personal data.
- Raw SQL, dynamic evaluation, shell commands, path access, or URL fetches are built from untrusted input.
