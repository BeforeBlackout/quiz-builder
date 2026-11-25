import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { PrismaService } from "../prisma.service.ts";
import { QuizzesModule } from "../quizzes/quizzes.module.ts";
import { QuizzesService } from "../quizzes/quizzes.service.ts";
import { sampleQuiz } from "./seed.ts";

const app = await NestFactory.createApplicationContext(QuizzesModule, {
  logger: ["error", "warn"],
});

try {
  const prisma = app.get(PrismaService);
  const quizzes = app.get(QuizzesService);

  const existing = await prisma.db.orm.public.Quiz.where({ title: sampleQuiz.title })
    .select("id")
    .first();

  if (existing) {
    console.log(`Sample quiz already exists (${existing.id})`);
  } else {
    const quiz = await quizzes.create(sampleQuiz);
    console.log(`Seeded sample quiz ${quiz.id}`);
  }
} finally {
  await app.close();
}
