import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";

import service from "../../service.ts";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

function loadComposerDatabase() {
  try {
    return service.load().database.client;
  } catch {
    return undefined;
  }
}

export const db =
  loadComposerDatabase() ??
  postgres({
    contract,
    ...(process.env["DATABASE_URL"] ? { url: process.env["DATABASE_URL"] } : {}),
  });

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Top-level client or an in-flight `db.transaction` callback client. */
export type DbClient = typeof db | TransactionClient;
