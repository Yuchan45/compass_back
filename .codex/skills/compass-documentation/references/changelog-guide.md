# Changelog Guide

Use `CHANGELOG.md` to record user/developer-visible changes. If it does not exist and a change is release-note-worthy, create it.

## Format

Prefer Keep a Changelog style:

```markdown
# Changelog

## Unreleased

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Security

- ...
```

Use only sections that have entries.

## Add Entries For

- New public REST endpoints or Socket.IO events.
- Breaking API, DTO, auth, response, or environment variable changes.
- Prisma migrations or data model changes developers must apply.
- Security or privacy fixes.
- Important performance changes.
- New Swagger/OpenAPI availability or API docs route.
- Developer workflow changes such as new scripts, setup steps, or required Node version.

## Usually Skip Entries For

- Pure refactors with no behavior change.
- Formatting-only changes.
- Test-only changes unless they document a fixed production bug.
- Internal implementation details that do not affect users or developers.

## Entry Style

- Write from the perspective of consumers and developers.
- Mention migration/setup actions when needed.
- Keep entries concise and factual.
- Do not include internal speculation or unmerged future plans.
- Avoid duplicate entries for the same change across several sections.
