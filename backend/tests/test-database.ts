import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import EmbeddedPostgres from "embedded-postgres";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export type TestDatabase = {
  url: string;
  stop: () => Promise<void>;
};

export async function startTestDatabase(): Promise<TestDatabase> {
  const dataDir = await mkdtemp(path.join(tmpdir(), "quiz-builder-pg-"));
  const port = await freePort();
  const logs: string[] = [];
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "quiz",
    password: "quiz",
    port,
    persistent: false,
    autoRehydrateSymlinks: true,
    onLog: (message) => {
      logs.push(String(message));
    },
    onError: (message) => {
      logs.push(String(message));
    },
  });

  try {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase("quiz_builder_test");
    const url = `postgresql://quiz:quiz@127.0.0.1:${port}/quiz_builder_test`;
    await migrate(url);
    return {
      url,
      stop: async () => {
        await postgres.stop().catch(() => undefined);
        await rm(dataDir, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await postgres.stop().catch(() => undefined);
    await rm(dataDir, { recursive: true, force: true });
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${detail}\n${logs.join("")}`, { cause: error });
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        server.close();
        reject(new Error("Could not reserve a TCP port"));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

function migrate(databaseUrl: string): Promise<void> {
  const env: NodeJS.ProcessEnv = { ...process.env, DATABASE_URL: databaseUrl };
  delete env["COMPOSER_DATABASE_URL"];

  return run(
    path.join(backendRoot, "node_modules/.bin/prisma"),
    ["db", "migrate", "--db", databaseUrl, "--no-advance-ref", "--yes"],
    env,
  );
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: backendRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code}\n${output}`));
    });
  });
}
