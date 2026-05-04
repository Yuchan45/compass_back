# Coding Standards

This repository enforces a shared baseline for formatting and linting.

## Source of truth

- Root `.editorconfig`: indentation, line endings, trailing whitespace, final newline.
- Root `.gitattributes`: normalizes committed line endings to `LF`.
- Root `.vscode/settings.json`: recommended local editor behavior for VS Code.
- `compass-back/.prettierrc`: formatting rules such as `printWidth`.
- `compass-back/eslint.config.mjs`: TypeScript and code-quality rules.

## Agreed conventions

- Indentation: 2 spaces
- Line endings: `LF`
- Max line width: `100`
- Quotes: single quotes
- Semicolons: required
- Trailing commas: enabled where valid

## Commands

Run these from `compass-back`:

```bash
npm run format
npm run format:check
npm run lint
npm run lint:fix
npm run check
```

Current note:

- The repo formats TypeScript sources automatically.
- Prisma SQL migrations still follow `.editorconfig` and Git line-ending rules, but they are not passed through Prettier because no SQL parser is installed in this project.

## Team workflow

- Format on save should be enabled in the editor.
- `npm run check` should pass before opening a PR.
- If a future pre-commit hook is added, it should call `format:check` and `lint`.
