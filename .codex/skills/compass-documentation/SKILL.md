---
name: compass-documentation
description: Documentation maintenance guide for the Compass backend. Use when Codex adds, changes, reviews, or discusses backend behavior that affects README files, docs, API endpoints, Swagger/OpenAPI contracts, diagrams, changelogs, request/response contracts, environment variables, scripts, Prisma schema/migrations, auth flows, Socket.IO events, architecture, testing instructions, or developer workflow. Also use after implementation tasks to decide whether documentation should be updated.
---

# Compass Documentation

## Purpose

Keep Compass backend documentation synchronized with real code behavior. Treat documentation updates as part of the implementation, not as a separate afterthought.

This skill cannot run as a background hook by itself. It is designed to be invoked automatically by Codex when the task or diff touches documentation-relevant areas, or explicitly with `$compass-documentation`.

## Workflow

1. Inspect the changed files and the surrounding code before editing docs.
2. Classify the documentation impact using `references/doc-impact-map.md`.
3. Load the matching guide:
   - `references/readme-guide.md` for setup, stack, scripts, API shape, WebSocket summary, and onboarding.
   - `references/api-docs-guide.md` for REST endpoints, DTOs, params, auth, examples, and response contracts.
   - `references/swagger-openapi-guide.md` for Swagger/OpenAPI decorators, generated API docs, and contract drift.
   - `references/database-docs-guide.md` for Prisma schema, migrations, seed/setup assumptions, indexes, and data model notes.
   - `references/architecture-docs-guide.md` for NestJS modules, boundaries, auth, real-time flow, and cross-module behavior.
   - `references/diagrams-guide.md` for Mermaid diagrams, architecture diagrams, sequence diagrams, and data-flow diagrams.
   - `references/changelog-guide.md` for `CHANGELOG.md` entries and release notes.
   - `references/docs-quality-checklist.md` before finalizing.
4. Update the smallest set of docs that prevents stale or missing information.
5. Keep docs factual and derived from code. Do not invent behavior, future plans, endpoints, env vars, scripts, or guarantees.
6. If implementation changed but docs should not change, state that explicitly in the final response.

## Documentation Triggers

Update or evaluate docs when changes touch:

- Public REST routes, controllers, DTOs, guards, auth behavior, status codes, or response shapes.
- Swagger/OpenAPI decorators, schemas, examples, tags, auth metadata, or generated API contract behavior.
- Socket.IO namespace, auth, events, payloads, emitted events, rooms, or visibility rules.
- Prisma schema, migrations, model fields, indexes, relations, ID serialization, or data lifecycle.
- Environment variables, `.env.example`, config validation, external providers, or secrets setup.
- Package scripts, test commands, build commands, Prisma commands, or local setup.
- Module architecture, service responsibilities, shared helpers, or domain workflows.
- Diagrams that describe architecture, auth, friendship, location, database, or real-time flows.
- Changelog or release-note-worthy behavior such as new features, breaking changes, migrations, security fixes, or notable bug fixes.
- Security/privacy behavior that affects how developers or clients should use the API.
- README onboarding, project overview, stack, or troubleshooting.

## Target Docs

Current project docs:

- `README.md`: concise onboarding, stack, setup, scripts, public API shape, WebSocket summary.
- `CHANGELOG.md`: user/developer-visible changes, migration notes, breaking changes, and security fixes.
- `docs/coding-standards.md`: formatting, linting, team workflow, editor/tooling conventions.

Create new docs only when the information would make `README.md` too large or when it needs stable detail, such as:

- `docs/api.md` for detailed REST contracts.
- `docs/swagger.md` for Swagger/OpenAPI setup, route, conventions, and generation workflow.
- `docs/websocket-locations.md` for event names, auth, payloads, and visibility.
- `docs/architecture.md` for module boundaries and cross-cutting flows.
- `docs/diagrams.md` for Mermaid diagrams that explain architecture, auth, data, and real-time flows.
- `docs/database.md` for schema/migration/data model notes.
- `docs/security.md` for auth, privacy, and deployment-sensitive rules.

When adding a new doc, link it from `README.md`.

## Style

- Write concise Markdown.
- Prefer tables for endpoint/event summaries only when they improve scanability.
- Prefer fenced examples for commands and payloads.
- Prefer Mermaid fenced blocks for diagrams that should remain reviewable in Git.
- Keep setup instructions executable from the repo root unless the doc says otherwise.
- Use exact route names, event names, script names, env var names, DTO fields, and status behavior from code.
- Mark uncertainty as an open question instead of documenting guesses.
- Do not duplicate large blocks across docs. Link to the canonical doc instead.

## Verification

Documentation-only changes usually do not require tests. For code plus docs changes, run the verification required by the implementation skill, usually `$compass-backend`.

Before finalizing, check for stale names, broken commands, undocumented changed public behavior, and missing links to newly created docs.
