# Mise — the Eleve design system

> *Mise en place*: everything in its place before service.

Mise is the UI/UX system for Eleve, a counter-speed POS for a small restaurant. It takes the best of two reference systems and wraps them in Uber's stark colour language: black and white carry the brand, greys carry structure, and colour is reserved for meaning.

| From **Stripe** | From **Square POS** | Uniquely **Eleve** |
| --- | --- | --- |
| Calm precision: hairline borders, whisper shadows | Big tap targets (52–64pt), tile grid for items | **Uber-style palette**: ink black primary, white canvas, grey scale; green in, red out, amber attention, blue links |
| Status pills with tinted fills | A persistent **charge bar** pinned above the tabs | The **Pulse** bar: money in vs. money out at a glance |
| Tabular figures, metric-first dashboards | Bold amounts, numeric keypad | The **Ticket**: light-grey order paper with a perforated tear line |
| Sunken inputs, focus rings, inline errors | One primary action per screen | **Ledger rows** with built-in proportion bars |

Live reference: **Settings → About → Design system** inside the app (route `/design-system`).

## Principles

1. **Money is the hero.** Amounts are tabular, large, with the currency and cents set small and quiet.
2. **One thumb, full speed.** Targets are 52–64pt; the main action lives at the bottom where the thumb rests.
3. **Calm precision.** Hairlines do the work; shadows only whisper. No decoration without a job.
4. **Honest status.** Every record shows its state (synced, waiting, failed). **Green means money in, red means money out — nothing else is allowed to be green or red.**
5. **Colour means something.** Black and white are the brand and the primary action. Colour appears only to say what a thing is: green in, red out, amber attention, blue a link. Plain words, no decoration.

## Brand mark, app icon and splash

- **The mark** is a bold, flat "E" whose three arms grow in length going up: the letter, and "elevate". Pure black and white, in the spirit of Uber's stark identity, but an original shape.
- **App icon:** the white mark on solid black (`#0B0B0B`). Android gets a matching adaptive icon (foreground, black background, and a monochrome layer for themed icons); iOS uses the full-bleed icon.
- **Splash:** black screen, white mark above an "Eleve" wordmark set in Inter Bold.
- **In code:** use `<Mark size={…} color={…} />` (drawn with Views, same geometry as the icon files).
- **Files:** `assets/images/icon.png`, `android-icon-*.png`, `splash-icon.png`, `favicon.png`. They are generated from the mark's geometry; to change the brand, regenerate them and update `Mark.tsx`.
- Icon and splash are native resources: after changing them, run `npx expo prebuild --platform android` and rebuild the dev client.

## Tokens (`src/design/tokens.ts`)

Never use raw hex or magic numbers in screens. Light and dark values exist for every color token.

### Color

| Group | Tokens | Light |
| --- | --- | --- |
| Surfaces | `bg` · `surface` · `surfaceSunken` · `surfaceInverse` · `ticket` | `#FFFFFF` `#FFFFFF` `#F3F3F3` `#000000` `#F6F6F6` |
| Ink | `text` · `textSecondary` · `textTertiary` · `textInverse` | `#000000` `#545454` `#6B6B6B` `#FFFFFF` |
| Lines | `border` (hairline) · `borderStrong` · `focus` | `#E2E2E2` `#AFAFAF` `#000000` |
| Brand · Ink | `primary` · `primaryPressed` · `primarySoft` · `onPrimary` | `#000000` `#333333` `#EEEEEE` `#FFFFFF` |
| Money in | `positive` / `positiveSoft` | `#048848` / `#EAF6ED` |
| Money out | `negative` / `negativeSoft` | `#E11900` / `#FFF0EE` |
| Attention | `warning` (amber, text-safe) / `warningSoft` | `#996F00` / `#FFF2D9` |
| Info / links | `info` / `infoSoft` | `#276EF1` / `#EFF3FE` |

