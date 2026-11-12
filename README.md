# Eleve App

A lightweight, offline-first POS for a small restaurant. Track **what was sold and at what price**, **what was bought and at what price**, see reports, and sync to an online **MCP server**.

Built with Expo SDK 58, Expo Router, `expo-sqlite`, and a **development build** (`expo-dev-client`) — not Expo Go.

## Run it

Install dependencies once (already done if you scaffolded here):

```bash
npm install
```

Create a development build, install it on a device/emulator, then start Metro:

```bash
npm run android      # local build + install (needs Android Studio / SDK)
```

```bash
npm run build:dev:android   # or: cloud build with EAS (needs `npx eas-cli login` + `eas init`)
```

```bash
npm start            # starts Metro for the dev client
```

You only rebuild the dev client when native modules/config change; JS changes hot-reload.

Other scripts: `npm run lint`, `npm run typecheck`.

## What's in the app

| Tab | Purpose |
| --- | --- |
| **Today** | Sales / spent / net, today's **orders** (everything sold together grouped in one card, tap for its receipt) and today's purchases. Long-press an order or purchase to delete it. |
| **Sell** | Tap menu items to build an order (or add a custom item), then record it. A "Receipt" link appears right after. "Manage menu" edits dishes & prices. |
| **Buy** | Record a purchase: description, category, quantity, unit price. |
| **Reports** | Today / 7 days / 30 days / this month: totals, by-day breakdown, the period's orders (tap for a receipt), food sold, spending by category, CSV share. |
| **Receipt** | Opened from an order: business, receipt code, date, items with unit prices, total. "Share receipt" sends a plain-text version (WhatsApp, SMS, email, …). |
| **Settings** | Business name, currency (default **UGX**, 12 to choose from), MCP server URL / tool name / token, "Save & sync now". |

## Design system

The UI is built on **Mise**, Eleve's own design system (Stripe-style calm precision + Square-POS tap ergonomics, in an Uber-style black-and-white palette with green/red for money in/out). Tokens and components live in `src/design` and are imported from `@/design`. See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), or open **Settings → About → Design system** in the app for the live gallery.

## Code layout

```
src/design/         Mise tokens, theme and components
src/app/            routes (Expo Router): (tabs)/ + menu + design-system
src/db/schema.ts    SQLite migrations (PRAGMA user_version)
src/db/repo.ts      all queries/mutations + sync bookkeeping
src/sync/           MCP client (Streamable HTTP) + push sync
src/components/ui.tsx   small shared UI kit
src/lib/            money, dates, csv helpers
```

Money is stored as integer cents. Deletes are soft (`deleted_at`) so they can sync. Every row carries `updated_at` / `synced_at`; a row is pending when `synced_at IS NULL OR updated_at > synced_at`.

## MCP sync contract

Sync is **push-only**. The app speaks MCP over the Streamable HTTP transport (protocol `2025-06-18`): `initialize` → `notifications/initialized` → `tools/call` → session `DELETE`. Responses may be JSON or `text/event-stream`. If a token is set it is sent as `Authorization: Bearer <token>` (stored in the device keychain via `expo-secure-store`).

Your server must expose a tool (default name **`sync_records`**, configurable in Settings) that accepts:

```jsonc
{
  "device_id": "uuid",           // stable per install
  "business_name": "string",
  "currency": "UGX",             // ISO 4217 code; amounts are stored as hundredths of the unit
  "sent_at": "ISO-8601",
  "menu_items": [{ "id", "name", "price_cents", "active", "created_at", "updated_at", "deleted_at" }],
  "sales":      [{ "id", "order_id", "menu_item_id", "item_name", "unit_price_cents", "quantity", "total_cents", "sold_at", "created_at", "updated_at", "deleted_at" }],
  "expenses":   [{ "id", "description", "category", "quantity", "unit_price_cents", "total_cents", "spent_at", "created_at", "updated_at", "deleted_at" }]
}
```

Requirements for the tool:

- **Upsert by `id`** (retries and re-sends are expected, so it must be idempotent). Rows with a non-null `deleted_at` are deletions.
- Return a normal result on success; return `isError: true` (or a JSON-RPC error) to make the app keep the rows pending.
- Batches are capped at 200 rows per table per call.

## Notes / next steps

- `bundleIdentifier` / `package` are set to `com.eleve.app` — change them in `app.json` before publishing.
- Currency defaults to UGX and is configurable in Settings. Changing it relabels existing amounts; it does not convert them.
- Not built yet: pull/two-device sync, user accounts, receipts printing, editing past entries.
