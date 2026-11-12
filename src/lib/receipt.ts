import type { Order } from '@/lib/orders';
import { receiptCode } from '@/lib/orders';

export function formatReceiptDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Plain-text receipt for sharing (WhatsApp, SMS, email). Built from the order itself so it
 * always matches what's on screen. `format` turns stored cents into the shop's currency.
 */
export function buildReceiptText(opts: {
  businessName: string;
  order: Order;
  format: (cents: number) => string;
}): string {
  const { businessName, order, format } = opts;
  const rule = '------------------------------';
  const lines = order.lines.map(
    (l) => `${l.item_name}\n  ${l.quantity} × ${format(l.unit_price_cents)}  =  ${format(l.total_cents)}`,
  );
  return [
    businessName,
    `Receipt #${receiptCode(order.orderId)}`,
    formatReceiptDate(order.soldAt),
    rule,
    ...lines,
    rule,
    `TOTAL  ${format(order.totalCents)}`,
    '',
    'Thank you!',
  ].join('\n');
}
