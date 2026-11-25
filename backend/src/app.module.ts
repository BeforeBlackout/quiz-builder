import { Module, StandardSchemaValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";

import { AppController } from "./app.controller.ts";
import { envSchema } from "./env.schema.ts";
import { validationException } from "./pipes/validation-exception.ts";
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
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new StandardSchemaValidationPipe({
          exceptionFactory: validationException,
        }),
    },
  ],
})
export class AppModule {}
