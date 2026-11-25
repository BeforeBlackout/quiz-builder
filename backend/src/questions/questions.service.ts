import { Inject, Injectable } from "@nestjs/common";

import { OptionsService } from "../options/options.service.ts";
import type { DbClient } from "../prisma/db.ts";
import type { CreateQuizInput } from "../quizzes/schemas/create.ts";

export type CreateQuestionInput = CreateQuizInput["questions"][number];

@Injectable()
export class QuestionsService {
  constructor(@Inject(OptionsService) private readonly options: OptionsService) {}

  async create(
    client: DbClient,
    quizId: number,
    position: number,
    question: CreateQuestionInput,
  ): Promise<void> {
    const created = await client.orm.public.Question.create({
      quizId,
      position,
      type: question.type,
      prompt: question.prompt,
      booleanAnswer: question.type === "BOOLEAN" ? question.booleanAnswer : null,
      textAnswer: question.type === "INPUT" ? question.textAnswer : null,
    });

    if (question.type === "CHECKBOX") {
      await this.options.createMany(client, created.id, question.options);
    }
  }
}
