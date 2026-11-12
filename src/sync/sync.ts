import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getPendingChanges, getSettings, markSynced, setSetting } from '@/db/repo';
import { getCurrency } from '@/lib/currency';
import { McpClient } from '@/sync/mcp-client';

const TOKEN_KEY = 'eleve_mcp_token';
const BATCH_SIZE = 200;

export const getMcpToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export async function setMcpToken(token: string) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export type SyncResult = { pushed: number };

const stripSyncColumn = <T extends { synced_at: string | null }>(rows: T[]) =>
  rows.map(({ synced_at: _ignored, ...rest }) => rest);

/**
 * Push-only sync. Sends rows that are new or changed since their last sync to the configured
 * MCP server by calling a tool (default name `sync_records`). The server should upsert by `id`
 * so retries are safe. See README "MCP sync contract".
 */
export async function syncNow(db: SQLiteDatabase): Promise<SyncResult> {
  const settings = await getSettings(db);
  if (!settings.mcp_url) throw new Error('Set the MCP server URL in Settings first.');

  // Captured BEFORE reading rows so edits made mid-upload stay pending.
  const startedAt = new Date().toISOString();
  const pending = await getPendingChanges(db);
  const total = pending.menu_items.length + pending.sales.length + pending.expenses.length;
  if (total === 0) {
    await setSetting(db, 'last_sync_at', startedAt);
    return { pushed: 0 };
  }

  const client = new McpClient(settings.mcp_url, (await getMcpToken()) ?? undefined);
  try {
    await client.connect();

    const batches = Math.ceil(
      Math.max(pending.menu_items.length, pending.sales.length, pending.expenses.length) /
        BATCH_SIZE,
    );
    for (let i = 0; i < batches; i++) {
      const slice = <T,>(rows: T[]) => rows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const menu = slice(pending.menu_items);
      const sales = slice(pending.sales);
      const expenses = slice(pending.expenses);

      await client.callTool(settings.mcp_tool, {
        device_id: settings.device_id,
        business_name: settings.business_name,
        currency: getCurrency(settings.currency).code,
        sent_at: new Date().toISOString(),
        menu_items: stripSyncColumn(menu),
        sales: stripSyncColumn(sales),
        expenses: stripSyncColumn(expenses),
      });

      await markSynced(db, 'menu_items', menu.map((r) => r.id), startedAt);
      await markSynced(db, 'sales', sales.map((r) => r.id), startedAt);
      await markSynced(db, 'expenses', expenses.map((r) => r.id), startedAt);
    }
  } finally {
    await client.close();
  }

  await setSetting(db, 'last_sync_at', startedAt);
  return { pushed: total };
}
