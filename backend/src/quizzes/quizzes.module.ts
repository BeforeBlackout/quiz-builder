import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma.module.ts";
import { QuestionsModule } from "../questions/questions.module.ts";
import { QuizzesController } from "./quizzes.controller.ts";
import { QuizzesService } from "./quizzes.service.ts";

@Module({
  imports: [PrismaModule, QuestionsModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
