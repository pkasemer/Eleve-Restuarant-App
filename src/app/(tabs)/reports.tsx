import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Share, View } from 'react-native';

import {
  Button,
  Card,
  DailyBars,
  EmptyState,
  ListGroup,
  ListRow,
  Money,
  Monogram,
  PulseCard,
  Screen,
  Section,
  Segmented,
  ShareBar,
  Text,
  accentFor,
  useTheme,
  type DayDatum,
} from '@/design';
import { listExpenses, listSales, type Expense, type Sale } from '@/db/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { toCsv } from '@/lib/csv';
import { toPlainAmount } from '@/lib/money';
import { groupOrders, receiptCode, summarizeOrder } from '@/lib/orders';
import { useCurrency } from '@/state/currency';
import {
  addDays,
  dayKey,
  formatDayLabel,
  formatTime,
  lastDaysRange,
  thisMonthRange,
  todayRange,
  type DateRange,
} from '@/lib/dates';

const RANGES = {
  today: { label: 'Today', long: 'today', range: () => todayRange() },
  week: { label: '7 days', long: 'last 7 days', range: () => lastDaysRange(7) },
  month30: { label: '30 days', long: 'last 30 days', range: () => lastDaysRange(30) },
  month: { label: 'Month', long: 'this month', range: () => thisMonthRange() },
} satisfies Record<string, { label: string; long: string; range: () => DateRange }>;
type RangeKey = keyof typeof RANGES;

type ReportData = { sales: Sale[]; expenses: Expense[]; range: DateRange };

const MAX_ORDERS = 25;

function keyOf(d: Date) {
  return dayKey(d.toISOString());
}

