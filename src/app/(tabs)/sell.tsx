import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';

import {
  ActionBar,
  Banner,
  Button,
  Card,
  EmptyState,
  Field,
  ItemTile,
  Keypad,
  Money,
  Screen,
  Section,
  Text,
  TicketCard,
  TicketLine,
  applyKey,
  useTheme,
  type KeypadKey,
} from '@/design';
import { listMenuItems, recordOrder, type MenuItem, type OrderLine } from '@/db/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { useCurrency } from '@/state/currency';

type SellData = { menu: MenuItem[] };

export default function SellScreen() {
  const db = useSQLiteContext();
  const { space } = useTheme();

  const load = useCallback(async (): Promise<SellData> => {
    const menu = await listMenuItems(db);
    return { menu: menu.filter((m) => m.active) };
  }, [db]);
  const [{ menu }, reload] = useFocusData<SellData>(load, { menu: [] });
  const { currency, format, parse } = useCurrency();

  const [cart, setCart] = useState<OrderLine[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [recorded, setRecorded] = useState<{ cents: number; orderId: string } | null>(null);

  const total = cart.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const count = cart.reduce((s, l) => s + l.quantity, 0);

  const addToCart = (line: Omit<OrderLine, 'quantity'>) => {
    setRecorded(null);
    setCart((prev) => {
      const i = prev.findIndex(
        (l) =>
          l.menuItemId === line.menuItemId &&
          l.name === line.name &&
          l.unitPriceCents === line.unitPriceCents,
      );
      if (i === -1) return [...prev, { ...line, quantity: 1 }];
      return prev.map((l, idx) => (idx === i ? { ...l, quantity: l.quantity + 1 } : l));
    });
  };

  const setQty = (index: number, qty: number) =>
    setCart((prev) => prev.map((l, i) => (i === index ? { ...l, quantity: qty } : l)).filter((l) => l.quantity > 0));

  const qtyFor = (id: string) => cart.filter((l) => l.menuItemId === id).reduce((s, l) => s + l.quantity, 0);

  const customCents = parse(customPrice);
  const customValid = customName.trim().length > 0 && customCents !== null && customCents > 0;

  const addCustom = () => {
    if (!customValid) return;
    addToCart({ menuItemId: null, name: customName, unitPriceCents: customCents as number });
    setCustomName('');
    setCustomPrice('');
    setCustomOpen(false);
  };

  const charge = async () => {
    setSaving(true);
    try {
      const orderTotal = total;
      const orderId = await recordOrder(db, cart);
      setCart([]);
      if (orderId) setRecorded({ cents: orderTotal, orderId });
    } catch (e) {
      Alert.alert('Could not save sale', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Two-column grid of tiles.
  const rows: (MenuItem | null)[][] = [];
  for (let i = 0; i < menu.length; i += 2) rows.push([menu[i], menu[i + 1] ?? null]);

  return (
    <Screen
      title="Sell"
      subtitle="Tap a dish to put it on the ticket"
      onRefresh={reload}
      footer={
        cart.length > 0 ? (
          <ActionBar
            caption={`${count} ${count === 1 ? 'item' : 'items'} on ticket`}
            amountCents={total}
            actionLabel="Record sale"
            onAction={charge}
            loading={saving}
          />
        ) : null
      }>
      {recorded ? (
        <Banner
          tone="positive"
          title="Sale recorded"
          message={`${format(recorded.cents)} added to today's sales.`}
          action={{
            label: 'Receipt',
            onPress: () => router.push({ pathname: '/receipt/[orderId]', params: { orderId: recorded.orderId } }),
          }}
        />
      ) : null}

      <Section title="Menu" action={{ label: 'Manage', onPress: () => router.push('/menu') }}>
        {menu.length === 0 ? (
          <EmptyState
            title="Your menu is empty"
            description="Add your dishes and prices once, then sell them with a single tap."
            action={{ label: 'Add dishes', onPress: () => router.push('/menu') }}
          />
        ) : (
          <View style={{ gap: space[4] }}>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: space[4] }}>
                {row.map((m, j) =>
                  m ? (
                    <ItemTile
                      key={m.id}
                      name={m.name}
                      priceCents={m.price_cents}
                      quantity={qtyFor(m.id)}
                      onPress={() => addToCart({ menuItemId: m.id, name: m.name, unitPriceCents: m.price_cents })}
                    />
                  ) : (
                    <View key={`spacer-${j}`} style={{ flex: 1 }} />
                  ),
                )}
              </View>
            ))}
          </View>
        )}
      </Section>

      <Section title="Something not on the menu?">
        {customOpen ? (
          <Card padding="lg">
            <View style={{ gap: space[5] }}>
              <Field label="Item name" value={customName} onChangeText={setCustomName} autoCapitalize="sentences" placeholder="e.g. Birthday cake slice" />
              <View style={{ alignItems: 'center', paddingVertical: space[3] }}>
                <Text variant="overline" tone="tertiary">
                  Price
                </Text>
                <Money cents={customCents ?? 0} size="xl" tone={customCents ? 'default' : 'tertiary'} />
              </View>
              <Keypad
                decimals={currency.decimals}
                onKey={(k: KeypadKey) => setCustomPrice((p) => applyKey(p, k, currency.decimals))}
              />
              <View style={{ flexDirection: 'row', gap: space[4] }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Cancel"
                    variant="ghost"
                    onPress={() => {
                      setCustomOpen(false);
                      setCustomName('');
                      setCustomPrice('');
                    }}
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Button label="Add to ticket" onPress={addCustom} disabled={!customValid} />
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <Button label="Add custom item" icon="plus" variant="secondary" onPress={() => setCustomOpen(true)} />
        )}
      </Section>

      {cart.length > 0 ? (
        <Section title="Ticket">
          <TicketCard title="Open order" count={count} totalLabel="Total" totalCents={total}>
            {cart.map((l, i) => (
              <TicketLine
                key={`${l.menuItemId ?? 'custom'}-${l.name}-${l.unitPriceCents}`}
                name={l.name}
                unitCents={l.unitPriceCents}
                quantity={l.quantity}
                onChange={(q) => setQty(i, q)}
              />
            ))}
          </TicketCard>
          <Button label="Clear ticket" variant="ghost" onPress={() => setCart([])} />
        </Section>
      ) : null}
    </Screen>
  );
}
