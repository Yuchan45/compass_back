# Documentation Quality Checklist

Before finalizing documentation updates, check:

- Public behavior changed by code is documented.
- Docs do not describe behavior missing from code.
- README, Swagger/OpenAPI, diagrams, and changelog are evaluated when public behavior changes.
- Route names, event names, env vars, script names, DTO fields, and module names are exact.
- New docs are linked from `README.md`.
- `CHANGELOG.md` has an `Unreleased` entry for release-note-worthy changes.
- Diagrams use Mermaid and match current code paths.
- Swagger/OpenAPI docs match controllers, DTO validators, guards, and public response shapes.
- Setup commands match `package.json` and Prisma scripts.
- Security/privacy docs do not expose secrets or encourage unsafe behavior.
- API examples do not include private fields such as `passwordHash`.
- Markdown headings and lists are easy to scan.
- Commands are fenced and copy-pasteable.
- No stale references to renamed files, modules, endpoints, or events remain.

For documentation-only changes, tests are usually not needed. For implementation plus documentation changes, run the implementation verification and mention the result.
