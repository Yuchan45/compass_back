# Documentation Impact Map

Use this map to decide whether documentation needs updates.

## Always Check Docs

- `src/**/*.controller.ts`: route path, method, guards, params, body, response behavior.
- `src/**/*.gateway.ts`: Socket.IO namespace, events, payloads, auth, emitted events.
- `src/**/*.dto.ts`: request fields, validation, optionality, examples.
- Swagger/OpenAPI decorators or bootstrap setup: generated API contract and docs route.
- `src/**/auth/**`, guards, decorators, strategies: auth setup and protected behavior.
- `prisma/schema.prisma`: model fields, relations, constraints, indexes, ID behavior.
- `prisma/migrations/**/migration.sql`: schema evolution and setup assumptions.
- `.env.example`, config files, Joi validation: environment variable documentation.
- `package.json`: scripts, engines, dependency-backed commands.
- `README.md` or `docs/**`: documentation consistency and links.
- `CHANGELOG.md`: release-note-worthy behavior and migration notes.

## Usually Check Docs

- Services that change business behavior, visibility rules, friendship rules, location rules, or response mapping.
- Shared helpers in `src/common` that affect API IDs, serialization, validation, or auth.
- Tests that reveal new expected behavior not documented elsewhere.
- Diagram-bearing docs when architecture, auth, data, friendship, location, or WebSocket flows change.

## Usually No Docs Needed

- Pure refactors that preserve public behavior.
- Internal test cleanup with no changed workflow.
- Formatting-only changes.
- Private implementation changes that do not affect setup, API, schema, auth, performance guidance, or developer workflow.

## Final Decision

If a public contract changes, update docs.

If only internal implementation changes, mention "Docs impact: none" in the final response when useful.
