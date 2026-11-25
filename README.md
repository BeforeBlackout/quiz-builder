# Quiz Builder

Create quizzes with true/false, short-text, and checkbox questions. The API is NestJS with Prisma and PostgreSQL. The UI is Next.js.

![Quiz Builder demo](demo.gif)

| Part     | Folder      | URL                     |
| -------- | ----------- | ----------------------- |
| API      | `backend/`  | `http://localhost:3001` |
| UI       | `frontend/` | `http://localhost:3000` |
| Postgres | —           | `localhost:5432`        |

## Requirements

- Node.js 22.18+, 24.11+, or 26+
- npm
- Docker with Compose (optional; without it the backend runs an embedded Postgres)

## Quick start

There are two ways to get Postgres running. Both listen on `localhost:5432` with the same login, so every step after the database is identical.

```text
database: quiz_builder
user:     quiz
password: quiz
```

### 1. Start Postgres

**Option A: with Docker**

From the repository root:

```bash
docker compose up -d
```

This starts `postgres:17-alpine` and keeps its data in the `quiz_pg` volume. Stop it with `docker compose down`, or `docker compose down -v` to also delete the data.

If Docker reports `permission denied` on its socket, add your user to the `docker` group (`sudo usermod -aG docker $USER`, then log in again) or use option B.

**Option B: without Docker**

The backend ships an embedded Postgres binary through the `embedded-postgres` package:

```bash
cd backend
npm install
npm run db:local
```

Leave that terminal open; `Ctrl+C` stops the database. Data is kept in `backend/.pgdata/`, which is ignored by git. Delete that folder to start from an empty database.

### 2. Set up and start the API

In a new terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run db:seed   # optional: adds “A short sample quiz” with one question of each type
npm run dev
```

The API runs at `http://localhost:3001` and restarts on file changes.

### 3. Start the UI

In another terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The home page sends you to the quiz list.

- `/quizzes` lists quizzes and deletes one after you confirm
- `/create` builds a quiz and posts it
- `/quizzes/:id` shows the saved structure, not a playable quiz

## Environment

| File                  | Variable              | Value in the example file                            |
| --------------------- | --------------------- | ---------------------------------------------------- |
| `backend/.env`        | `DATABASE_URL`        | `postgresql://quiz:quiz@localhost:5432/quiz_builder` |
| `backend/.env`        | `PORT`                | `3001`                                               |
| `backend/.env`        | `FRONTEND_ORIGIN`     | `http://localhost:3000` (allowed by CORS)            |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:3001`                              |

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

## Checks

The backend tests start their own throwaway embedded Postgres, so they need neither Docker nor `npm run db:local`.

```bash
cd backend
npm run lint
npx tsc --noEmit
npx prettier --check .
npm test
```

```bash
cd frontend
npm run lint
npx tsc --noEmit
npx prettier --check .
npm test
npm run build
```

### End-to-end test

The Playwright test drives the real UI against the real API. It starts `npm run dev` in `backend/` and `frontend/`, or reuses them if they are already running on ports 3001 and 3000. Postgres must already be running (step 1 of the quick start).

```bash
cd frontend
npx playwright install chromium   # once per machine
npm run test:e2e
```

## Test suite

### Backend (`backend/tests`, Jest)

| File                                              | What is covered                                                                                                                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http.e2e-spec.ts`                                | The HTTP API on a real database: health check and CORS, invalid body `400`, create with every question type, newest-first list, get, bad id `400`, missing `404`, delete once |
| `quizzes/quizzes.service.spec.ts`                 | Creating questions in order, list with question counts, nested options and ISO dates, missing quiz on get and delete, failures while saving                                   |
| `quizzes/create-quiz.schema.spec.ts`              | Request validation: trimming, every question type, size limits at and past the edge, required title and questions, checkbox option rules                                      |
| `questions/questions.service.spec.ts`             | Storing true/false, short-text, and checkbox questions, and skipping options when they don't apply                                                                            |
| `questions/question.dto.spec.ts`                  | Responses keep only the answer field for each type, and a stored question missing its answer is rejected                                                                      |
| `options/options.service.spec.ts`                 | Option positions start at zero, and an empty list writes nothing                                                                                                              |
| `pipes/parse-id.pipe.spec.ts`                     | Accepted ids up to the Postgres integer max, and rejected forms such as `0`, `01`, `1e3`, `0x10`, and values past the max                                                     |
| `pipes/validation-exception.spec.ts`              | Validation errors become a `400` with flattened `{ path, message }` issues                                                                                                    |
| `interceptors/request-timing.interceptor.spec.ts` | Method, path, and duration are logged for both successful and failed requests                                                                                                 |
| `env.schema.spec.ts`                              | Environment defaults, port coercion, configured origin, and port range ends                                                                                                   |
| `prisma.service.spec.ts`                          | The database client is closed when the module shuts down                                                                                                                      |

### Frontend (`frontend/tests`, Jest and Testing Library)

| File                                           | What is covered                                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `components/CreateQuizForm.test.tsx`           | Initial state, validation errors block submit, adding and removing questions with the overview in sync, each question type's answer controls, checkbox option rules, trimmed submit and redirect |
| `components/QuizList.test.tsx`                 | Empty state, quiz links with singular and plural question counts, opening and cancelling the delete dialog, delete then route refresh                                                            |
| `components/DeleteQuizDialog.test.tsx`         | Accessible modal, initial focus, scroll lock, focus trap, successful delete, controls disabled while deleting, API and generic error messages                                                    |
| `components/quiz-detail/QuestionView.test.tsx` | Question number, type label, and prompt; the expected text answer; checkbox options with the correct-option count                                                                                |
| `components/Layout.test.tsx`                   | Brand link and content, and when the "My quizzes" nav item is highlighted                                                                                                                        |
| `components/HoverPrefetchLink.test.tsx`        | Renders a link with its props and forwards mouse-enter events                                                                                                                                    |
| `components/FieldError.test.tsx`               | Shows a message, and renders nothing when there is none                                                                                                                                          |
| `app/quizzes/page.test.tsx`                    | The list page renders quizzes from the API                                                                                                                                                       |
| `app/quizzes/[id]/page.test.tsx`               | Detail page header, questions, and overview; `notFound` for bad ids and API `404`; other errors rethrown; page metadata                                                                          |
| `schemas/quiz-schema.test.ts`                  | Form validation: title, question count, prompts, input answers, and checkbox option rules                                                                                                        |
| `utils/quiz.test.ts`                           | Blank question defaults, and turning the form into a trimmed API payload for each question type                                                                                                  |
| `utils/api.test.ts`                            | API URL prefix, JSON headers only with a body, `204` handling, network failures, and error messages from JSON or status text                                                                     |
| `api/quiz.test.ts`                             | List, get, create, and delete call the right endpoints                                                                                                                                           |

### End-to-end (`frontend/e2e`, Playwright)

| File                | What is covered                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| `quiz-flow.spec.ts` | Create a quiz, open it from the list, delete it through the confirm dialog, reload, and check it is gone |