export default function ReportsScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { colors, space } = theme;
  const [rangeKey, setRangeKey] = useState<RangeKey>('week');

  const load = useCallback(async (): Promise<ReportData> => {
    const range = RANGES[rangeKey].range();
    const [sales, expenses] = await Promise.all([listSales(db, range), listExpenses(db, range)]);
    return { sales, expenses, range };
  }, [db, rangeKey]);
  const { currency, format } = useCurrency();
  const cents = (n: number) => toPlainAmount(n, currency);
  const [{ sales, expenses, range }, reload] = useFocusData<ReportData>(load, {
    sales: [],
    expenses: [],
    range: todayRange(),
  });

  const report = useMemo(() => {
    const salesTotal = sales.reduce((s, r) => s + r.total_cents, 0);
    const expenseTotal = expenses.reduce((s, r) => s + r.total_cents, 0);

    // Every calendar day in range (so quiet days show as gaps, not missing bars).
    const days = new Map<string, { sales: number; spent: number }>();
    for (let d = range.from; d < range.to; d = addDays(d, 1)) days.set(keyOf(d), { sales: 0, spent: 0 });
    for (const s of sales) {
      const d = days.get(dayKey(s.sold_at));
      if (d) d.sales += s.total_cents;
    }
    for (const e of expenses) {
      const d = days.get(dayKey(e.spent_at));
      if (d) d.spent += e.total_cents;
    }
    const dayList = [...days.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    const chart: DayDatum[] = dayList.map(([k, d]) => {
      const [y, m, day] = k.split('-').map(Number);
      const date = new Date(y, m - 1, day);
      return {
        key: k,
        label:
          dayList.length <= 7
            ? date.toLocaleDateString([], { weekday: 'short' })
            : String(day),
        sales: d.sales,
        spent: d.spent,
      };
    });

    const items = new Map<string, { qty: number; total: number }>();
    for (const s of sales) {
      const i = items.get(s.item_name) ?? { qty: 0, total: 0 };
      i.qty += s.quantity;
      i.total += s.total_cents;
      items.set(s.item_name, i);
    }

    const cats = new Map<string, number>();
    for (const e of expenses) cats.set(e.category, (cats.get(e.category) ?? 0) + e.total_cents);

    return {
      salesTotal,
      expenseTotal,
      chart,
      activeDays: dayList.filter(([, d]) => d.sales || d.spent).reverse(),
      orders: groupOrders(sales),
      topItems: [...items.entries()].sort((a, b) => b[1].total - a[1].total),
      categories: [...cats.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [sales, expenses, range]);

  const label = RANGES[rangeKey].label;
  const empty = sales.length === 0 && expenses.length === 0;
  const maxItem = Math.max(1, ...report.topItems.map(([, i]) => i.total));
  const maxCat = Math.max(1, ...report.categories.map(([, t]) => t));

  const exportSales = () =>
    Share.share({
      title: `Eleve sales – ${label}`,
      message: toCsv(
        ['sold_at', 'item', 'quantity', 'unit_price', 'total'],
        sales.map((s) => [s.sold_at, s.item_name, s.quantity, cents(s.unit_price_cents), cents(s.total_cents)]),
      ),
    });

  const exportPurchases = () =>
    Share.share({
      title: `Eleve purchases – ${label}`,
      message: toCsv(
        ['spent_at', 'description', 'category', 'quantity', 'unit_price', 'total'],
        expenses.map((e) => [
          e.spent_at,
          e.description,
          e.category,
          e.quantity,
          cents(e.unit_price_cents),
          cents(e.total_cents),
        ]),
      ),
    });

  return (
    <Screen title="Reports" subtitle="How the restaurant is doing" onRefresh={reload}>
      <Segmented
        options={(Object.keys(RANGES) as RangeKey[]).map((k) => ({ key: k, label: RANGES[k].label }))}
        value={rangeKey}
        onChange={setRangeKey}
      />

      <Card variant="raised" padding="lg">
        <PulseCard
          label={`Net · ${RANGES[rangeKey].long}`}
          net={report.salesTotal - report.expenseTotal}
          sales={report.salesTotal}
          spent={report.expenseTotal}
        />
      </Card>

      {empty ? (
        <EmptyState
          title="Nothing recorded in this period"
          description="Pick a longer range, or record a sale or purchase to see it here."
        />
      ) : (
        <>
          <Section title="Day by day">
            <Card padding="lg">
              <View style={{ gap: space[5] }}>
                <DailyBars data={report.chart} />
                <View style={{ flexDirection: 'row', gap: space[6] }}>
                  <Legend color={colors.positive} label="Sales" />
                  <Legend color={colors.negative} label="Spent" />
                </View>
              </View>
            </Card>
            <ListGroup>
              {report.activeDays.map(([k, d]) => (
                <ListRow
                  key={k}
                  title={formatDayLabel(k)}
                  subtitle={`In ${format(d.sales)} · Out ${format(d.spent)}`}
                  trailing={<Money cents={d.sales - d.spent} size="m" signed tone={d.sales - d.spent < 0 ? 'negative' : 'positive'} />}
                />
              ))}
            </ListGroup>
          </Section>

          <Section title={`Orders · ${report.orders.length}`}>
            {report.orders.length === 0 ? (
              <EmptyState title="No orders in this period" />
            ) : (
              <>
                <ListGroup>
                  {report.orders.slice(0, MAX_ORDERS).map((o) => (
                    <ListRow
                      key={o.orderId}
                      title={`#${receiptCode(o.orderId)} · ${new Date(o.soldAt).toLocaleDateString([], {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}, ${formatTime(o.soldAt)}`}
                      subtitle={summarizeOrder(o)}
                      trailing={<Money cents={o.totalCents} size="m" />}
                      chevron
                      accessibilityHint="Opens the receipt"
                      onPress={() =>
                        router.push({ pathname: '/receipt/[orderId]', params: { orderId: o.orderId } })
                      }
                    />
                  ))}
                </ListGroup>
                {report.orders.length > MAX_ORDERS ? (
                  <Text variant="caption" tone="tertiary" align="center">
                    Showing the latest {MAX_ORDERS} of {report.orders.length} orders. Pick a shorter period to see
                    older ones.
                  </Text>
                ) : null}
              </>
            )}
          </Section>

          <Section title="Food sold">
            {report.topItems.length === 0 ? (
              <EmptyState title="Nothing sold in this period" />
            ) : (
              <ListGroup>
                {report.topItems.map(([name, i]) => {
                  const accent = accentFor(theme, name);
                  return (
                    <ListRow
                      key={name}
                      title={name}
                      subtitle={`${i.qty} sold`}
                      leading={<Monogram label={name} bg={accent.bg} fg={accent.fg} />}
                      trailing={<Money cents={i.total} size="m" />}
                      footer={<ShareBar fraction={i.total / maxItem} color={colors.positive} />}
                    />
                  );
                })}
              </ListGroup>
            )}
          </Section>

          <Section title="Spending by category">
            {report.categories.length === 0 ? (
              <EmptyState title="No purchases in this period" />
            ) : (
              <ListGroup>
                {report.categories.map(([cat, total]) => (
                  <ListRow
                    key={cat}
                    title={cat}
                    trailing={<Money cents={total} size="m" />}
                    footer={<ShareBar fraction={total / maxCat} color={colors.negative} />}
                  />
                ))}
              </ListGroup>
            )}
          </Section>

          <Section title="Export">
            <Button label="Share sales as CSV" variant="secondary" onPress={exportSales} disabled={!sales.length} />
            <Button label="Share purchases as CSV" variant="secondary" onPress={exportPurchases} disabled={!expenses.length} />
          </Section>
        </>
      )}
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const { space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
      <Text variant="callout" tone="secondary">
        {label}
      </Text>
    </View>
  );
}
