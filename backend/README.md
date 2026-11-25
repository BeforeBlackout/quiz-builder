# Quiz Builder API

NestJS API for creating, listing, viewing, and deleting quizzes. Data is stored in PostgreSQL through Prisma 8.

Database setup and running the whole app are covered in the [root README](../README.md).

## Environment

Copy `.env.example` to `.env`:

| Variable          | Purpose                                  | Default                 |
| ----------------- | ---------------------------------------- | ----------------------- |
| `DATABASE_URL`    | Postgres connection string               | none, required          |
| `PORT`            | Port the API listens on                  | `3000`                  |
| `FRONTEND_ORIGIN` | Origin allowed by CORS (the Next.js app) | `http://localhost:5173` |

The example file sets `PORT=3001` and `FRONTEND_ORIGIN=http://localhost:3000`.

## Scripts

| Command            | What it does                                             |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Start the API and restart it on file changes             |
| `npm start`        | Start the API once                                       |
| `npm run db:local` | Run an embedded Postgres on `localhost:5432` (no Docker) |
| `npm run migrate`  | Apply migrations from `migrations/`                      |
| `npm run db:seed`  | Insert the sample quiz if it is not already there        |
| `npm test`         | Run unit and e2e tests against a throwaway Postgres      |
| `npm run lint`     | Run ESLint                                               |
| `npm run format`   | Run Prettier                                             |

## Endpoints

| Method   | Path           | Success                                                   | Errors                            |
| -------- | -------------- | --------------------------------------------------------- | --------------------------------- |
| `POST`   | `/quizzes`     | `201` with the created quiz                               | `400` with `[{ path, message }]`  |
| `GET`    | `/quizzes`     | `200` with `[{ id, title, questionCount }]`, newest first |                                   |
| `GET`    | `/quizzes/:id` | `200` with the quiz, its questions, and options           | `400` for a non-numeric id, `404` |
| `DELETE` | `/quizzes/:id` | `204`                                                     | `400` for a non-numeric id, `404` |

A `POST /quizzes` body looks like this:

```json
{
  "title": "A short sample quiz",
  "questions": [
    { "type": "BOOLEAN", "prompt": "The Pacific is the largest ocean.", "booleanAnswer": true },
    { "type": "INPUT", "prompt": "What is the capital of Japan?", "textAnswer": "Tokyo" },
    {
      "type": "CHECKBOX",
      "prompt": "Which are primary colors in the RYB model?",
      "options": [
        { "text": "Red", "isCorrect": true },
        { "text": "Green", "isCorrect": false },
        { "text": "Blue", "isCorrect": true }
      ]
    }
  ]
}
```

A quiz needs a title and 1 to 50 questions. A checkbox question needs 2 to 12 options with at least one marked correct.

In responses, each question carries only the answer field for its `type`: `booleanAnswer` for `BOOLEAN`, `textAnswer` for `INPUT`, `options` for `CHECKBOX`.

## Layout

- `src/quizzes`: controller, service, `create-quiz.schema.ts` (request body), and `quiz.dto.ts` (responses)
- `src/questions`, `src/options`: write questions and options inside the quiz transaction. Each owns its `*.schema.ts` (request validation and limits) and `*.dto.ts` (response shape)
- `src/prisma/contract.prisma`: data model. Run `npm run contract:emit` after changing it, then `npm run migration:plan` and `npm run migrate`
- `src/prisma/seed.ts`: the sample quiz used by `npm run db:seed`
- `module.ts`, `service.ts`: Prisma Composer wiring, used only by `npm run dev:composer` and `npm run deploy`