Dark mode inverts the brand: white primary on a black canvas, surfaces `#141414` / `#1F1F1F`, and brighter semantic colours (`#06C167` in, `#FF6B5B` out, `#FFC043` attention, `#5B91F4` info). The charge bar inverts too: a white bar with a black button.

**Dish accents:** six tinted pairs, chosen deterministically from a dish's name (`accentFor`) so "Chicken curry" is always the same color everywhere.

### Typography — Inter

| Variant | Size / line | Use |
| --- | --- | --- |
| `figureXL` | 44/50, bold | The one hero number on a screen |
| `figureL` | 28/34, bold | Section totals, charge bar |
| `figureM` | 17/22, semibold | Row amounts |
| `figureS` | 14/18, medium | Counts, unit prices |
| `title1` / `title2` | 30/36 · 22/28 | Screen and sheet titles |
| `headline` | 17/22, semibold | Section headings |
| `body` / `bodyStrong` | 16/22 | Default text, row titles |
| `callout` | 14/20 | Secondary text, labels |
| `caption` | 12.5/17 | Hints, metadata |
| `overline` | 11/14, uppercase | Eyebrows and card labels |

All `figure*` variants use tabular numbers so columns of prices align.

### Space, shape, depth, motion

- **Space** — 4pt grid: `2 4 8 12 16 20 24 32 40 56` (`space[1]` … `space[10]`).
- **Radius** — `sm 8 · md 12 · lg 16 · xl 24 · pill`.
- **Hit sizes** — `min 44` (accessibility floor), `control 52`, `pos 64`.
- **Elevation** — `sm` (cards), `md`, `lg` (charge bar). Neutral black, low opacity.
- **Motion** — press feedback only: scale `0.97` + opacity `0.9` over 120ms. No decorative animation at the counter.

## Components (`src/design`, import from `@/design`)

| Component | Purpose |
| --- | --- |
| `Text` | Every piece of text. `variant` + `tone` (default, secondary, tertiary, inverse, primary, positive, negative, warning, info). |
| `Money` | The hero. Sizes `xl l m s`; quiet currency and cents; `signed` shows `+`; minus is a true `−`. Reads the currency from the app-wide setting (no `currency` prop) and hides decimals for currencies that have none, like UGX. |
| `Button` | `primary` (one per screen), `secondary`, `ghost`, `danger`, `inverse`; sizes `sm md lg`; `icon`, `loading`, `disabled`. |
| `Card` | `flat`, `raised`, `sunken`; padding `none sm md lg`. |
| `Badge` | Status pill: `neutral positive negative warning info`, optional dot. |
| `Segmented` | Range/mode switch on a sunken track. |
| `Chip` | Selectable pill (categories, filters). |
| `Field` | Labelled input with prefix/suffix, helper, error, focus ring. |
| `Stepper` | Quantity − / +, 44pt targets. |
| `Keypad` + `applyKey` | Numeric pad for prices; caps at 2 decimals. |
| `ListGroup` / `ListRow` / `Monogram` | Ledger rows: leading, title/subtitle, trailing, footer, auto dividers. |
| `PulseBar` / `PulseCard` | **Signature.** Net figure + in-vs-out bar + breakdown. |
| `DailyBars` / `ShareBar` | Paired daily bars; proportion bar inside a row. |
| `ItemTile` | Menu tile for Sell; ink ring and quantity badge when on the ticket. |
| `TicketCard` / `TicketLine` | **Signature.** The open order as light-grey paper with a tear line. |
| `ActionBar` | **Signature.** The ink charge bar: summary left, single action right. |
| `Screen` / `Section` | Scaffold with large title, refresh, footer slot; headed groups with an action link. |
| `Banner` / `EmptyState` | Inline feedback as a soft tinted card (no side border) with an optional action link such as "Receipt"; friendly empty states. |
| `OrderCard` | **Signature.** Sales made together in one card: time, receipt code, order total, the items, and a "View receipt" footer. Tap opens the receipt; long-press deletes. |
| `ReceiptSheet` | The receipt: business name, code, date, itemised lines with unit prices, dashed tear lines, total, thank-you. |
| `Glyph` | Tiny icon set drawn with Views (no native deps). |
| `Mark` | The Eleve brand mark, drawn with Views. |

