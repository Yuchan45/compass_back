# API Docs Guide

Use this guide when REST controllers, DTOs, guards, response mappers, or service behavior change.

## Source Files To Inspect

- Controllers for route path, method, guards, params, query, body, and status behavior.
- DTOs for fields, validation, optionality, and examples.
- Swagger/OpenAPI decorators for published contract metadata when present.
- Services for business rules, authorization, exceptions, response mapping, and transactions.
- Auth decorators/guards for actor identity and protected routes.
- Tests for expected edge cases.

## What To Document

- Method and path, including `/api` prefix when documenting public URLs.
- Auth requirement.
- Request params, query, and body fields.
- Response shape at a useful level of detail.
- Swagger/OpenAPI route and metadata if API docs are configured.
- Important errors or business rules.
- ID format: API IDs are strings backed by database `BigInt`.
- Privacy and ownership rules when relevant.

## Examples

Use minimal JSON examples when fields are not obvious. Keep examples consistent with DTO validation and public mappers.

## Avoid

- Documenting raw Prisma models as API responses.
- Exposing `passwordHash`, provider tokens, or internal auth payloads.
- Guessing status codes without checking controller/service behavior.
- Documenting an endpoint before it exists in code.
- Letting human API docs and Swagger/OpenAPI drift apart.
