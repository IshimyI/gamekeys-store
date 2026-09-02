import { postJson, getJson } from '../../shared/api/index.js';

export async function createOrder(sku, promoCode) {
  const { ok, data } = await postJson('/api/orders', {
    sku,
    promo_code: promoCode || undefined,
  });
  return { ok, order: data };
}

export async function confirmPayment(orderId) {
  const { data } = await postJson('/api/webhooks/payment', {
    event_id: crypto.randomUUID(),
    order_id: orderId,
    status: 'paid',
    amount: 0,
    currency: 'RUB',
    created_at: new Date().toISOString(),
  });
  return data;
}

export async function fetchOrder(orderId) {
  const { data } = await getJson(`/api/orders/${orderId}`);
  return data;
}
