import "dotenv/config";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.ts";
import type { Env } from "./env.schema.ts";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);
  const port = config.get("PORT");
  const frontendOrigin = config.get("FRONTEND_ORIGIN");

  app.enableCors({
    origin: frontendOrigin,
  });
  await app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
