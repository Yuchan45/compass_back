# Backend Testing And Verification

## Test Scope

- Add unit tests for new service business rules, auth edge cases, ownership checks, and validation-heavy behavior.
- Mock Prisma and external providers for service unit tests.
- Keep controller tests focused on routing/guards only when controller behavior is non-trivial.
- Add regression tests for bugs before or alongside the fix.

## Auth Test Cases

- Password login succeeds only with a non-null valid password hash.
- Google login rejects invalid tokens, wrong audience, missing subject, and unverified email.
- Google login links an existing verified-email account without duplicating users.
- Protected flows reject unauthenticated or wrong-actor requests.

## Location/Friendship Test Cases

- Users cannot friend themselves.
- Duplicate bidirectional friendships are rejected.
- Accept/decline requires the current user to be the addressee.
- Latest friend locations include only accepted friends.

## Commands

- Run `npm run check` for format, lint, and build.
- Run `npm run test` for Jest tests.
- Run `npm run prisma:generate` after schema changes.
- If a command fails from missing env, DB, network, or Windows locks, report the concrete blocker and command.
