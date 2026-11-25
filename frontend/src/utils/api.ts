const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
  if (typeof message === "string") return message;

  if (Array.isArray(message)) {
    const parts: string[] = [];
    for (const item of message) {
      if (typeof item === "string") parts.push(item);
      else if (
        item &&
        typeof item === "object" &&
        "message" in item &&
        typeof item.message === "string"
      ) {
        parts.push(item.message);
      }
    }
    if (parts.length) return parts.join(" ");
  }

  return fallback || "Request failed";
}
