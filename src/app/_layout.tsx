import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';

import { DATABASE_NAME, migrateDb } from '@/db/schema';
import { fontFamily, useNavTheme, useTheme } from '@/design';
import { CurrencyProvider } from '@/state/currency';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navTheme = useNavTheme();
  const { scheme, colors } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Suspense fallback={null}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDb} useSuspense>
          <CurrencyProvider>
            <Stack
              screenOptions={{
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.bg },
                headerTintColor: colors.text,
                headerTitleStyle: { fontFamily: fontFamily.semibold, fontSize: 17 },
                contentStyle: { backgroundColor: colors.bg },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="menu" options={{ title: 'Manage menu', presentation: 'modal' }} />
              <Stack.Screen name="receipt/[orderId]" options={{ title: 'Receipt' }} />
              <Stack.Screen name="design-system" options={{ title: 'Mise design system' }} />
            </Stack>
          </CurrencyProvider>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  );
}
