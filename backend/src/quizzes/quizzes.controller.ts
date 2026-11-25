import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from "@nestjs/common";

import { ParseIdPipe } from "../pipes/parse-id.pipe.ts";
import { createQuizSchema, type CreateQuizInput } from "./create-quiz.schema.ts";
import type { QuizDetailDto, QuizSummaryDto } from "./quiz.dto.ts";
import { QuizzesService } from "./quizzes.service.ts";

@Controller("quizzes")
export class QuizzesController {
  constructor(@Inject(QuizzesService) private readonly quizzesService: QuizzesService) {}

  @Post()
  @HttpCode(201)
  create(@Body({ schema: createQuizSchema }) body: CreateQuizInput): Promise<QuizDetailDto> {
    return this.quizzesService.create(body);
  }

  @Get()
  findAll(): Promise<QuizSummaryDto[]> {
    return this.quizzesService.list();
  }

  @Get(":id")
  findOne(@Param("id", ParseIdPipe) id: number): Promise<QuizDetailDto> {
    return this.quizzesService.findOne(id);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseIdPipe) id: number): Promise<void> {
    return this.quizzesService.remove(id);
  }
}
