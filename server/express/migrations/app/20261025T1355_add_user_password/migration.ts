#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/21e831925e671e2378d1f554dbcb09a581a62c5106cb3a63e8bed34d0e375f96/contract';
import endContract from '../../snapshots/21e831925e671e2378d1f554dbcb09a581a62c5106cb3a63e8bed34d0e375f96/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/3fa2cff68f268c6af69ac5d72085924103beef72c4f58c6c8fdbbe44c14aac79/contract';
import startContract from '../../snapshots/3fa2cff68f268c6af69ac5d72085924103beef72c4f58c6c8fdbbe44c14aac79/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
