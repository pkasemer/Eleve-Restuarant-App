import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo } from 'react';
import { Alert, View } from 'react-native';

import {
  Badge,
  Card,
  EmptyState,
  ListGroup,
  ListRow,
  Money,
  OrderCard,
  PulseCard,
  Screen,
  Section,
  Text,
  useTheme,
} from '@/design';
import {
  deleteExpense,
  deleteOrder,
  getSettings,
  listExpenses,
  listSales,
  type Expense,
  type Sale,
  type Settings,
} from '@/db/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { formatTime, todayRange } from '@/lib/dates';
import { groupOrders, receiptCode } from '@/lib/orders';
import { useCurrency } from '@/state/currency';

type TodayData = { settings: Settings | null; sales: Sale[]; expenses: Expense[] };

export default function TodayScreen() {
  const db = useSQLiteContext();
  const { space } = useTheme();

  const load = useCallback(async (): Promise<TodayData> => {
    const range = todayRange();
    const [settings, sales, expenses] = await Promise.all([
      getSettings(db),
      listSales(db, range),
      listExpenses(db, range),
    ]);
    return { settings, sales, expenses };
  }, [db]);

  const [{ settings, sales, expenses }, reload] = useFocusData<TodayData>(load, {
    settings: null,
    sales: [],
    expenses: [],
  });

  const { format: money } = useCurrency();
  const orders = useMemo(() => groupOrders(sales), [sales]);
  const salesTotal = sales.reduce((s, r) => s + r.total_cents, 0);
  const expenseTotal = expenses.reduce((s, r) => s + r.total_cents, 0);

  const confirmDelete = (what: string, onConfirm: () => Promise<void>) =>
    Alert.alert('Delete this entry?', what, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onConfirm();
          await reload();
        },
      },
    ]);

  const dateLabel = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen title={settings?.business_name ?? 'Eleve'} subtitle={dateLabel} onRefresh={reload}>
      <Card variant="raised" padding="lg">
        <PulseCard net={salesTotal - expenseTotal} sales={salesTotal} spent={expenseTotal} />
      </Card>

      <Section
        title={`Sold today${orders.length ? ` · ${orders.length} ${orders.length === 1 ? 'order' : 'orders'}` : ''}`}
        action={{ label: 'New sale', onPress: () => router.navigate('/sell') }}>
        {orders.length === 0 ? (
          <EmptyState
            title="No sales yet"
            description="Orders you record in Sell show up here, with everything sold together in one card."
          />
        ) : (
          <View style={{ gap: space[4] }}>
            {orders.map((o) => (
              <OrderCard
                key={o.orderId}
                time={formatTime(o.soldAt)}
                code={receiptCode(o.orderId)}
                itemCount={o.itemCount}
                lines={o.lines.map((l) => ({
                  id: l.id,
                  name: l.item_name,
                  quantity: l.quantity,
                  totalCents: l.total_cents,
                }))}
                totalCents={o.totalCents}
                onPress={() => router.push({ pathname: '/receipt/[orderId]', params: { orderId: o.orderId } })}
                onLongPress={() =>
                  confirmDelete(`Order #${receiptCode(o.orderId)} · ${money(o.totalCents)}`, () =>
                    deleteOrder(db, o.orderId),
                  )
                }
              />
            ))}
          </View>
        )}
      </Section>

      <Section title="Bought today" action={{ label: 'New purchase', onPress: () => router.navigate('/buy') }}>
        {expenses.length === 0 ? (
          <EmptyState
            title="No purchases yet"
            description="Ingredients, gas, wages — record what you spend in Buy and it lands here."
          />
        ) : (
          <ListGroup>
            {expenses.map((e) => (
              <ListRow
                key={e.id}
                title={e.description}
                subtitle={`${e.quantity} × ${money(e.unit_price_cents)} · ${formatTime(e.spent_at)}`}
                trailing={
                  <>
                    <Money cents={e.total_cents} size="m" />
                    <Badge label={e.category} tone="neutral" />
                  </>
                }
                accessibilityHint="Long press to delete"
                onLongPress={() => confirmDelete(e.description, () => deleteExpense(db, e.id))}
              />
            ))}
          </ListGroup>
        )}
      </Section>

      {sales.length > 0 || expenses.length > 0 ? (
        <Text variant="caption" tone="tertiary" align="center">
          Tap an order for its receipt. Long-press an order or purchase to delete it.
        </Text>
      ) : null}
    </Screen>
  );
}
