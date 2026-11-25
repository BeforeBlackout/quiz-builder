import { beforeAll, describe, expect, it, jest } from "@jest/globals";

const close = jest.fn(async () => undefined);

jest.unstable_mockModule("../src/prisma/db.ts", () => ({
  db: { close },
}));

describe("PrismaService", () => {
  let PrismaService: typeof import("../src/prisma.service.ts").PrismaService;

  beforeAll(async () => {
    ({ PrismaService } = await import("../src/prisma.service.ts"));
  });

  it("closes the database client when the module shuts down", async () => {
    const service = new PrismaService();

    await service.onModuleDestroy();

    expect(close).toHaveBeenCalledTimes(1);
    expect(service.db).toEqual({ close });
  });
});
