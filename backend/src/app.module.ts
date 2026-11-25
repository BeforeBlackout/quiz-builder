import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller.ts";
import { envSchema } from "./env.schema.ts";
import { PrismaModule } from "./prisma.module.ts";
import { QuizzesModule } from "./quizzes/quizzes.module.ts";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    PrismaModule,
    QuizzesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
