import { describe, expect, it } from "@jest/globals";

import { envSchema } from "../src/env.schema.ts";

describe("envSchema", () => {
  it("fills the local defaults", () => {
    expect(envSchema.parse({})).toEqual({
      PORT: 3000,
      FRONTEND_ORIGIN: "http://localhost:5173",
    });
  });

  it("coerces a port and keeps a configured origin", () => {
    expect(envSchema.parse({ PORT: "3001", FRONTEND_ORIGIN: "http://localhost:3000" })).toEqual({
      PORT: 3001,
      FRONTEND_ORIGIN: "http://localhost:3000",
    });
  });

  it("accepts the ends of the port range", () => {
    expect(envSchema.parse({ PORT: 0 }).PORT).toBe(0);
    expect(envSchema.parse({ PORT: 65535 }).PORT).toBe(65535);
  });

  it.each([
    { PORT: "1.5" },
    { PORT: -1 },
    { PORT: 65536 },
    { PORT: "nope" },
    { FRONTEND_ORIGIN: "not a url" },
  ])("rejects %j", (input) => {
    expect(envSchema.safeParse(input).success).toBe(false);
  });
});
