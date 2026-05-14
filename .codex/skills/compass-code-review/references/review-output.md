# Review Output

## Severity

- `Critical`: production outage, data loss, credential exposure, remote code execution, auth bypass, or migration that can corrupt important data.
- `High`: realistic security exploit, cross-user data exposure, broken core flow, common runtime crash, or migration failure for existing valid data.
- `Medium`: plausible edge-case bug, missing validation that creates bad state, likely performance problem, incomplete error handling, or missing tests for risky logic.
- `Low`: maintainability risk, confusing contract, minor edge case, weak observability, or limited test gap.

Do not inflate severity. Tie every finding to a realistic trigger and impact.

## Required Finding Shape

Each finding must include:

- Severity.
- File and line reference.
- Concrete problem.
- User, data, security, performance, or maintainability impact.
- Fix direction.

Example:

```text
High - src/modules/friendships/friendships.service.ts:42 - The query accepts the target friendship id without constraining it to the authenticated user. Any logged-in user who can guess an id can accept or reject another user's friendship. Constrain the update with requester/addressee ownership or fetch first and reject non-participants.
```

## Response Order

1. Findings first, ordered by severity.
2. Open questions or assumptions, only when they affect review confidence.
3. Verification run, including exact commands and outcome.
4. Short summary, only as secondary context.

## No Findings

If no issues are found, say so directly:

```text
No findings. I checked the changed service/controller paths, Prisma access, auth boundary, and tests. Verification: `npm run check` passed. Residual risk: I did not exercise the flow against a live database.
```

## Review Rules

- Do not bury findings behind praise or broad summaries.
- Do not list style preferences unless they create risk or fail project checks.
- Do not speculate about vulnerabilities without a plausible path.
- Do not recommend large refactors when a narrow fix addresses the risk.
- Mention tests not run and why.
