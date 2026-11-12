import { NativeTabs } from 'expo-router/native-tabs';

import { fontFamily, useTheme } from '@/design';

/**
 * Uber-style tab bar: a flat bar with a hairline on top, no selection pill, labels always shown,
 * and a pure ink (black / white in dark mode) active state against grey inactive tabs.
 * Active icons switch to their filled variants on iOS.
 */
export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      tintColor={colors.text}
      shadowColor={colors.border}
      iconColor={{ default: colors.textTertiary, selected: colors.text }}
      labelStyle={{
        default: { color: colors.textTertiary, fontFamily: fontFamily.medium, fontSize: 12 },
        selected: { color: colors.text, fontFamily: fontFamily.bold, fontSize: 12 },
      }}
      disableIndicator
      labelVisibilityMode="labeled">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="today" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sell">
        <NativeTabs.Trigger.Label>Sell</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="buy">
        <NativeTabs.Trigger.Label>Buy</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'cart', selected: 'cart.fill' }} md="shopping_cart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Label>Reports</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="bar_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
