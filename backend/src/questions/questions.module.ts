import { Module } from "@nestjs/common";

import { OptionsModule } from "../options/options.module.ts";
import { QuestionsService } from "./questions.service.ts";

@Module({
  imports: [OptionsModule],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
