import { spawn, type ChildProcess } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import request from "supertest";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const frontendOrigin = "http://localhost:3000";

export type TestServer = {
  origin: string;
  stop: () => Promise<void>;
};

export async function startTestServer(databaseUrl: string): Promise<TestServer> {
  const port = await freePort();
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    PORT: String(port),
    FRONTEND_ORIGIN: frontendOrigin,
  };
  delete env["COMPOSER_DATABASE_URL"];

  const child = spawn(path.join(backendRoot, "node_modules/.bin/tsx"), ["src/main.ts"], {
    cwd: backendRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });

  const origin = `http://127.0.0.1:${port}`;
  try {
    await waitUntilReady(origin, child, () => output);
  } catch (error) {
    await stopChild(child);
    throw error;
  }

  return {
    origin,
    stop: () => stopChild(child),
  };
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

async function waitUntilReady(
  origin: string,
  child: ChildProcess,
  output: () => string,
): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 30_000) {
    if (child.exitCode !== null) {
      throw new Error(`API exited ${child.exitCode}\n${output()}`);
    }
    try {
      await request(origin).get("/").expect(200);
      return;
    } catch {
      await delay(200);
    }
  }
  throw new Error(`API did not start\n${output()}`);
}

function stopChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 5_000);
    child.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
