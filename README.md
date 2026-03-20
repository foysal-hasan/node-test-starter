# Node Express Prisma Postgres Starter

Modular TypeScript starter with:

- Express API
- Prisma ORM 7+
- PostgreSQL
- JWT authentication
- Zod validation
- Optional avatar upload during register
- Socket.IO with token-based connection auth
- Room join/leave support by room id

## Quick start

1. Copy `.env.example` to `.env`
2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and sync schema:

```bash
npm run prisma:generate
npm run prisma:push
```

5. Start the dev server:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run prisma:generate
npm run prisma:push
```

## API

### Health

- `GET /api/v1/health`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Auth payloads

### Register with JSON

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### Register with optional avatar

Send `multipart/form-data` with:

- `name`
- `email`
- `password`
- `avatar` as an optional image file

If `avatar` is not provided, registration still succeeds.

Uploaded files are stored in `uploads/avatars` and served from `/uploads`.

### Login

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

## Socket.IO

Socket.IO is initialized in `src/socket/socket.ts`.

### Connect with token

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN",
  },
});
```

You can also send the token through the `Authorization` header as `Bearer YOUR_JWT_TOKEN`.

### Room events

- `room:join`
- `room:leave`
- `socket:connected`
- `room:joined`
- `room:left`

### Join a room by id

```ts
socket.emit("room:join", { id: "order-123" }, (response) => {
  console.log(response);
});
```

### Emit events from the server

Define and reuse emit helpers in `src/socket/socket-emitter.ts`.

```ts
import { socketEmitter } from "./src/socket/socket-emitter.js";

socketEmitter.toRoom("order-123", "order:updated", {
  status: "processing",
});

socketEmitter.toUser("USER_ID", "notification:new", {
  message: "Your order has been updated",
});
```
