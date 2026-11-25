import { toOptionDto, type OptionDto } from "../options/option.dto.ts";
import type { FieldOutputTypes } from "../prisma/contract.d.ts";
import { QuestionType } from "./question.schema.ts";

export type QuestionRow = Pick<
  FieldOutputTypes["public"]["Question"],
  "id" | "position" | "type" | "prompt" | "booleanAnswer" | "textAnswer"
> & {
  options: OptionDto[];
};

type QuestionBase = Pick<QuestionRow, "id" | "position" | "prompt">;

export type BooleanQuestionDto = QuestionBase & {
  type: typeof QuestionType.BOOLEAN;
  booleanAnswer: NonNullable<QuestionRow["booleanAnswer"]>;
};

export type InputQuestionDto = QuestionBase & {
  type: typeof QuestionType.INPUT;
  textAnswer: NonNullable<QuestionRow["textAnswer"]>;
};

export type CheckboxQuestionDto = QuestionBase & {
  type: typeof QuestionType.CHECKBOX;
  options: QuestionRow["options"];
};

export type QuestionDto = BooleanQuestionDto | InputQuestionDto | CheckboxQuestionDto;

export function toQuestionDto(row: QuestionRow): QuestionDto {
  const base = { id: row.id, position: row.position, prompt: row.prompt };

  switch (row.type) {
    case QuestionType.BOOLEAN:
      if (row.booleanAnswer === null) {
        throw new Error(`Question ${row.id} is ${QuestionType.BOOLEAN} but has no booleanAnswer`);
      }
      return { ...base, type: QuestionType.BOOLEAN, booleanAnswer: row.booleanAnswer };
    case QuestionType.INPUT:
      if (row.textAnswer === null) {
        throw new Error(`Question ${row.id} is ${QuestionType.INPUT} but has no textAnswer`);
      }
      return { ...base, type: QuestionType.INPUT, textAnswer: row.textAnswer };
    case QuestionType.CHECKBOX:
      return { ...base, type: QuestionType.CHECKBOX, options: row.options.map(toOptionDto) };
    default: {
      const _exhaustive: never = row.type;
      throw new Error(`Unhandled question type: ${_exhaustive}`);
    }
  }
}
