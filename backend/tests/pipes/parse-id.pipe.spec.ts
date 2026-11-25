import { describe, expect, it } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";

import { ID_MAX, ParseIdPipe } from "../../src/pipes/parse-id.pipe.ts";

describe("ParseIdPipe", () => {
  const pipe = new ParseIdPipe();

  it.each([
    ["1", 1],
    ["42", 42],
    [String(ID_MAX), ID_MAX],
  ])("accepts %s", (raw, expected) => {
    expect(pipe.transform(raw)).toBe(expected);
  });

  it.each(["", "0", "-1", "01", "1.0", "1e3", "0x10", " 7", "abc", String(ID_MAX + 1)])(
    "rejects %j",
    (raw) => {
      expect(() => pipe.transform(raw)).toThrow(BadRequestException);
    },
  );
});
