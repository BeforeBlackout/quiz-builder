import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";

import { startTestDatabase, type TestDatabase } from "./test-database.ts";
import { frontendOrigin, startTestServer, type TestServer } from "./test-server.ts";

const networkQuiz = {
  title: "  Network quiz  ",
  questions: [
    { type: "BOOLEAN", prompt: "  True?  ", booleanAnswer: true },
    { type: "INPUT", prompt: "Capital?", textAnswer: "  Paris  " },
    {
      type: "CHECKBOX",
      prompt: "Colors?",
      options: [
        { text: "Red", isCorrect: true },
        { text: "Blue", isCorrect: false },
      ],
    },
  ],
};

describe("HTTP API", () => {
  let database: TestDatabase;
  let server: TestServer;
  let origin = "";
  let quizId = 0;
  let newerId = 0;

  beforeAll(async () => {
    database = await startTestDatabase();
    server = await startTestServer(database.url);
    origin = server.origin;
  }, 180_000);

  afterAll(async () => {
    await server?.stop();
    await database?.stop();
  }, 30_000);

  it("answers a health check and allows the configured frontend origin", async () => {
    const health = await request(origin).get("/").expect(200);
    expect(health.body).toEqual({ name: "quiz-builder", status: "ok" });

    const allowed = await request(origin).get("/").set("Origin", frontendOrigin).expect(200);
    expect(allowed.headers["access-control-allow-origin"]).toBe(frontendOrigin);

    const foreign = await request(origin).get("/").set("Origin", "http://evil.test").expect(200);
    expect(foreign.headers["access-control-allow-origin"]).toBe(frontendOrigin);
  });

  it("rejects a quiz body that fails validation", async () => {
    const empty = await request(origin)
      .post("/quizzes")
      .send({ title: " ", questions: [] })
      .expect(400);
    expect(empty.body).toEqual({
      statusCode: 400,
      message: [
        { path: "title", message: "Title is required" },
        { path: "questions", message: "Add at least one question" },
      ],
      error: "Bad Request",
    });

    const checkbox = await request(origin)
      .post("/quizzes")
      .send({
        title: "Bad",
        questions: [
          {
            type: "CHECKBOX",
            prompt: "Pick",
            options: [
              { text: "A", isCorrect: false },
              { text: "B", isCorrect: false },
            ],
          },
        ],
      })
      .expect(400);
    expect(checkbox.body).toEqual({
      statusCode: 400,
      message: [{ path: "questions.0.options", message: "Mark at least one correct option" }],
      error: "Bad Request",
    });
  });

  it("creates a quiz with every question type", async () => {
    const created = await request(origin).post("/quizzes").send(networkQuiz).expect(201);
    quizId = created.body.id;

    expect(created.body).toMatchObject({
      id: expect.any(Number),
      title: "Network quiz",
      questions: [
        {
          position: 0,
          type: "BOOLEAN",
          prompt: "True?",
          booleanAnswer: true,
        },
        {
          position: 1,
          type: "INPUT",
          prompt: "Capital?",
          textAnswer: "Paris",
        },
        {
          position: 2,
          type: "CHECKBOX",
          prompt: "Colors?",
          options: [
            { position: 0, text: "Red", isCorrect: true },
            { position: 1, text: "Blue", isCorrect: false },
          ],
        },
      ],
    });
    expect(Object.keys(created.body.questions[0]).sort()).toEqual([
      "booleanAnswer",
      "id",
      "position",
      "prompt",
      "type",
    ]);
    expect(Object.keys(created.body.questions[1]).sort()).toEqual([
      "id",
      "position",
      "prompt",
      "textAnswer",
      "type",
    ]);
    expect(Object.keys(created.body.questions[2]).sort()).toEqual([
      "id",
      "options",
      "position",
      "prompt",
      "type",
    ]);
    expect(Number.isNaN(Date.parse(created.body.createdAt))).toBe(false);
    expect(Number.isNaN(Date.parse(created.body.updatedAt))).toBe(false);

    const newer = await request(origin)
      .post("/quizzes")
      .send({
        title: "Newer quiz",
        questions: [{ type: "BOOLEAN", prompt: "Later?", booleanAnswer: false }],
      })
      .expect(201);
    newerId = newer.body.id;
  });

  it("lists the newest quiz first", async () => {
    const list = await request(origin).get("/quizzes").expect(200);

    expect(list.body).toEqual([
      { id: newerId, title: "Newer quiz", questionCount: 1 },
      { id: quizId, title: "Network quiz", questionCount: 3 },
    ]);
  });

  it("returns one saved quiz", async () => {
    const detail = await request(origin).get(`/quizzes/${quizId}`).expect(200);

    expect(detail.body).toMatchObject({
      id: quizId,
      title: "Network quiz",
      questions: [{ type: "BOOLEAN" }, { type: "INPUT" }, { type: "CHECKBOX" }],
    });
  });

  it("rejects a non-numeric id and a missing quiz", async () => {
    const badId = await request(origin).get("/quizzes/nope").expect(400);
    expect(badId.body.message).toEqual(expect.stringMatching(/numeric/i));

    await request(origin).get("/quizzes/99999999999").expect(400);
    await request(origin).get("/quizzes/0").expect(400);
    await request(origin).delete("/quizzes/99999999999").expect(400);

    const missing = await request(origin).get("/quizzes/999999999").expect(404);
    expect(missing.body.message).toBe("Quiz 999999999 was not found");

    const missingDelete = await request(origin).delete("/quizzes/999999999").expect(404);
    expect(missingDelete.body.message).toBe("Quiz 999999999 was not found");
  });

  it("deletes a quiz once", async () => {
    await request(origin).delete(`/quizzes/${quizId}`).expect(204);
    await request(origin).get(`/quizzes/${quizId}`).expect(404);
    await request(origin).delete(`/quizzes/${quizId}`).expect(404);

    const list = await request(origin).get("/quizzes").expect(200);
    expect(list.body).toEqual([{ id: newerId, title: "Newer quiz", questionCount: 1 }]);
  });
});
