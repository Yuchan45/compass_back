# NestJS Architecture Review

## Module Boundaries

- Keep domain code under `src/modules/<domain>` with controller, service, DTOs, and local types.
- Controllers should contain routing decorators, guards, param/body extraction, and one service call.
- Services should own business rules, ownership checks, Prisma calls, transactions, and exception mapping.
- Put reusable helpers in `src/common`; avoid duplicating parsing, serialization, guards, decorators, and public mappers.
- Avoid adding repository layers, abstract factories, or broad shared modules unless the diff creates a real dependency boundary.
- Keep module exports narrow. Export only providers/modules needed by another module.

## REST And API Contracts

- Preserve the existing `/api` prefix and route style.
- Use resource nouns. Use action subroutes only when the existing API pattern already does, such as `/friendships/:id/accept`.
- Protected endpoints must use `JwtAuthGuard` and derive actor identity from `CurrentUser`.
- Do not accept request-body user IDs as the actor when a JWT is available.
- Use DTO classes with `class-validator`; rely on the global validation pipe.
- Validate params before database access. Use `parseId` before converting request string IDs to `BigInt`.
- Throw Nest HTTP exceptions with clear, stable messages. Avoid leaking internal details.
- Return public DTO-shaped data, not raw Prisma records that contain private fields or `bigint`.
- Use `serializeBigInts` or explicit public mappers for API responses containing `bigint`.

## WebSocket Patterns

- Verify JWTs during Socket.IO connection setup.
- Keep socket state minimal and derived from verified auth.
- Join authenticated users to `user:{id}` rooms.
- Enforce friendship/visibility rules before emitting or accepting location events.
- Do not trust user IDs or room names provided by clients.

## Review Smells

- Controller contains branching business logic, Prisma calls, hashing, token creation, or transaction handling.
- Service returns raw database models with private fields.
- DTOs are missing for new or changed request bodies.
- New route bypasses existing auth/decorator conventions.
- Shared behavior is copied instead of reusing `src/common` helpers.
- Module exports expose more than the next caller needs.
- Response shape changes without tests or updated callers.
