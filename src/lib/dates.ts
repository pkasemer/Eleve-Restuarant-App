export type DateRange = { from: Date; to: Date }; // [from, to)

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

export function todayRange(now = new Date()): DateRange {
  const from = startOfDay(now);
  return { from, to: addDays(from, 1) };
}

/** Last `days` days including today. */
export function lastDaysRange(days: number, now = new Date()): DateRange {
  const to = addDays(startOfDay(now), 1);
  return { from: addDays(to, -days), to };
}

export function thisMonthRange(now = new Date()): DateRange {
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

/** Local calendar day key, e.g. "2026-11-09". */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
