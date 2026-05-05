# Location Handling And Privacy

## Domain Rules

- Treat precise location as sensitive personal data.
- Only authenticated users may write their own location.
- Only accepted friends may receive or read a user's latest location.
- Never trust a client-provided user ID to decide whose location is being written.
- Keep location sharing rules consistent between REST endpoints and Socket.IO broadcasts.

## Location Writes

- Validate latitude, longitude, accuracy, heading, speed, battery, and recorded time through DTOs.
- Associate writes with `CurrentUser` or authenticated socket state.
- Update `lastSeenAt` when location activity indicates the user is active.
- Return serializable data and avoid exposing unrelated user fields.

## Realtime

- Namespace is `/locations`.
- Accept JWT from `handshake.auth.token` or `Authorization: Bearer ...`.
- Join `user:{id}` after successful auth.
- Broadcast `friend:location:updated` only to accepted friend rooms.
- Do not broadcast to public rooms or unauthenticated sockets.

## Privacy Defaults

- Minimize retention and reads of historical location unless the feature needs history.
- Avoid logging raw coordinates, tokens, or friend graph decisions.
- Prefer explicit consent/setting checks if a future feature adds pause, invisible mode, or sharing scopes.
