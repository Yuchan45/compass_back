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
      "avatarUrl": "https://example.com/avatar.png"
    },
    "addressee": {
      "id": "1",
      "email": "yu.nakasone@gmail.com",
      "username": "yu_nakasone",
      "displayName": "Yu Nakasone",
      "avatarUrl": "https://example.com/avatar.png"
    }
  }
]
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
