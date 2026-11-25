# Quiz Builder

Create quizzes with true/false, short-text, and multiple-choice questions. The API is NestJS with Prisma and PostgreSQL. The UI is Next.js.

## Requirements

- Node.js 22.18+, 24.11+, or 26+
- npm
- Docker, or the local Postgres process started with `npm run db:local`

## Database

Postgres must be running before the API starts. Use Docker when you can reach the Docker socket:

```bash
docker compose up -d
```

If Docker reports `permission denied` on the socket, this machine can start Postgres from the backend instead:

```bash
cd backend
npm install
npm run db:local
```

Leave that process running. Both options listen on `localhost:5432` with this login:

```text
database: quiz_builder
user:     quiz
password: quiz
```

Copy the backend environment file and apply the migration:

```bash
cp backend/.env.example backend/.env
cd backend
npm install
npm run migrate
```

## Sample quiz

Still inside `backend`:

```bash
npm run db:seed
```

That inserts “A short sample quiz” if it is not already there. It has one question of each type. You can also create a quiz from the UI at `/create`.

## Backend

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:3001`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/quizzes` | Create a quiz |
| `GET` | `/quizzes` | List titles and question counts |
| `GET` | `/quizzes/:id` | Quiz with its questions |
| `DELETE` | `/quizzes/:id` | Delete a quiz |

## Frontend

In another terminal:

```bash
cp frontend/.env.example frontend/.env.local
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The home page sends you to the quiz list.

- `/quizzes` lists quizzes and deletes one after you confirm
- `/create` builds a quiz and posts it
- `/quizzes/:id` shows the saved structure, not a playable quiz

`frontend/.env.local` sets `NEXT_PUBLIC_API_URL` to the API origin.

## Checks

```bash
cd backend && npm run lint && npx tsc --noEmit
cd frontend && npm run lint
```

Do not commit `.env` or `.env.local`.
