# Architecture Docs Guide

Use this guide when module boundaries, cross-module flows, auth, Socket.IO, friendship, location visibility, or shared helpers change.

## What To Capture

- Module responsibilities.
- Controller/service/DTO boundaries.
- Auth flow and where actor identity comes from.
- Friendship and location visibility rules.
- Socket.IO authentication, room naming, and event flow.
- Shared helpers such as ID parsing, BigInt serialization, and public user mapping.
- Diagrams for module, auth, data, and real-time flows when they improve clarity.
- Deployment or operational assumptions only when represented in code/config.

## Where To Put It

- Keep short architecture notes in `README.md`.
- Use `docs/architecture.md` for stable design details.
- Use `docs/diagrams.md` or Mermaid sections in focused docs for diagrams.
- Use `docs/security.md` for auth/privacy/deployment-sensitive behavior.
- Use `docs/websocket-locations.md` for event-level Socket.IO details.

## Avoid

- Describing aspirational architecture that code does not follow.
- Turning docs into a design essay.
- Duplicating every implementation detail from services.
- Hiding breaking API changes inside architecture docs only.
