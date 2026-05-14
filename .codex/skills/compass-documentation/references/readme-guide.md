# README Guide

`README.md` should stay short and useful for onboarding.

## Keep In README

- Project purpose in one or two sentences.
- Stack summary.
- Setup commands.
- Main scripts.
- Public API shape summary.
- Swagger/OpenAPI URL when configured.
- WebSocket namespace and event summary.
- Links to changelog and diagrams when they exist.
- Links to detailed docs when they exist.

## Update README When

- A public endpoint is added, removed, or renamed.
- Swagger/OpenAPI is added, moved, removed, or changes how developers access API docs.
- WebSocket event names, namespace, auth, or high-level usage changes.
- Setup commands, Node version, Prisma setup, env vars, or scripts change.
- A new detailed doc is created and should be discoverable.
- `CHANGELOG.md` is added and should be discoverable.
- Diagrams are added that clarify architecture or onboarding.
- The stack or core architecture changes.

## Avoid In README

- Full DTO schemas for every endpoint when `docs/api.md` exists.
- Long architecture explanations when `docs/architecture.md` exists.
- Secret values or local-only machine details.
- Future plans not represented in code.

## Style

- Keep command blocks copy-pasteable.
- Use exact `npm` script names from `package.json`.
- Keep endpoint bullets grouped by domain.
- Prefer short links to detailed docs instead of repeating detailed content.
