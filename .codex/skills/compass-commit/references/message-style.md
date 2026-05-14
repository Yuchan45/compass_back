# Commit Message Style

Use Conventional Commits.

## Format

```text
type(scope): short imperative summary
```

Examples:

```text
feat(swagger): add API documentation UI
docs(skills): add Compass documentation workflow
fix(auth): reject invalid Google ID tokens
test(users): cover profile update validation
chore(deps): add Swagger dependencies
```

## Types

- `feat`: new user/developer-visible behavior.
- `fix`: bug or security/privacy correction.
- `docs`: documentation-only changes.
- `test`: tests only.
- `refactor`: behavior-preserving code restructure.
- `perf`: performance improvement.
- `chore`: tooling or maintenance.
- `build`: dependency/build system changes.

## Scope

Prefer a short domain scope:

- `auth`
- `users`
- `friendships`
- `locations`
- `realtime`
- `swagger`
- `docs`
- `prisma`
- `config`
- `skills`

## Summary

- Use imperative mood: "add", "fix", "document", "update".
- Keep it under about 72 characters when practical.
- Do not end with a period.
- Be specific enough that `git log --oneline` is useful.

## Body

Add a body only when it explains migration steps, breaking changes, security implications, or non-obvious rationale.

Use `BREAKING CHANGE:` footer for breaking API or migration behavior.
