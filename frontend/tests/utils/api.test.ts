import { ApiError, getErrorMessage, request } from "@/utils/api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function mockResponse({
  status = 200,
  statusText = "",
  body,
  invalidJson = false,
}: {
  status?: number;
  statusText?: string;
  body?: unknown;
  invalidJson?: boolean;
}) {
  return {
    status,
    statusText,
    ok: status >= 200 && status < 300,
    json: invalidJson
      ? () => Promise.reject(new SyntaxError("Unexpected token"))
      : () => Promise.resolve(body),
  };
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

describe("getErrorMessage", () => {
  it("uses the ApiError message", () => {
    expect(getErrorMessage(new ApiError("Quiz not found", 404), "Fallback")).toBe("Quiz not found");
  });

  it.each([new Error("boom"), "boom", null])("falls back for %p", (error) => {
    expect(getErrorMessage(error, "Fallback")).toBe("Fallback");
  });
});

describe("request", () => {
  it("prefixes the API URL and returns the parsed body", async () => {
    fetchMock.mockResolvedValue(mockResponse({ body: [{ id: 1 }] }));

    await expect(request("/quizzes")).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/quizzes`, {
      headers: { Accept: "application/json" },
    });
  });

  it("adds a JSON content type only when a body is sent", async () => {
    fetchMock.mockResolvedValue(mockResponse({ body: {} }));

    await request("/quizzes", {
      method: "POST",
      body: "{}",
      headers: { "X-Trace": "abc" },
    });

    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/quizzes`, {
      method: "POST",
      body: "{}",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Trace": "abc",
      },
    });
  });

  it("returns undefined for 204 responses without reading the body", async () => {
    const response = mockResponse({ status: 204 });
    const json = jest.spyOn(response, "json");
    fetchMock.mockResolvedValue(response);

    await expect(request("/quizzes/1", { method: "DELETE" })).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("throws an ApiError with status 0 when the network request fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await request("/quizzes").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      message: "The API is unreachable. Start the backend and try again.",
    });
  });

  it.each([
    ["a string message", { message: "Quiz not found" }, "Not Found", "Quiz not found"],
    [
      "an array of strings",
      { message: ["title is required", "questions is empty"] },
      "Bad Request",
      "title is required questions is empty",
    ],
    [
      "an array of issue objects",
      { message: [{ message: "Too long" }, { path: ["x"] }, "Also bad"] },
      "Bad Request",
      "Too long Also bad",
    ],
    ["an empty array", { message: [] }, "Bad Request", "Bad Request"],
    ["a body without a message", { error: "nope" }, "Conflict", "Conflict"],
    ["no body and no status text", null, "", "Request failed"],
  ])("builds the error message from %s", async (_case, body, statusText, expected) => {
    fetchMock.mockResolvedValue(mockResponse({ status: 400, statusText, body }));

    await expect(request("/quizzes")).rejects.toMatchObject({
      status: 400,
      message: expected,
    });
  });

  it("falls back to the status text when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ status: 500, statusText: "Internal Server Error", invalidJson: true }),
    );

    await expect(request("/quizzes")).rejects.toMatchObject({
      status: 500,
      message: "Internal Server Error",
    });
  });
});
