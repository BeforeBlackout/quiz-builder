import { Injectable } from "@nestjs/common";

import type { DbClient } from "../prisma/db.ts";

export type CreateOptionInput = {
  text: string;
  isCorrect: boolean;
};

@Injectable()
export class OptionsService {
  async createMany(
    client: DbClient,
    questionId: number,
    options: CreateOptionInput[],
  ): Promise<void> {
    for (const [position, option] of options.entries()) {
      await client.orm.public.Option.create({
        questionId,
        position,
        text: option.text,
        isCorrect: option.isCorrect,
      });
    }
  }
}
