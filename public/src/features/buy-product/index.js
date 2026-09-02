import { createOrder, confirmPayment, fetchOrder } from '../../entities/order/index.js';
import { getPromoCode } from '../apply-promo/index.js';

const TERMINAL_STATUSES = ['delivered', 'payment_failed', 'out_of_stock', 'delivery_failed'];
const POLL_INTERVAL_MS = 700;
const POLL_TIMEOUT_MS = 15000;

export async function buyProduct(sku, { onCreating, onWaitingPayment, onDelivering, onError, onNetworkError, onStatus }) {
  onCreating();

  try {
    const { ok, order } = await createOrder(sku, getPromoCode());
    if (!ok) {
      onError(order.error || 'unknown');
      return;
    }

    onWaitingPayment(order);

    await confirmPayment(order.order_id);
    onDelivering();

    const finalOrder = await pollOrder(order.order_id);
    onStatus(finalOrder);
  } catch (err) {
    onNetworkError(err.message);
  }
}

async function pollOrder(orderId) {
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const order = await fetchOrder(orderId);
    if (TERMINAL_STATUSES.includes(order.status)) return order;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return fetchOrder(orderId);
}
