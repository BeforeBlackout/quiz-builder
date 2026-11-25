import { describe, expect, it, jest } from "@jest/globals";

import { OptionsService } from "../../src/options/options.service.ts";

describe("OptionsService", () => {
  it("stores options with positions starting at zero", async () => {
    const create = jest.fn<(input: unknown) => Promise<void>>(async () => undefined);
    const service = new OptionsService();

    await service.createMany({ orm: { public: { Option: { create } } } } as never, 9, [
      { text: "Red", isCorrect: true },
      { text: "Blue", isCorrect: false },
    ]);

    expect(create).toHaveBeenNthCalledWith(1, {
      questionId: 9,
      position: 0,
      text: "Red",
      isCorrect: true,
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      questionId: 9,
      position: 1,
      text: "Blue",
      isCorrect: false,
    });
  });

  it("does nothing when there are no options", async () => {
    const create = jest.fn<(input: unknown) => Promise<void>>(async () => undefined);
    const service = new OptionsService();

    await service.createMany({ orm: { public: { Option: { create } } } } as never, 9, []);

    expect(create).not.toHaveBeenCalled();
  });
});
