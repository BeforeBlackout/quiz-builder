import { existsSync } from "node:fs";
import path from "node:path";

import EmbeddedPostgres from "embedded-postgres";

const databaseDir = path.resolve(import.meta.dirname, "../../.pgdata");
const port = 5432;

const postgres = new EmbeddedPostgres({
  databaseDir,
  user: "quiz",
  password: "quiz",
  port,
  persistent: true,
  autoRehydrateSymlinks: true,
});

if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
  await postgres.initialise();
}

await postgres.start();

try {
  await postgres.createDatabase("quiz_builder");
  console.log("Created database quiz_builder");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("already exists")) {
    throw error;
  }
}

console.log(`Postgres ready at postgresql://quiz:quiz@localhost:${port}/quiz_builder`);
await new Promise(() => {});
