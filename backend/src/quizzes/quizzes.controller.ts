import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";

import type { QuizDetailDto, QuizSummaryDto } from "./dto/quiz.dto.ts";
import { QuizzesService } from "./quizzes.service.ts";

@Controller("quizzes")
export class QuizzesController {
  constructor(@Inject(QuizzesService) private readonly quizzesService: QuizzesService) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: unknown): Promise<QuizDetailDto> {
    return this.quizzesService.create(body);
  }

  @Get()
  findAll(): Promise<QuizSummaryDto[]> {
    return this.quizzesService.list();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<QuizDetailDto> {
    return this.quizzesService.findOne(id);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.quizzesService.remove(id);
  }
}
