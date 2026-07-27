# Swagger And OpenAPI Guide

Use this guide when REST controllers, DTOs, auth metadata, API examples, or Swagger setup changes.

## Current State

The repo may not have Swagger installed yet. Before documenting Swagger behavior, inspect `package.json`, `src/main.ts`, controllers, and DTOs for `@nestjs/swagger`, `SwaggerModule`, `DocumentBuilder`, and `@Api*` decorators.

## When Swagger Exists

- Keep Swagger decorators aligned with real DTO validation and controller behavior.
- Document auth requirements with bearer/JWT metadata where protected endpoints use `JwtAuthGuard`.
- Use accurate tags by domain, such as auth, users, friendships, and locations.
- Keep request body examples consistent with DTO fields and validators.
- Keep response examples public-safe. Never include `passwordHash`, provider tokens, secrets, or raw private fields.
- Document API IDs as strings even when database IDs are `BigInt`.
- Update Swagger docs when route paths, params, DTO fields, status behavior, or response shapes change.

## When Swagger Does Not Exist

- Do not claim Swagger is available.
- If the task is to add Swagger, implement it deliberately:
  - Add the needed NestJS Swagger dependency.
  - Configure `SwaggerModule` in bootstrap code.
  - Document the Swagger route, usually `/api/docs` or the route chosen by the implementation.
  - Add DTO/controller decorators for public contract clarity.
  - Update `README.md` and, if detailed conventions are needed, create `docs/swagger.md`.

## Documentation Targets

- `README.md`: mention the Swagger URL and setup briefly.
- `docs/api.md`: keep human-readable API contract details if needed.
- `docs/swagger.md`: document Swagger conventions, route, generation/export commands, and decorator expectations.
- `CHANGELOG.md`: mention new Swagger availability or breaking API contract changes.

## Review Smells

- Swagger says an endpoint is public but code uses `JwtAuthGuard`, or the opposite.
- DTO validators allow different fields than Swagger documents.
- Examples include private fields or raw Prisma records.
- Swagger route is documented but not configured in code.
- OpenAPI schema is updated without matching controller/DTO changes.
