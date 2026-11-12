import { useState } from 'react';
import { View } from 'react-native';

import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  DailyBars,
  EmptyState,
  Field,
  ItemTile,
  Keypad,
  ListGroup,
  ListRow,
  Mark,
  Money,
  OrderCard,
  ReceiptSheet,
  Monogram,
  PulseCard,
  Screen,
  Section,
  Segmented,
  ShareBar,
  Stepper,
  Text,
  TicketCard,
  TicketLine,
  applyKey,
  radius as radiusTokens,
  shadow as shadowTokens,
  space as spaceTokens,
  type as typeTokens,
  useTheme,
  type TypeVariant,
} from '@/design';
import { useCurrency } from '@/state/currency';

const COLOR_GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Surfaces', keys: ['bg', 'surface', 'surfaceSunken', 'surfaceInverse', 'ticket'] },
  { title: 'Ink', keys: ['text', 'textSecondary', 'textTertiary', 'textInverse'] },
  { title: 'Lines', keys: ['border', 'borderStrong', 'focus'] },
  { title: 'Brand · Ink', keys: ['primary', 'primaryPressed', 'primarySoft', 'onPrimary'] },
  {
    title: 'Money & status',
    keys: ['positive', 'positiveSoft', 'negative', 'negativeSoft', 'warning', 'warningSoft', 'info', 'infoSoft'],
  },
];

const PRINCIPLES = [
  ['Money is the hero', 'Tabular figures, big, with a quiet currency and cents.'],
  ['One thumb, full speed', '52–64pt targets and a charge bar pinned where the thumb rests.'],
  ['Calm precision', 'Hairlines do the work; shadows only whisper.'],
  ['Honest status', 'Every record says what state it is in. Green in, red out — nothing else.'],
  ['Colour means something', 'Black and white carry the brand. Green in, red out, amber for attention, blue for links.'],
];

