import { renderCreating, renderWaitingPayment, renderDelivering, renderError, renderNetworkError, renderByStatus } from '../../entities/order/index.js';

const panelEl = document.getElementById('orderPanel');
const statusEl = document.getElementById('orderStatus');

export function orderPanelCallbacks() {
  return {
    onCreating() {
      panelEl.classList.remove('hidden');
      statusEl.innerHTML = renderCreating();
    },
    onWaitingPayment(order) {
      statusEl.innerHTML = renderWaitingPayment(order);
    },
    onDelivering() {
      statusEl.innerHTML = renderDelivering();
    },
    onError(message) {
      statusEl.innerHTML = renderError(message);
    },
    onNetworkError(message) {
      statusEl.innerHTML = renderNetworkError(message);
    },
    onStatus(order) {
      statusEl.innerHTML = renderByStatus(order);
    },
  };
}
