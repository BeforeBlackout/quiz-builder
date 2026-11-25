import { describe, expect, it } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";

import { validationException } from "../../src/pipes/validation-exception.ts";

describe("validationException", () => {
  it("builds a bad request with flattened issue paths", () => {
    const exception = validationException([
      { message: "Title is required", path: [{ key: "title" }] },
      { message: "Mark at least one correct option", path: ["questions", { key: 0 }, "options"] },
      { message: "Add at least one question" },
    ]);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception.getStatus()).toBe(400);
    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      message: [
        { path: "title", message: "Title is required" },
        { path: "questions.0.options", message: "Mark at least one correct option" },
        { path: "", message: "Add at least one question" },
      ],
      error: "Bad Request",
    });
  });
});
