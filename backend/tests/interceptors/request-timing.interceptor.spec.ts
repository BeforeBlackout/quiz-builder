import { describe, expect, it, jest } from "@jest/globals";
import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { lastValueFrom, of, throwError } from "rxjs";

import { RequestTimingInterceptor } from "../../src/interceptors/request-timing.interceptor.ts";

function httpContext(request: { method: string; path?: string; url?: string }): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("RequestTimingInterceptor", () => {
  it("logs method, path, and duration when the request finishes", async () => {
    const log = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    const interceptor = new RequestTimingInterceptor();
    const next: CallHandler = { handle: () => of("ok") };

    await lastValueFrom(
      interceptor.intercept(httpContext({ method: "GET", path: "/quizzes" }), next),
    );

    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^GET \/quizzes \d+ms$/));
    log.mockRestore();
  });

  it("logs the duration when the request fails", async () => {
    const log = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    const interceptor = new RequestTimingInterceptor();
    const next: CallHandler = { handle: () => throwError(() => new Error("nope")) };

    await expect(
      lastValueFrom(interceptor.intercept(httpContext({ method: "POST", url: "/quizzes" }), next)),
    ).rejects.toThrow("nope");

    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^POST \/quizzes \d+ms$/));
    log.mockRestore();
  });
});
