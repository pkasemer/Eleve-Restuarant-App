import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  ListGroup,
  ListRow,
  Money,
  Monogram,
  Screen,
  Section,
  Text,
  accentFor,
  useTheme,
} from '@/design';
import {
  addMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem,
  type MenuItem,
} from '@/db/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { useCurrency } from '@/state/currency';

type MenuData = { items: MenuItem[] };

export default function MenuScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { space } = theme;

  const load = useCallback(async (): Promise<MenuData> => {
    return { items: await listMenuItems(db) };
  }, [db]);
  const [{ items }, reload] = useFocusData<MenuData>(load, { items: [] });
  const { currency, parse } = useCurrency();

  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const cents = parse(price);
  const valid = name.trim().length > 0 && cents !== null;

  const reset = () => {
    setEditing(null);
    setName('');
    setPrice('');
  };

  const save = async () => {
    if (!valid) return;
    if (editing) {
      await updateMenuItem(db, editing.id, { name, priceCents: cents as number, active: editing.active === 1 });
    } else {
      await addMenuItem(db, name, cents as number);
    }
    reset();
    await reload();
  };

  const edit = (m: MenuItem) => {
    setEditing(m);
    setName(m.name);
    setPrice((m.price_cents / 100).toString());
  };

  const toggleActive = async (m: MenuItem) => {
    await updateMenuItem(db, m.id, { name: m.name, priceCents: m.price_cents, active: m.active !== 1 });
    reset();
    await reload();
  };

  const remove = (m: MenuItem) =>
    Alert.alert('Delete menu item?', m.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMenuItem(db, m.id);
          if (editing?.id === m.id) reset();
          await reload();
        },
      },
    ]);

  return (
    <Screen topInset={false} onRefresh={reload}>
      <Card padding="lg" variant="raised">
        <View style={{ gap: space[6] }}>
          <Text variant="title2">{editing ? 'Edit dish' : 'New dish'}</Text>
          <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="e.g. Chicken curry" />
          <Field
            label="Price"
            prefix={currency.prefix.trim()}
            value={price}
            onChangeText={setPrice}
            keyboardType={currency.decimals === 0 ? 'number-pad' : 'decimal-pad'}
            placeholder={currency.decimals === 0 ? '0' : '0.00'}
          />
          <View style={{ gap: space[4] }}>
            <Button label={editing ? 'Save changes' : 'Add to menu'} onPress={save} disabled={!valid} />
            {editing ? (
              <View style={{ flexDirection: 'row', gap: space[4] }}>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="ghost" onPress={reset} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={editing.active ? 'Hide from Sell' : 'Show in Sell'}
                    variant="secondary"
                    onPress={() => toggleActive(editing)}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Card>

      <Section title={`Dishes${items.length ? ` · ${items.length}` : ''}`}>
        {items.length === 0 ? (
          <EmptyState title="No dishes yet" description="Add your first dish above." />
        ) : (
          <ListGroup>
            {items.map((m) => {
              const accent = accentFor(theme, m.name);
              return (
                <ListRow
                  key={m.id}
                  title={m.name}
                  leading={<Monogram label={m.name} bg={accent.bg} fg={accent.fg} />}
                  trailing={
                    <>
                      <Money cents={m.price_cents} size="m" />
                      {m.active ? null : <Badge label="Hidden" tone="neutral" />}
                    </>
                  }
                  onPress={() => edit(m)}
                  onLongPress={() => remove(m)}
                  accessibilityHint="Tap to edit, long press to delete"
                />
              );
            })}
          </ListGroup>
        )}
        {items.length > 0 ? (
          <Text variant="caption" tone="tertiary" align="center">
            Tap a dish to edit it. Long-press to delete.
          </Text>
        ) : null}
      </Section>
    </Screen>
  );
}