export default function DesignSystemScreen() {
  const theme = useTheme();
  const { colors, space } = theme;
  const { currency, format } = useCurrency();
  // Sample amounts are written in "dollar-sized" cents; scale them up for no-decimal currencies like UGX.
  const k = currency.decimals === 0 ? 1000 : 1;
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [chip, setChip] = useState('Ingredients');
  const [qty, setQty] = useState(2);
  const [amount, setAmount] = useState('12.5');
  const [tileQty, setTileQty] = useState(1);

  return (
    <Screen topInset={false}>
      <View style={{ gap: space[3] }}>
        <Text variant="overline" tone="primary">
          Eleve · v1
        </Text>
        <Text variant="title1">Mise</Text>
        <Text variant="body" tone="secondary">
          {
            'Mise en place: everything in its place before service. A design system for a counter-speed POS that borrows Stripe’s calm precision and Square’s tap-first ergonomics, in an Uber-style black-and-white colour language.'
          }
        </Text>
      </View>

      <Section title="Brand mark">
        <Card padding="lg">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[6] }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                backgroundColor: '#0B0B0B',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Mark size={52} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, gap: space[2] }}>
              <Text variant="headline">A stepped “E”</Text>
              <Text variant="callout" tone="secondary">
                Bold, flat and monochrome. Three arms that grow upward: the letter, and “elevate”.
              </Text>
            </View>
          </View>
        </Card>
      </Section>

      <Section title="Principles">
        <ListGroup>
          {PRINCIPLES.map(([t, d], i) => (
            <ListRow
              key={t}
              title={t}
              subtitle={d}
              leading={<Monogram label={String(i + 1)} bg={colors.primarySoft} fg={colors.primary} />}
            />
          ))}
        </ListGroup>
      </Section>

      <Section title="Color">
        {COLOR_GROUPS.map((g) => (
          <Card key={g.title} padding="sm">
            <Text variant="overline" tone="tertiary" style={{ marginBottom: space[3] }}>
              {g.title}
            </Text>
            <View style={{ gap: space[3] }}>
              {g.keys.map((k) => {
                const hex = (colors as Record<string, string>)[k];
                return (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: hex,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                    <Text variant="callout" style={{ flex: 1 }}>
                      {k}
                    </Text>
                    <Text variant="figureS" tone="tertiary">
                      {hex}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ))}
        <Card padding="sm">
          <Text variant="overline" tone="tertiary" style={{ marginBottom: space[3] }}>
            Dish accents
          </Text>
          <View style={{ flexDirection: 'row', gap: space[3], flexWrap: 'wrap' }}>
            {theme.tileAccents.map((a, i) => (
              <Monogram key={i} label={'ABCDEF'[i]} bg={a.bg} fg={a.fg} size={48} />
            ))}
          </View>
        </Card>
      </Section>

      <Section title="Typography · Inter">
        <Card padding="sm">
          <View style={{ gap: space[5] }}>
            {(Object.keys(typeTokens) as TypeVariant[]).map((v) => (
              <View key={v} style={{ gap: 2 }}>
                <Text variant="caption" tone="tertiary">
                  {v} · {typeTokens[v].fontSize}/{typeTokens[v].lineHeight}
                </Text>
                <Text variant={v}>{v.startsWith('figure') ? '1,248.50' : 'Chicken curry & rice'}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Section>

      <Section title="Money">
        <Card padding="lg">
          <View style={{ gap: space[5] }}>
            <Money cents={124850 * k} size="xl" />
            <Money cents={124850 * k} size="l" tone="positive" signed />
            <Money cents={-8999 * k} size="m" tone="negative" />
            <Money cents={450 * k} size="s" tone="secondary" />
          </View>
        </Card>
      </Section>

      <Section title="Space · radius · depth">
        <Card padding="sm">
          <View style={{ gap: space[4] }}>
            <Text variant="overline" tone="tertiary">
              4pt grid
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[3] }}>
              {Object.values(spaceTokens)
                .filter((v) => v > 0)
                .map((v) => (
                  <View key={v} style={{ alignItems: 'center', gap: 4 }}>
                    <View style={{ width: Math.max(v, 4), height: Math.max(v, 4), backgroundColor: colors.primary, borderRadius: 2 }} />
                    <Text variant="caption" tone="tertiary">
                      {v}
                    </Text>
                  </View>
                ))}
            </View>
            <Text variant="overline" tone="tertiary">
              Radius
            </Text>
            <View style={{ flexDirection: 'row', gap: space[4] }}>
              {Object.entries(radiusTokens).map(([k, v]) => (
                <View key={k} style={{ alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 44, height: 44, borderRadius: Math.min(v, 22), backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary }} />
                  <Text variant="caption" tone="tertiary">
                    {k}
                  </Text>
                </View>
              ))}
            </View>
            <Text variant="overline" tone="tertiary">
              Elevation
            </Text>
            <View style={{ flexDirection: 'row', gap: space[5] }}>
              {(['sm', 'md', 'lg'] as const).map((k) => (
                <View key={k} style={{ alignItems: 'center', gap: space[3] }}>
                  <View style={[{ width: 64, height: 64, borderRadius: 16, backgroundColor: colors.surface }, shadowTokens[k]]} />
                  <Text variant="caption" tone="tertiary">
                    {k}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </Section>

      <Section title="Buttons">
        <Button label="Primary · record sale" onPress={() => {}} />
        <Button label="Secondary · add custom item" icon="plus" variant="secondary" onPress={() => {}} />
        <Button label="Ghost · clear ticket" variant="ghost" onPress={() => {}} />
        <Button label="Danger · delete" variant="danger" onPress={() => {}} />
        <Button label="Loading" onPress={() => {}} loading />
        <Button label="Disabled" onPress={() => {}} disabled />
        <Button label="Large · POS" size="lg" onPress={() => {}} />
      </Section>

      <Section title="Badges">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
          <Badge label="All synced" tone="positive" dot />
          <Badge label="3 waiting to sync" tone="warning" dot />
          <Badge label="Sync failed" tone="negative" dot />
          <Badge label="Info" tone="info" />
          <Badge label="Ingredients" tone="neutral" />
        </View>
      </Section>

      <Section title="Selection">
        <Segmented
          options={[
            { key: 'a', label: 'Today' },
            { key: 'b', label: '7 days' },
            { key: 'c', label: 'Month' },
          ]}
          value={seg}
          onChange={setSeg}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
          {['Ingredients', 'Drinks', 'Fuel / Gas', 'Wages'].map((c) => (
            <Chip key={c} label={c} selected={chip === c} onPress={() => setChip(c)} />
          ))}
        </View>
        <Card padding="sm">
          <Stepper value={qty} onChange={setQty} label="Quantity" />
        </Card>
      </Section>

      <Section title="Inputs">
        <Card padding="lg">
          <View style={{ gap: space[6] }}>
            <Field label="Default" placeholder="Type here" />
            <Field label="With prefix" prefix="$" placeholder="0.00" keyboardType="decimal-pad" />
            <Field label="Error" defaultValue="abc" error="Enter an amount" />
          </View>
        </Card>
      </Section>

      <Section title="Feedback">
        <Banner
          tone="positive"
          title="Sale recorded"
          message={`${format(2300 * k)} added to today's sales.`}
          action={{ label: 'Receipt', onPress: () => {} }}
        />
        <Banner tone="warning" title="3 records waiting" message="They'll send when you're back online." />
        <Banner tone="negative" title="Sync failed" message="Server returned 401." />
        <EmptyState title="No sales yet" description="Orders you record in Sell show up here." />
      </Section>

      <Section title="Signature: Pulse">
        <Card variant="raised" padding="lg">
          <PulseCard net={18250 * k} sales={42000 * k} spent={23750 * k} />
        </Card>
      </Section>

      <Section title="Signature: Ledger rows">
        <ListGroup>
          <ListRow
            title="Chicken curry"
            subtitle={`2 × ${format(850 * k)} · 12:41 PM`}
            leading={<Monogram label="C" bg={theme.tileAccents[2].bg} fg={theme.tileAccents[2].fg} />}
            trailing={<Money cents={1700 * k} size="m" />}
            footer={<ShareBar fraction={0.7} color={colors.positive} />}
          />
          <ListRow
            title="Tomatoes 5 kg"
            subtitle={`1 × ${format(1400 * k)} · 9:10 AM`}
            trailing={
              <>
                <Money cents={1400 * k} size="m" />
                <Badge label="Ingredients" />
              </>
            }
          />
        </ListGroup>
      </Section>

      <Section title="Signature: Order card">
        <OrderCard
          time="12:41 PM"
          code="3F9A1C"
          itemCount={4}
          lines={[
            { id: '1', name: 'Chicken curry', quantity: 2, totalCents: 1700 * k },
            { id: '2', name: 'Mango juice', quantity: 2, totalCents: 600 * k },
          ]}
          totalCents={2300 * k}
          onPress={() => {}}
        />
      </Section>

      <Section title="Signature: Receipt">
        <ReceiptSheet
          businessName="My Restaurant"
          code="3F9A1C"
          dateLabel="Thu, 12 Nov 2026, 12:41 PM"
          lines={[
            { id: '1', name: 'Chicken curry', quantity: 2, unitCents: 850 * k, totalCents: 1700 * k },
            { id: '2', name: 'Mango juice', quantity: 2, unitCents: 300 * k, totalCents: 600 * k },
          ]}
          totalCents={2300 * k}
        />
      </Section>

      <Section title="Signature: Daily bars">
        <Card padding="lg">
          <DailyBars
            data={[
              { key: '1', label: 'Mon', sales: 4200 * k, spent: 1800 * k },
              { key: '2', label: 'Tue', sales: 3100 * k, spent: 2400 * k },
              { key: '3', label: 'Wed', sales: 5800 * k, spent: 2100 * k },
              { key: '4', label: 'Thu', sales: 0, spent: 0 },
              { key: '5', label: 'Fri', sales: 9600 * k, spent: 4300 * k },
              { key: '6', label: 'Sat', sales: 12100 * k, spent: 5200 * k },
              { key: '7', label: 'Sun', sales: 7400 * k, spent: 3000 * k },
            ]}
          />
        </Card>
      </Section>

      <Section title="POS: tiles & ticket">
        <View style={{ flexDirection: 'row', gap: space[4] }}>
          <ItemTile name="Chicken curry" priceCents={850 * k} quantity={tileQty} onPress={() => setTileQty((q) => q + 1)} />
          <ItemTile name="Mango juice" priceCents={300 * k} onPress={() => {}} />
        </View>
        <TicketCard title="Open order" count={3} totalLabel="Total" totalCents={2000 * k}>
          <TicketLine name="Chicken curry" unitCents={850 * k} quantity={2} onChange={() => {}} />
          <TicketLine name="Mango juice" unitCents={300 * k} quantity={1} onChange={() => {}} />
        </TicketCard>
      </Section>

      <Section title="POS: keypad">
        <Card padding="lg">
          <View style={{ gap: space[5] }}>
            <View style={{ alignItems: 'center' }}>
              <Money cents={Math.round((Number(amount) || 0) * 100)} size="xl" />
            </View>
            <Keypad decimals={currency.decimals} onKey={(key) => setAmount((a) => applyKey(a, key, currency.decimals))} />
          </View>
        </Card>
      </Section>

      <Section title="POS: charge bar">
        <View style={{ marginHorizontal: -space[5] }}>
          <ActionBar caption="3 items on ticket" amountCents={2000 * k} actionLabel="Record sale" onAction={() => {}} />
        </View>
      </Section>
    </Screen>
  );
}
