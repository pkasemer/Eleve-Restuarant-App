import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { DateRange } from '@/lib/dates';

export type MenuItem = {
  id: string;
  name: string;
  price_cents: number;
  active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string | null;
};

export type Sale = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  unit_price_cents: number;
  quantity: number;
  total_cents: number;
  sold_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string | null;
};

export type Expense = {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  spent_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string | null;
};

export const EXPENSE_CATEGORIES = [
  'Ingredients',
  'Drinks',
  'Fuel / Gas',
  'Utilities',
  'Wages',
  'Rent',
  'Transport',
  'Other',
] as const;

const now = () => new Date().toISOString();

/* ------------------------------ Menu ------------------------------ */

export function listMenuItems(db: SQLiteDatabase) {
  return db.getAllAsync<MenuItem>(
    'SELECT * FROM menu_items WHERE deleted_at IS NULL ORDER BY name COLLATE NOCASE',
  );
}

export async function addMenuItem(db: SQLiteDatabase, name: string, priceCents: number) {
  const t = now();
  await db.runAsync(
    `INSERT INTO menu_items (id, name, price_cents, active, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)`,
    randomUUID(),
    name.trim(),
    priceCents,
    t,
    t,
  );
}

export async function updateMenuItem(
  db: SQLiteDatabase,
  id: string,
  patch: { name: string; priceCents: number; active: boolean },
) {
  await db.runAsync(
    'UPDATE menu_items SET name = ?, price_cents = ?, active = ?, updated_at = ? WHERE id = ?',
    patch.name.trim(),
    patch.priceCents,
    patch.active ? 1 : 0,
    now(),
    id,
  );
}

export async function deleteMenuItem(db: SQLiteDatabase, id: string) {
  const t = now();
  await db.runAsync('UPDATE menu_items SET deleted_at = ?, updated_at = ? WHERE id = ?', t, t, id);
}

/* ------------------------------ Sales ------------------------------ */

