import type { QuestionTypeName } from "./quiz-schema";
import type { CreateQuizPayload } from "./quiz-schema";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type QuizSummary = {
  id: number;
  title: string;
  questionCount: number;
};

export type QuizOption = {
  id: number;
  position: number;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: number;
  position: number;
  type: QuestionTypeName;
  prompt: string;
  booleanAnswer: boolean | null;
  textAnswer: string | null;
  options: QuizOption[];
};

export type QuizDetail = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function listQuizzes() {
  return request<QuizSummary[]>("/quizzes");
}

export function getQuiz(id: number) {
  return request<QuizDetail>(`/quizzes/${id}`);
}

export function createQuiz(payload: CreateQuizPayload) {
  return request<QuizDetail>("/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteQuiz(id: number) {
  return request<void>(`/quizzes/${id}`, { method: "DELETE" });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("The API is unreachable. Start the backend and try again.", 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(readError(body, response.statusText), response.status);
  }

  return body as T;
}

function readError(body: unknown, fallback: string) {
  if (!body || typeof body !== "object" || !("message" in body)) {
    return fallback || "Request failed";
  }

  const { message } = body;
  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const text = message
      .map((item) => {
        if (typeof item === "string") return item;
        if (
          item &&
          typeof item === "object" &&
          "message" in item &&
          typeof item.message === "string"
        ) {
          return item.message;
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));
    if (text.length > 0) return text.join(" ");
  }

  return fallback || "Request failed";
}