## UX patterns

- **Tab bar (Uber-style):** a flat bar with a hairline on top, no selection pill, labels always visible. The active tab is pure ink (black, or white in dark mode) with a bold label; inactive tabs are grey. On iOS the active icon switches to its filled variant. Five tabs: Today, Sell, Buy, Reports, Settings.
- **Sell:** tap a dish → it joins the **Ticket** and its tile shows a quantity badge → adjust with steppers → **Record sale** on the charge bar → a green banner confirms. Off-menu items use the keypad. The banner's **Receipt** link opens the new order's receipt.
- **Orders & receipts:** every "Record sale" is one order (its lines share an `order_id`). Today and Reports show orders as grouped cards; tapping one opens the receipt, which can be shared as plain text. The receipt code (for example `#3F9A1C`) is the first six characters of the order id, so it stays unique across devices.
- **Buy:** description → category chips → quantity and unit price → the charge bar shows the live total → **Record**.
- **Today:** the Pulse card answers "how are we doing?" first; the ledgers below answer "what exactly?". Long-press deletes (with confirmation).
- **Reports:** a Segmented range switch drives one Pulse card, the daily bars, ranked food sold and spending by category.
- **Settings → Online sync:** a status badge always says one of *Not connected*, *All synced*, or *N waiting to sync*.
- **Empty states** explain what will appear and where to create it. **Errors** are inline and name the fix, never just "error".

## Currency

The default currency is **UGX** (Ugandan shilling), and it is configurable in **Settings → Business → Currency**; the change applies everywhere instantly.

- Supported: UGX, KES, TZS, RWF, ETB, NGN, GHS, ZAR, USD, EUR, GBP, INR (`src/lib/currency.ts`; add more there).
- Each currency declares its prefix and whether it uses decimals (UGX and RWF don't, so `UGX 50,000` not `UGX 50,000.00`). The keypad hides its decimal key and number fields switch to a whole-number keyboard for those currencies.
- **Storage never changes:** every amount is stored as an integer count of hundredths of the unit, whatever the currency, so switching currency needs no migration. It only relabels existing amounts — it does not convert them.
- Components never take a currency prop. Use `<Money cents={…} />`, or `useCurrency()` from `@/state/currency` for `format`, `parse` and `currency.decimals` in code.
- The ISO code (for example `UGX`) is sent to the sync server in the `currency` field.

## Accessibility

- Minimum 44pt targets; primary POS controls 52–64pt.
- Text and tone pairs target WCAG AA on both light and dark palettes; amber is only used as a text-safe dark amber on light surfaces.
- Status is never color-only: pills carry text; money carries a sign or label.
- Controls expose roles, labels, hints and state (`selected`, `disabled`, `busy`); `Money` reads as a full spoken amount; text scales to 130%.

## Extending the system

1. Add or change a value in `tokens.ts` first (and its dark twin), then use it through `useTheme()`.
2. Build new UI from existing components; add a new component to `src/design/components` only if a pattern appears in two places.
3. Export it from `src/design/index.ts` and add a sample to `src/app/design-system.tsx` so the gallery stays the source of truth.
4. Don't use raw colors, ad-hoc font sizes or one-off spacing in screens.

## File map

```
src/design/tokens.ts        colors (light/dark), type, space, radius, depth, motion
src/design/theme.tsx        useTheme(), useNavTheme(), accentFor()
src/design/components/      Text, Money, Button, Card, Badge, Segmented, Chip, Field,
                            List, Layout, Pulse, Charts, Pos (tile/ticket/keypad/charge bar), Glyph, Pressy
src/design/index.ts         the public API
src/app/design-system.tsx   in-app gallery
```

## Not yet in v1

Haptic feedback (needs a native module, so a dev-client rebuild), an iOS-specific tinted/dark icon variant, sheet/modal components, and swipe-to-delete rows.
