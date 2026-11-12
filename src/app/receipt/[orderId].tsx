import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Share, View } from 'react-native';

import { Button, EmptyState, ReceiptSheet, Screen, useTheme } from '@/design';
import { getOrderLines, getSettings } from '@/db/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { groupOrders, receiptCode, type Order } from '@/lib/orders';
import { buildReceiptText, formatReceiptDate } from '@/lib/receipt';
import { useCurrency } from '@/state/currency';

type ReceiptData = { businessName: string; order: Order | null; loaded: boolean };

export default function ReceiptScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const db = useSQLiteContext();
  const { space } = useTheme();
  const { format } = useCurrency();

  const load = useCallback(async (): Promise<ReceiptData> => {
    const [settings, lines] = await Promise.all([getSettings(db), getOrderLines(db, String(orderId))]);
    return { businessName: settings.business_name, order: groupOrders(lines)[0] ?? null, loaded: true };
  }, [db, orderId]);
  const [{ businessName, order, loaded }] = useFocusData<ReceiptData>(load, {
    businessName: '',
    order: null,
    loaded: false,
  });

  const share = () => {
    if (!order) return;
    Share.share({
      title: `Receipt #${receiptCode(order.orderId)}`,
      message: buildReceiptText({ businessName, order, format }),
    });
  };

  if (!loaded) return <Screen topInset={false}>{null}</Screen>;

  if (!order) {
    return (
      <Screen topInset={false}>
        <EmptyState
          title="Receipt not found"
          description="This order may have been deleted."
          action={{ label: 'Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <Screen topInset={false}>
      <ReceiptSheet
        businessName={businessName}
        code={receiptCode(order.orderId)}
        dateLabel={formatReceiptDate(order.soldAt)}
        lines={order.lines.map((l) => ({
          id: l.id,
          name: l.item_name,
          quantity: l.quantity,
          unitCents: l.unit_price_cents,
          totalCents: l.total_cents,
        }))}
        totalCents={order.totalCents}
      />
      <View style={{ gap: space[4] }}>
        <Button label="Share receipt" onPress={share} />
        <Button label="Done" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
