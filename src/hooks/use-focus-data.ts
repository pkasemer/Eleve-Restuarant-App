import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Loads data whenever the screen gains focus (so tabs stay fresh after edits elsewhere).
 * `loader` must be referentially stable (wrap in useCallback).
 */
export function useFocusData<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);

  const reload = useCallback(async () => {
    setData(await loader());
  }, [loader]);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.warn('load failed', e));
    }, [reload]),
  );

  return [data, reload] as const;
}
