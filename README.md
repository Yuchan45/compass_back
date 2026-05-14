# Compass Back

NestJS + TypeScript backend for real-time user location sharing.

## Stack

- NestJS modular architecture
- Prisma ORM with PostgreSQL
- JWT authentication
- REST API for auth, users, friendships, and locations
- Swagger UI for REST API exploration
- Socket.IO gateway for real-time location updates

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

## Main Scripts

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npm run prisma:studio
```

## API Documentation

When the app is running, Swagger UI is available at:

- `GET /api/docs`

See [docs/swagger.md](docs/swagger.md) for Swagger conventions and maintenance notes.

## API Shape

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/friendships/requests`
- `POST /api/friendships/:id/accept`
- `POST /api/friendships/:id/decline`
- `GET /api/friendships`
- `POST /api/locations/me`
- `GET /api/locations/friends/latest`

## WebSocket

Namespace: `/locations`

Pass the JWT as:

```ts
io('/locations', {
  auth: {
    token: accessToken,
  },
});
```

Events:

- Client emits `location:update`
- Server emits `friend:location:updated` to accepted friends
- Client emits `friends:locations` to fetch latest friend locations
