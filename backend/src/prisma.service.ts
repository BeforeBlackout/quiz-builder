import { Injectable, type OnModuleDestroy } from "@nestjs/common";

import { db } from "./prisma/db.ts";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly db = db;

  async onModuleDestroy() {
    await db.close();
  }
}
