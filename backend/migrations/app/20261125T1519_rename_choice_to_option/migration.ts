#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/610aca3d79f123b3f35d3bc3fbe4623c277fb1186537c010933cda0ad55b702a/contract';
import endContract from '../../snapshots/610aca3d79f123b3f35d3bc3fbe4623c277fb1186537c010933cda0ad55b702a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/9fa1745728605fde3c662c835068d2c309bda5d561fe09f380d8e0016ff322ea/contract';
import startContract from '../../snapshots/9fa1745728605fde3c662c835068d2c309bda5d561fe09f380d8e0016ff322ea/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [...this.renameTable({ schema: 'public', table: 'Choice', to: 'Option' })];
  }
}

MigrationCLI.run(import.meta.url, M);
