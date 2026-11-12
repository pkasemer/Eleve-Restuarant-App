import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import {
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  Field,
  ListGroup,
  ListRow,
  Screen,
  Section,
  Text,
  useTheme,
} from '@/design';
import { countPending, getSettings, setSetting, type Settings } from '@/db/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { CURRENCIES } from '@/lib/currency';
import { formatMoney } from '@/lib/money';
import { useCurrency } from '@/state/currency';
import { getMcpToken, setMcpToken, syncNow } from '@/sync/sync';

type SettingsData = { settings: Settings; token: string; pending: number } | null;

export default function SettingsScreen() {
  const db = useSQLiteContext();

  const load = useCallback(async (): Promise<SettingsData> => {
    const [settings, pending, token] = await Promise.all([getSettings(db), countPending(db), getMcpToken()]);
    return { settings, pending, token: token ?? '' };
  }, [db]);
  const [data, reload] = useFocusData<SettingsData>(load, null);

  if (!data) return <Screen title="Settings">{null}</Screen>;

  return (
    <Screen title="Settings" subtitle="Your business and online sync" onRefresh={reload}>
      {/* Form state is seeded once from the loaded values; pull-to-refresh won't clobber typing. */}
      <SettingsForm initial={data.settings} initialToken={data.token} pending={data.pending} onChanged={reload} />
    </Screen>
  );
}

type Result = { tone: 'positive' | 'negative'; title: string; message?: string } | null;

function SettingsForm({
  initial,
  initialToken,
  pending,
  onChanged,
}: {
  initial: Settings;
  initialToken: string;
  pending: number;
  onChanged: () => Promise<void>;
}) {
  const db = useSQLiteContext();
  const { space } = useTheme();
  const [businessName, setBusinessName] = useState(initial.business_name);
  const { currency, setCurrencyCode } = useCurrency();
  const [url, setUrl] = useState(initial.mcp_url);
  const [tool, setTool] = useState(initial.mcp_tool);
  const [token, setToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const save = async () => {
    await setSetting(db, 'business_name', businessName.trim() || 'My Restaurant');
    await setSetting(db, 'mcp_url', url.trim());
    await setSetting(db, 'mcp_tool', tool.trim() || 'sync_records');
    await setMcpToken(token.trim());
    await onChanged();
  };

  const saveOnly = async () => {
    await save();
    setResult({ tone: 'positive', title: 'Settings saved' });
  };

  const sync = async () => {
    setBusy(true);
    setResult(null);
    try {
      await save();
      const { pushed } = await syncNow(db);
      setResult({
        tone: 'positive',
        title: 'Sync complete',
        message: pushed ? `Sent ${pushed} record${pushed === 1 ? '' : 's'}.` : 'Everything is already up to date.',
      });
    } catch (e) {
      setResult({ tone: 'negative', title: 'Sync failed', message: (e as Error).message });
    } finally {
      setBusy(false);
      await onChanged();
    }
  };

  const configured = url.trim().length > 0;
  const lastSync = initial.last_sync_at ? new Date(initial.last_sync_at).toLocaleString() : 'never';

  return (
    <>
      {result ? <Banner tone={result.tone} title={result.title} message={result.message} /> : null}

      <Section title="Business">
        <Card padding="lg">
          <View style={{ gap: space[6] }}>
            <Field label="Business name" value={businessName} onChangeText={setBusinessName} autoCapitalize="words" />
            <View style={{ gap: space[4] }}>
              <Text variant="callout" tone="secondary" style={{ fontFamily: 'Inter_500Medium' }}>
                Currency
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
                {CURRENCIES.map((c) => (
                  <Chip
                    key={c.code}
                    label={c.code}
                    selected={c.code === currency.code}
                    onPress={() => setCurrencyCode(c.code)}
                  />
                ))}
              </View>
              <Text variant="caption" tone="tertiary">
                {currency.name} · e.g. {formatMoney(currency.decimals === 0 ? 2500000 : 1250050, currency)}.
                Changes apply everywhere right away.
              </Text>
            </View>
          </View>
        </Card>
      </Section>

      <Section title="Online sync">
        <Card padding="lg">
          <View style={{ gap: space[6] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {!configured ? (
                <Badge label="Not connected" tone="neutral" dot />
              ) : pending === 0 ? (
                <Badge label="All synced" tone="positive" dot />
              ) : (
                <Badge label={`${pending} waiting to sync`} tone="warning" dot />
              )}
              <Text variant="caption" tone="tertiary">
                Last sync: {lastSync}
              </Text>
            </View>
            <Field
              label="MCP server URL"
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCorrect={false}
              placeholder="https://example.com/mcp"
            />
            <Field label="Tool name" value={tool} onChangeText={setTool} autoCorrect={false} />
            <Field
              label="Access token (optional)"
              value={token}
              onChangeText={setToken}
              secureTextEntry
              autoCorrect={false}
              helper="Stored in this device's secure keychain."
            />
          </View>
        </Card>
        <Button label="Save and sync now" onPress={sync} loading={busy} disabled={!configured} />
        <Button label="Save settings" variant="secondary" onPress={saveOnly} />
        <Text variant="caption" tone="tertiary" align="center">
          Everything is saved on this phone first, so Eleve works offline. Sync sends new and changed records.
        </Text>
      </Section>

      <Section title="About">
        <ListGroup>
          <ListRow
            title="Design system"
            subtitle="Mise — tokens and components"
            chevron
            onPress={() => router.push('/design-system')}
          />
          <ListRow title="Version" trailing={<Text variant="figureS" tone="secondary">{Constants.expoConfig?.version ?? '1.0.0'}</Text>} />
        </ListGroup>
      </Section>
    </>
  );
}
