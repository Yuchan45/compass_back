# Backend Architecture And REST API

## Boundaries

- Keep modules under `src/modules/<domain>` with controller, service, DTOs, and local types.
- Keep controllers thin: route decorators, guards, params/body extraction, and one service call.
- Keep services responsible for business rules, ownership checks, Prisma calls, and exception mapping.
- Put cross-cutting helpers in `src/common`; avoid duplicating parse, serialization, guard, and decorator logic.
- Do not introduce repository layers or abstract factories unless a real dependency boundary appears.

## NestJS Practices

- Use dependency injection through constructors.
- Use DTO classes with `class-validator`; rely on the global `ValidationPipe`.
- Throw Nest HTTP exceptions with clear, stable messages.
- Keep module exports narrow; export only services/modules needed by other modules.
- Prefer constants for shared role/status/provider codes.

## REST API Design

- Preserve `/api` prefix and existing route style.
- Use nouns for resources and clear action subroutes where the existing API already does, such as `/friendships/:id/accept`.
- Return public DTO-shaped data, not raw Prisma records when they contain private fields or `bigint`.
- Keep protected endpoints behind `JwtAuthGuard` and derive actor identity from `CurrentUser`, not request body.
- Make new response shapes explicit in local types when they are reused.
