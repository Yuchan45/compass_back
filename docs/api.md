# API

This document captures stable REST contract details that are useful beyond the short endpoint list in `README.md`.

All protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

API-facing IDs are strings backed by database `BigInt` values.

## Friendships

### List Friendships

```http
GET /api/friendships
```

Returns friendships involving the authenticated user. By default, it returns both sent and received relationships across all statuses.

Optional query params:

| Param | Values | Behavior |
| --- | --- | --- |
| `type` | `sent`, `received` | Filters by whether the authenticated user is the requester or addressee. Omit it to return both. |
| `status` | `PENDING`, `ACCEPTED`, `REJECTED` | Filters by friendship status. `REJECTED` maps to the persisted `DECLINED` status. Omit it to return all statuses. |

Examples:

```http
GET /api/friendships?type=received&status=PENDING
GET /api/friendships?type=sent&status=ACCEPTED
GET /api/friendships?status=REJECTED
```

Response shape:

```json
[
  {
    "id": "10",
    "requesterId": "2",
    "addresseeId": "1",
    "status": "PENDING",
    "createdAt": "2026-05-18T12:00:00.000Z",
    "updatedAt": "2026-05-18T12:00:00.000Z",
    "requester": {
      "id": "2",
      "email": "keynaka@email.com",
      "username": "keynaka",
      "displayName": "Key Naka",
      "avatarUrl": "https://example.com/avatar.png",
      "lastSeenAt": "2026-05-18T11:00:00.000Z"
    },
    "addressee": {
      "id": "1",
      "email": "yu.nakasone@gmail.com",
      "username": "yu_nakasone",
      "displayName": "Yu Nakasone",
      "avatarUrl": "https://example.com/avatar.png",
      "lastSeenAt": "2026-05-18T11:45:00.000Z"
    }
  }
]
```

### List Friends

```http
GET /api/friendships/friends
```

Returns relationships involving the authenticated user. By default it returns accepted friendships. Each item exposes only `friend`, which is always the other user in the relationship.

Optional query params:

| Param | Values | Behavior |
| --- | --- | --- |
| `status` | `accepted`, `rejected`, `blocked` | Filters the relationship status. Defaults to `accepted`. `rejected` maps to the persisted `DECLINED` status. |
| `acceptedFrom` | ISO date string | Filters friendships whose `acceptedAt` is greater than or equal to this value. |
| `acceptedTo` | ISO date string | Filters friendships whose `acceptedAt` is less than or equal to this value. |
| `from` | ISO date string | Deprecated alias for `acceptedFrom`. |
| `to` | ISO date string | Deprecated alias for `acceptedTo`. |
| `email` | Email address | Filters by the friend's email. The authenticated user's own email is not considered for this filter. |
| `search` | string | Searches the friend's `email`, `username`, and `displayName`. |
| `sortBy` | `acceptedAt`, `lastSeenAt`, `displayName` | Sorts the result. Defaults to `acceptedAt`. |
| `sortDirection` | `asc`, `desc` | Sort direction. Defaults to `desc`. |
| `limit` | `1` to `100` | Page size. Defaults to `20`. |
| `cursor` | friendship id | Cursor returned by the previous page. |

Example:

```http
GET /api/friendships/friends?status=accepted&acceptedFrom=2026-05-01T00:00:00.000Z&acceptedTo=2026-05-31T23:59:59.999Z&search=key&sortBy=displayName&sortDirection=asc&limit=20
```

Response shape:

```json
{
  "data": [
    {
      "id": "20",
      "status": "ACCEPTED",
      "acceptedAt": "2026-05-18T12:00:00.000Z",
      "createdAt": "2026-05-18T12:00:00.000Z",
      "updatedAt": "2026-05-18T12:00:00.000Z",
      "friend": {
        "id": "2",
        "email": "keynaka@email.com",
        "username": "keynaka",
        "displayName": "Key Naka",
        "avatarUrl": "https://example.com/avatar.png",
        "lastSeenAt": "2026-05-18T11:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

Rejected relationships:

```http
GET /api/friendships/friends?status=rejected&sortBy=displayName&sortDirection=asc&limit=20
```

Blocked relationships:

```http
GET /api/friendships/friends?status=blocked&sortBy=displayName&sortDirection=asc&limit=20
```

### Create Friend Request

```http
POST /api/friendships/requests
```

The authenticated user becomes the requester. The target user is provided in the body.

```json
{
  "addresseeId": "2"
}
```

### Accept Friend Request

```http
POST /api/friendships/:id/accept
```

Only the addressee of a pending request can accept it.

### Decline Friend Request

```http
POST /api/friendships/:id/decline
```

Only the addressee of a pending request can decline it.
