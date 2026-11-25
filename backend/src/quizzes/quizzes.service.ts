import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { DbClient } from "../prisma/db.ts";
import { PrismaService } from "../prisma.service.ts";
import { QuestionsService } from "../questions/questions.service.ts";
import type { CreateQuizInput } from "./create-quiz.schema.ts";
import {
  toQuizDetailDto,
  toQuizSummaryDto,
  type QuizDetailDto,
  type QuizSummaryDto,
} from "./quiz.dto.ts";

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(QuestionsService) private readonly questions: QuestionsService,
  ) {}

  async create(input: CreateQuizInput): Promise<QuizDetailDto> {
    return this.prisma.db.transaction(async (tx) => {
      const quiz = await tx.orm.public.Quiz.create({ title: input.title });

      for (const [position, question] of input.questions.entries()) {
        await this.questions.create(tx, quiz.id, position, question);
      }

      return this.readQuiz(tx, quiz.id);
    });
  }

  async list(): Promise<QuizSummaryDto[]> {
    const rows = await this.prisma.db.orm.public.Quiz.select("id", "title")
      .include("questions", (questions) => questions.count())
      .orderBy((quiz) => quiz.createdAt.desc())
      .all();

    return rows.map(toQuizSummaryDto);
  }

  async findOne(id: number): Promise<QuizDetailDto> {
    return this.readQuiz(this.prisma.db, id);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.prisma.db.orm.public.Quiz.where({ id }).delete();
    if (deleted === null) {
      throw new NotFoundException(`Quiz ${id} was not found`);
    }
  }

  private async readQuiz(client: DbClient, id: number): Promise<QuizDetailDto> {
    const quiz = await client.orm.public.Quiz.where({ id })
      .select("id", "title", "createdAt", "updatedAt")
      .include("questions", (question) =>
        question
          .select("id", "position", "type", "prompt", "booleanAnswer", "textAnswer")
          .orderBy((row) => row.position.asc())
          .include("options", (option) =>
            option
              .select("id", "position", "text", "isCorrect")
              .orderBy((row) => row.position.asc()),
          ),
      )
      .first();

    if (!quiz) {
      throw new NotFoundException(`Quiz ${id} was not found`);
    }

    return toQuizDetailDto(quiz);
  }
}