export type OrderLine = {
  menuItemId: string | null;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

/**
 * Records one order: one `sales` row per line, all sharing an order_id and sold_at.
 * Returns the new order's id (or null if there was nothing to record).
 */
export async function recordOrder(
  db: SQLiteDatabase,
  lines: OrderLine[],
  soldAt = now(),
): Promise<string | null> {
  if (lines.length === 0) return null;
  const orderId = randomUUID();
  const t = now();
  await db.withTransactionAsync(async () => {
    for (const l of lines) {
      await db.runAsync(
        `INSERT INTO sales
           (id, order_id, menu_item_id, item_name, unit_price_cents, quantity, total_cents,
            sold_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        randomUUID(),
        orderId,
        l.menuItemId,
        l.name.trim(),
        l.unitPriceCents,
        l.quantity,
        l.unitPriceCents * l.quantity,
        soldAt,
        t,
        t,
      );
    }
  });
  return orderId;
}

/** All live lines of one order, in the order they were added. */
export function getOrderLines(db: SQLiteDatabase, orderId: string) {
  return db.getAllAsync<Sale>(
    'SELECT * FROM sales WHERE order_id = ? AND deleted_at IS NULL ORDER BY created_at, rowid',
    orderId,
  );
}

/** Soft-deletes every line of an order (so the deletion syncs too). */
export async function deleteOrder(db: SQLiteDatabase, orderId: string) {
  const t = now();
  await db.runAsync(
    'UPDATE sales SET deleted_at = ?, updated_at = ? WHERE order_id = ? AND deleted_at IS NULL',
    t,
    t,
    orderId,
  );
}

export function listSales(db: SQLiteDatabase, range: DateRange) {
  return db.getAllAsync<Sale>(
    `SELECT * FROM sales
     WHERE deleted_at IS NULL AND sold_at >= ? AND sold_at < ?
     ORDER BY sold_at DESC, rowid ASC`,
    range.from.toISOString(),
    range.to.toISOString(),
  );
}

export async function deleteSale(db: SQLiteDatabase, id: string) {
  const t = now();
  await db.runAsync('UPDATE sales SET deleted_at = ?, updated_at = ? WHERE id = ?', t, t, id);
}

/* ----------------------------- Expenses ----------------------------- */

export async function addExpense(
  db: SQLiteDatabase,
  e: {
    description: string;
    category: string;
    quantity: number;
    unitPriceCents: number;
    spentAt?: string;
  },
) {
  const t = now();
  await db.runAsync(
    `INSERT INTO expenses
       (id, description, category, quantity, unit_price_cents, total_cents,
        spent_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    randomUUID(),
    e.description.trim(),
    e.category,
    e.quantity,
    e.unitPriceCents,
    Math.round(e.quantity * e.unitPriceCents),
    e.spentAt ?? t,
    t,
    t,
  );
}

export function listExpenses(db: SQLiteDatabase, range: DateRange) {
  return db.getAllAsync<Expense>(
    `SELECT * FROM expenses
     WHERE deleted_at IS NULL AND spent_at >= ? AND spent_at < ?
     ORDER BY spent_at DESC`,
    range.from.toISOString(),
    range.to.toISOString(),
  );
}

export async function deleteExpense(db: SQLiteDatabase, id: string) {
  const t = now();
  await db.runAsync('UPDATE expenses SET deleted_at = ?, updated_at = ? WHERE id = ?', t, t, id);
}

/* ----------------------------- Settings ----------------------------- */

export type Settings = {
  business_name: string;
  currency: string;
  mcp_url: string;
  mcp_tool: string;
  device_id: string;
  last_sync_at: string;
};

const SETTING_DEFAULTS: Settings = {
  business_name: 'My Restaurant',
  currency: 'UGX',
  mcp_url: '',
  mcp_tool: 'sync_records',
  device_id: '',
  last_sync_at: '',
};

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );
  const s: Settings = { ...SETTING_DEFAULTS };
  for (const r of rows) {
    if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  }
  if (!s.device_id) {
    s.device_id = randomUUID();
    await setSetting(db, 'device_id', s.device_id);
  }
  return s;
}

export async function setSetting<K extends keyof Settings>(
  db: SQLiteDatabase,
  key: K,
  value: Settings[K],
) {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

/* ------------------------------- Sync ------------------------------- */

const PENDING = '(synced_at IS NULL OR updated_at > synced_at)';

export type SyncTable = 'menu_items' | 'sales' | 'expenses';

export type PendingChanges = {
  menu_items: MenuItem[];
  sales: Sale[];
  expenses: Expense[];
};

export async function getPendingChanges(db: SQLiteDatabase): Promise<PendingChanges> {
  const [menu_items, sales, expenses] = await Promise.all([
    db.getAllAsync<MenuItem>(`SELECT * FROM menu_items WHERE ${PENDING}`),
    db.getAllAsync<Sale>(`SELECT * FROM sales WHERE ${PENDING}`),
    db.getAllAsync<Expense>(`SELECT * FROM expenses WHERE ${PENDING}`),
  ]);
  return { menu_items, sales, expenses };
}

export async function countPending(db: SQLiteDatabase): Promise<number> {
  const counts = await Promise.all(
    (['menu_items', 'sales', 'expenses'] as const).map((t) =>
      db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t} WHERE ${PENDING}`),
    ),
  );
  return counts.reduce((sum, r) => sum + (r?.n ?? 0), 0);
}

/**
 * Mark rows as synced. `syncedAt` must be a timestamp captured BEFORE the pending rows were read,
 * so any row edited during the upload still has updated_at > synced_at and is re-sent next time.
 */
export async function markSynced(
  db: SQLiteDatabase,
  table: SyncTable,
  ids: string[],
  syncedAt: string,
) {
  if (ids.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const marks = chunk.map(() => '?').join(',');
      await db.runAsync(
        `UPDATE ${table} SET synced_at = ? WHERE id IN (${marks})`,
        syncedAt,
        ...chunk,
      );
    }
  });
}
