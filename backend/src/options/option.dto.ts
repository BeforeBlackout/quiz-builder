import type { FieldOutputTypes } from "../prisma/contract.d.ts";

export type OptionRow = FieldOutputTypes["public"]["Option"];

export type OptionDto = Pick<OptionRow, "id" | "position" | "text" | "isCorrect">;

export function toOptionDto(row: OptionDto): OptionDto {
  return {
    id: row.id,
    position: row.position,
    text: row.text,
    isCorrect: row.isCorrect,
  };
}
