# Naming And Style Review

## Source Of Truth

- `.editorconfig`: indentation, line endings, trailing whitespace, final newline.
- `.prettierrc`: formatting rules, including max line width.
- `eslint.config.mjs`: TypeScript and code-quality rules.
- `docs/coding-standards.md`: team conventions and commands.

## Baseline Conventions

- Indentation: 2 spaces.
- Line endings: LF.
- Max line width: 100.
- Quotes: single quotes.
- Semicolons: required.
- Trailing commas: enabled where valid.

## Naming Conventions

- Use `*.controller.ts`, `*.service.ts`, `*.module.ts`, and `dto/*.dto.ts` naming that matches existing modules.
- DTO class names should describe request intent, such as `CreateFriendshipDto` or `UpdateLocationDto`.
- Service methods should name domain actions, not transport details.
- Boolean names should read as predicates, such as `isVerified`, `hasPassword`, or `canViewLocation`.
- Prisma fields should use domain names that match API and service language unless mapping is intentional.
- Migration folders should use clear snake-case names after the timestamp.
- Test descriptions should state behavior and condition, especially for auth, ownership, and error paths.

## Architecture Naming

- Keep actor/current user naming distinct from target user naming.
- Avoid generic names such as `data`, `payload`, `result`, or `item` when multiple domain objects are in scope.
- Route names should reflect resources and existing API language.
- Error messages should be stable and clear without exposing implementation details.

## Review Smells

- New naming conflicts with existing domain terms.
- Actor and target user variables are easy to confuse.
- DTO names describe HTTP mechanics instead of domain intent.
- A style issue bypasses formatter/linter and would cause `npm run check` to fail.
- Tests use vague names that make regressions hard to diagnose.

## Verification

- Prefer `npm run format:check` for formatting-only review.
- Prefer `npm run lint` for style and code-quality issues.
- Prefer `npm run check` before final approval when time permits.
