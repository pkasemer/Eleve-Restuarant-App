import type { Sale } from '@/db/repo';

/** Sales made together: every line recorded in one "Record sale" shares an order_id. */
export type Order = {
  orderId: string;
  /** When the order was recorded (ISO). */
  soldAt: string;
  lines: Sale[];
  totalCents: number;
  /** Total quantity across all lines. */
  itemCount: number;
};

/** Group sale lines into orders, newest first. Lines keep the order they were added in. */
export function groupOrders(sales: Sale[]): Order[] {
  const byId = new Map<string, Sale[]>();
  for (const s of sales) {
    const list = byId.get(s.order_id);
    if (list) list.push(s);
    else byId.set(s.order_id, [s]);
  }
  const orders: Order[] = [];
  for (const [orderId, lines] of byId) {
    lines.sort((a, b) => a.created_at.localeCompare(b.created_at));
    orders.push({
      orderId,
      soldAt: lines.reduce((min, l) => (l.sold_at < min ? l.sold_at : min), lines[0].sold_at),
      lines,
      totalCents: lines.reduce((sum, l) => sum + l.total_cents, 0),
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    });
  }
  return orders.sort((a, b) => b.soldAt.localeCompare(a.soldAt));
}

/** Short, human-friendly receipt code derived from the order id, e.g. "3F9A1C". */
export function receiptCode(orderId: string): string {
  return orderId.replace(/-/g, '').slice(0, 6).toUpperCase();
}

/** One-line summary of an order's contents: "2 × Rice, 1 × Mango juice". */
export function summarizeOrder(order: Order, max = 3): string {
  const parts = order.lines.map((l) => `${l.quantity} × ${l.item_name}`);
  return parts.length <= max ? parts.join(', ') : `${parts.slice(0, max).join(', ')} +${parts.length - max} more`;
}
