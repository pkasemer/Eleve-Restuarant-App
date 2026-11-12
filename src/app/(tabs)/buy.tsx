import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { ActionBar, Banner, Card, Chip, Field, Screen, Text, useTheme } from '@/design';
import { addExpense, EXPENSE_CATEGORIES } from '@/db/repo';
import { useCurrency } from '@/state/currency';

export default function BuyScreen() {
  const db = useSQLiteContext();
  const { space, colors } = useTheme();

  const { currency, format, parse } = useCurrency();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [recorded, setRecorded] = useState<string | null>(null);

  const qty = Number(quantity);
  const cents = parse(unitPrice);
  const qtyValid = Number.isFinite(qty) && qty > 0;
  const valid = description.trim().length > 0 && qtyValid && cents !== null;
  const total = qtyValid && cents !== null ? Math.round(qty * cents) : 0;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await addExpense(db, { description, category, quantity: qty, unitPriceCents: cents as number });
      setRecorded(`${description.trim()} · ${format(total)}`);
      setDescription('');
      setQuantity('1');
      setUnitPrice('');
    } catch (e) {
      Alert.alert('Could not save purchase', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const edited = (fn: (v: string) => void) => (v: string) => {
    setRecorded(null);
    fn(v);
  };

  return (
    <Screen
      title="Buy"
      subtitle="Record what you bought and what you paid"
      footer={
        <ActionBar
          caption="Purchase total"
          amountCents={total}
          actionLabel="Record"
          onAction={save}
          disabled={!valid}
          loading={saving}
        />
      }>
      {recorded ? <Banner tone="positive" title="Purchase recorded" message={recorded} /> : null}

      <Card padding="lg">
        <View style={{ gap: space[6] }}>
          <Field
            label="What did you buy?"
            value={description}
            onChangeText={edited(setDescription)}
            autoCapitalize="sentences"
            placeholder="e.g. Tomatoes 5 kg"
          />

          <View style={{ gap: space[4] }}>
            <Text variant="callout" tone="secondary" style={{ fontFamily: 'Inter_500Medium' }}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
              {EXPENSE_CATEGORIES.map((c) => (
                <Chip key={c} label={c} selected={c === category} onPress={() => setCategory(c)} />
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: space[4] }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Quantity"
                value={quantity}
                onChangeText={edited(setQuantity)}
                keyboardType="decimal-pad"
                error={quantity !== '' && !qtyValid ? 'Enter a number' : undefined}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Field
                label="Price each"
                prefix={currency.prefix.trim()}
                value={unitPrice}
                onChangeText={edited(setUnitPrice)}
                keyboardType={currency.decimals === 0 ? 'number-pad' : 'decimal-pad'}
                placeholder={currency.decimals === 0 ? '0' : '0.00'}
                error={unitPrice !== '' && cents === null ? 'Enter an amount' : undefined}
              />
            </View>
          </View>
        </View>
      </Card>

      <Text variant="caption" tone="tertiary" align="center" style={{ color: colors.textTertiary }}>
        Money out is shown in red across the app, money in in green.
      </Text>
    </Screen>
  );
}
