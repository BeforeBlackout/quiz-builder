export const questionTypes = ["BOOLEAN", "INPUT", "CHECKBOX"] as const;

export type QuestionTypeName = (typeof questionTypes)[number];

export const questionTypeLabels: Record<QuestionTypeName, string> = {
  BOOLEAN: "Boolean",
  INPUT: "Input",
  CHECKBOX: "Checkbox",
};

export const booleanChoices = [
  { label: "True", value: true },
  { label: "False", value: false },
] as const;

export const minCheckboxOptions = 2;
