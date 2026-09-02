import { formatMoney } from '../product/index.js';

export function renderCreating() {
  return `<div class="status-line"><span class="dot"></span> Создаём заказ…</div>`;
}

export function renderWaitingPayment(order) {
  return `<div class="status-line"><span class="dot"></span> Заказ #${order.order_id.slice(4, 12)} — ${formatMoney(order.amount, order.currency)}. Ждём подтверждение оплаты…</div>`;
}

export function renderDelivering(order) {
  return `<div class="status-line"><span class="dot"></span> Оплата подтверждена, получаем код у поставщика…</div>`;
}

export function renderError(message) {
  return `<div class="error-box">Ошибка: ${message}</div>`;
}

export function renderNetworkError(message) {
  return `<div class="error-box">Сетевая ошибка: ${message}</div>`;
}

export function renderByStatus(order) {
  switch (order.status) {
    case 'delivered':
      return `
        <div class="status-line"><span class="dot dot--issued"></span> Оплачено, код выдан</div>
        <div class="key-box">${order.delivered_code}</div>
      `;
    case 'out_of_stock':
      return `
        <div class="status-line"><span class="dot dot--recoverable"></span> Оплата прошла, но товара нет в наличии</div>
        <div class="error-box">Заказ #${order.id.slice(4, 12)} переведён в восстановимое состояние — деньги списаны, код будет выдан автоматически после пополнения склада.</div>
      `;
    case 'delivery_failed':
      return `
        <div class="status-line"><span class="dot dot--recoverable"></span> Оплата прошла, но выдача не удалась</div>
        <div class="error-box">Заказ #${order.id.slice(4, 12)} в восстановимом состоянии, повторная выдача будет выполнена автоматически.</div>
      `;
    case 'payment_failed':
      return `<div class="error-box">Оплата не прошла. Заказ #${order.id.slice(4, 12)} отменён.</div>`;
    case 'delivering':
      return `<div class="status-line"><span class="dot"></span> Получаем код у поставщика…</div>`;
    default:
      return `<div class="status-line"><span class="dot"></span> Статус: ${order.status}</div>`;
  }
}
