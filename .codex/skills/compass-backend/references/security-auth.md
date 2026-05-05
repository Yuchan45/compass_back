# Security, Auth, And Input Validation

## JWT Auth

- Internal JWT payload is `{ sub, email, username }`.
- Use `JwtAuthGuard` and `CurrentUser` for protected REST endpoints.
- For Socket.IO, verify the JWT during connection and store only the authenticated user data needed in socket state.
- Never accept user IDs from the body as the actor identity when a JWT is present.

## Google Sign-In

- Verify Google ID tokens on the backend using `google-auth-library`.
- Validate `aud` against `GOOGLE_CLIENT_ID`, `iss`, expiration, `sub`, `email`, and `email_verified`.
- Store Google `sub` as `googleSub`; do not use email as the stable provider identity.
- Do not store Google access tokens unless a future feature explicitly requires Google API calls.
- Keep `GOOGLE_CLIENT_ID` public-safe but keep secrets and private keys out of frontend code and logs.

## API Security

- Keep global validation strict: whitelist input and reject non-whitelisted fields.
- Use DTO-level constraints for length, format, optionality, and numeric string IDs.
- Avoid returning `passwordHash`, provider tokens, raw secrets, stack traces, or internal config.
- Check ownership and friendship visibility before returning user/location data.
- Prefer generic auth failure messages for login and token failures.

## OWASP-Oriented Checks

- Validate all request bodies, params, and auth-derived IDs before database access.
- Avoid mass assignment by passing explicit `data` objects to Prisma.
- Use narrow CORS origins in deployed environments.
- Do not log precise location payloads, JWTs, ID tokens, or credentials.
- Keep dependency changes deliberate and run `npm audit` only when the user asks for dependency review.
