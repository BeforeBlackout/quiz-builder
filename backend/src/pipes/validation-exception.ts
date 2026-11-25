import { BadRequestException } from "@nestjs/common";

type IssuePathSegment = PropertyKey | { readonly key: PropertyKey };

type SchemaIssue = {
  readonly message: string;
  readonly path?: readonly IssuePathSegment[] | undefined;
};

export type ValidationIssue = {
  path: string;
  message: string;
};

export function validationException(issues: readonly SchemaIssue[]): BadRequestException {
  return new BadRequestException(issues.map(toValidationIssue));
}

function toValidationIssue(issue: SchemaIssue): ValidationIssue {
  return {
    path: (issue.path ?? [])
      .map((segment) =>
        String(typeof segment === "object" && segment !== null ? segment.key : segment),
      )
      .join("."),
    message: issue.message,
  };
}
