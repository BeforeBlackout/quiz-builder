# Quiz Builder

Create quizzes with true/false, short-text, and checkbox questions. The API is NestJS with Prisma and PostgreSQL. The UI is Next.js.

![Quiz Builder demo](demo.gif)

| Part     | Folder      | URL                     |
| -------- | ----------- | ----------------------- |
| API      | `backend/`  | `http://localhost:3001` |
| UI       | `frontend/` | `http://localhost:3000` |
| Postgres | —           | `localhost:5432`        |

## Requirements

- Node.js 22.18+, 24.11+, or 26+ (check with `node -v`)
- npm

Docker is not needed. The backend ships its own Postgres.

## Quick start

You need **three terminals**, all opened in the repository root (the folder with this README). Paste each block into its own terminal and leave it running.

### Terminal 1: database

```bash
cd backend
npm install
npm run db:local
```

Wait until it prints `Postgres ready at postgresql://quiz:quiz@localhost:5432/quiz_builder`. Keep this terminal open, because closing it stops the database.

### Terminal 2: API

```bash
cd backend
cp .env.example .env
npm run migrate
npm run db:seed
npm run dev
```

The API is ready at `http://localhost:3001` and restarts when you edit files. `npm run db:seed` adds a sample quiz so the list isn't empty.

### Terminal 3: UI

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Next time

Everything is installed now, so later you only start the three processes:

| Terminal | Command                          |
| -------- | -------------------------------- |
| 1        | `cd backend && npm run db:local` |
| 2        | `cd backend && npm run dev`      |
| 3        | `cd frontend && npm run dev`     |

Stop any of them with `Ctrl+C`. Quizzes are saved in `backend/.pgdata/`. Delete that folder while the database is stopped if you want an empty database, then run Terminal 2's full block again.

### What you can do in the UI

- `/quizzes` lists quizzes and deletes one after you confirm
- `/create` builds a quiz and saves it
- `/quizzes/:id` shows the saved structure, not a playable quiz

### Troubleshooting

- **`port 5432 already in use`**: another Postgres is running (perhaps the Docker one). Stop it, or point `DATABASE_URL` in `backend/.env` at it and skip Terminal 1.
- **The UI shows a network error**: the API in Terminal 2 isn't running, or `backend/.env` is missing. Run `cp .env.example .env` in `backend/`.
- **`npm run migrate` can't connect**: Terminal 1 isn't running or hasn't printed `Postgres ready` yet.

## Alternative: Postgres in Docker

If you prefer Docker, it replaces Terminal 1. From the repository root:

```bash
docker compose up -d
```

Then run the Terminal 2 and Terminal 3 blocks as above, adding `npm install` at the start of Terminal 2 because Terminal 1 didn't run it. The container uses the same login (`quiz` / `quiz`, database `quiz_builder`, port `5432`), so nothing else changes.

Stop it with `docker compose down`, or `docker compose down -v` to also delete the data. If Docker reports `permission denied` on its socket, run `sudo usermod -aG docker $USER` and log in again.

## Environment

| File                  | Variable              | Value in the example file                            |
| --------------------- | --------------------- | ---------------------------------------------------- |
| `backend/.env`        | `DATABASE_URL`        | `postgresql://quiz:quiz@localhost:5432/quiz_builder` |
| `backend/.env`        | `PORT`                | `3001`                                               |
| `backend/.env`        | `FRONTEND_ORIGIN`     | `http://localhost:3000` (allowed by CORS)            |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:3001`                              |

`backend/.env` is required. `frontend/.env.local` is optional because the UI already defaults to `http://localhost:3001`. Create it with `cp .env.example .env.local` only if you change the API URL.

If you change the API port, update `NEXT_PUBLIC_API_URL` to match. If you change the UI port, update `FRONTEND_ORIGIN`. Do not commit `.env` or `.env.local`.

## API

| Method   | Path           | Purpose                         |
| -------- | -------------- | ------------------------------- |
| `POST`   | `/quizzes`     | Create a quiz                   |
| `GET`    | `/quizzes`     | List titles and question counts |
| `GET`    | `/quizzes/:id` | Quiz with its questions         |
| `DELETE` | `/quizzes/:id` | Delete a quiz                   |

Request and response shapes are in [`backend/README.md`](backend/README.md).

## Production build

```bash
cd backend && npm start                      # API without file watching
cd frontend && npm run build && npm start    # optimized UI on port 3000
```
