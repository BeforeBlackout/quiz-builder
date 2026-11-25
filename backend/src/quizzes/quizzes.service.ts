import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { DbClient } from "../prisma/db.ts";
import { PrismaService } from "../prisma.service.ts";
import { QuestionsService } from "../questions/questions.service.ts";
import type { CreateQuizDto } from "./dto/create-quiz.dto.ts";
import type { QuizDetailDto, QuizSummaryDto } from "./dto/quiz.dto.ts";
import { createQuizSchema } from "./schemas/create.ts";

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(QuestionsService) private readonly questions: QuestionsService,
  ) {}

  async create(body: unknown): Promise<QuizDetailDto> {
    const parsed = createQuizSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    const input: CreateQuizDto = parsed.data;
    const id = await this.prisma.db.transaction(async (tx) => {
      const quiz = await tx.orm.public.Quiz.create({ title: input.title });

      for (const [position, question] of input.questions.entries()) {
        await this.questions.create(tx, quiz.id, position, question);
      }

      return quiz.id;
    });

    const created = await this.readQuiz(this.prisma.db, id);
    if (!created) {
      throw new Error(`Quiz ${id} was created but could not be read back`);
    }
    return created;
  }

  async list(): Promise<QuizSummaryDto[]> {
    const rows = await this.prisma.db.orm.public.Quiz.select("id", "title")
      .include("questions", (questions) => questions.count())
      .orderBy((quiz) => quiz.createdAt.desc())
      .all();

    return rows.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz.questions,
    }));
  }

  async findOne(id: number): Promise<QuizDetailDto> {
    const quiz = await this.readQuiz(this.prisma.db, id);
    if (!quiz) {
      throw new NotFoundException(`Quiz ${id} was not found`);
    }
    return quiz;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.prisma.db.orm.public.Quiz.where({ id }).delete();
    if (deleted === null) {
      throw new NotFoundException(`Quiz ${id} was not found`);
    }
  }

  private async readQuiz(client: DbClient, id: number): Promise<QuizDetailDto | null> {
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
      return null;
    }

    return {
      id: quiz.id,
      title: quiz.title,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      questions: quiz.questions.map((question) => ({
        id: question.id,
        position: question.position,
        type: question.type,
        prompt: question.prompt,
        booleanAnswer: question.booleanAnswer,
        textAnswer: question.textAnswer,
        options: question.options.map((option) => ({
          id: option.id,
          position: option.position,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      })),
    };
  }
}
