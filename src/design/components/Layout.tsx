import { useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { Button } from './Button';
import { Card } from './Card';
import { Pressy } from './Pressy';
import { Text } from './Text';

/**
 * Screen scaffold: large title, optional footer (the charge bar lives here), pull-to-refresh,
 * safe-area handling. Every screen in the app is built with this so rhythm stays consistent.
 */
export function Screen({
  title,
  subtitle,
  headerRight,
  children,
  footer,
  onRefresh,
  topInset = true,
}: {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onRefresh?: () => Promise<void> | void;
  topInset?: boolean;
}) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: space[5],
          paddingTop: (topInset ? insets.top : 0) + space[5],
          paddingBottom: space[8],
          gap: space[7],
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        refreshControl={
          onRefresh ? (
            <RefreshControl
              tintColor={colors.primary}
              colors={[colors.primary]}
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                try {
                  await onRefresh();
                } finally {
                  setRefreshing(false);
                }
              }}
            />
          ) : undefined
        }>
        {title ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[4] }}>
            <View style={{ flex: 1, gap: space[2] }}>
              <Text variant="title1" accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? (
                <Text variant="callout" tone="secondary">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {headerRight}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

/** Groups content under a heading, with an optional trailing action. */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}) {
  const { space, colors } = useTheme();
  return (
    <View style={{ gap: space[4] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 }}>
        <Text variant="headline" accessibilityRole="header">
          {title}
        </Text>
        {action ? (
          <Pressy onPress={action.onPress} hitSlop={12} accessibilityRole="button">
            <Text variant="callout" style={{ color: colors.info, fontFamily: 'Inter_600SemiBold' }}>
              {action.label}
            </Text>
          </Pressy>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}) {
  const { space } = useTheme();
  return (
    <Card variant="sunken" padding="lg">
      <View style={{ alignItems: 'center', gap: space[3] }}>
        <Text variant="headline" align="center">
          {title}
        </Text>
        {description ? (
          <Text variant="callout" tone="secondary" align="center">
            {description}
          </Text>
        ) : null}
        {action ? (
          <View style={{ marginTop: space[3], alignSelf: 'stretch' }}>
            <Button label={action.label} onPress={action.onPress} variant="secondary" size="sm" fullWidth={false} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

/** Inline message: sync results, confirmations. A soft tinted card with an optional action link. */
export function Banner({
  tone,
  title,
  message,
  action,
}: {
  tone: 'positive' | 'negative' | 'warning' | 'info';
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}) {
  const { colors, radius, space } = useTheme();
  const p = {
    positive: { bg: colors.positiveSoft, fg: colors.positive },
    negative: { bg: colors.negativeSoft, fg: colors.negative },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    info: { bg: colors.infoSoft, fg: colors.info },
  }[tone];
  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: p.bg,
        borderRadius: radius.md,
        padding: space[5],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[4],
      }}>
      <View style={{ flex: 1, gap: space[2] }}>
        <Text variant="bodyStrong" style={{ color: p.fg }}>
          {title}
        </Text>
        {message ? (
          <Text variant="callout" tone="secondary">
            {message}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressy onPress={action.onPress} hitSlop={12} accessibilityRole="button">
          <Text variant="callout" style={{ color: p.fg, fontFamily: 'Inter_700Bold' }}>
            {action.label}
          </Text>
        </Pressy>
      ) : null}
    </View>
  );
}
