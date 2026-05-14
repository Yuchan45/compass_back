# Safety Checklist

Run this mental checklist before staging files.

## Never Commit

- `.env` or local secrets.
- JWTs, Google ID/access tokens, API keys, database passwords, private keys, certificates.
- Raw precise user location samples unless intentionally anonymized test fixtures.
- `node_modules`, `dist`, `coverage`, logs, temporary files, editor caches.
- Local machine paths or personal configuration unless project-standard.

## Inspect Carefully

- `.env.example`: should contain placeholders only.
- `package-lock.json`: should match intentional dependency changes.
- Prisma migrations: should match schema changes and be safe for existing data.
- Generated files: include only if the project expects them in source control.
- `.codex/skills/**`: commit separately from application code unless the task is specifically tooling/process.

## Useful Commands

```bash
git status --short
git diff --check
git diff --stat
git diff -- <file>
```

Use targeted diffs before staging files with sensitive surfaces:

- auth, config, env, migrations, Swagger examples, logs, docs, and tests with fixtures.
