import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'eleve.db';

/**
 * Money is stored as integer minor units (cents) to avoid float drift.
 * Timestamps are ISO-8601 UTC strings.
 *
 * Sync bookkeeping: a row needs pushing when `synced_at IS NULL OR updated_at > synced_at`.
 * Deletes are soft (`deleted_at`) so they can be synced too.
 */
const MIGRATIONS: string[] = [
  /* v1 */ `
  CREATE TABLE menu_items (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    synced_at TEXT
  );

  CREATE TABLE sales (
    id TEXT PRIMARY KEY NOT NULL,
    order_id TEXT NOT NULL,
    menu_item_id TEXT,
    item_name TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    sold_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    synced_at TEXT
  );
  CREATE INDEX idx_sales_sold_at ON sales (sold_at);

  CREATE TABLE expenses (
    id TEXT PRIMARY KEY NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    spent_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    synced_at TEXT
  );
  CREATE INDEX idx_expenses_spent_at ON expenses (spent_at);

  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
];

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (; version < MIGRATIONS.length; version++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      // PRAGMA doesn't accept bound params; version is a trusted integer.
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
