import { fetchProducts, formatMoney } from '../../entities/product/index.js';
import { buyProduct } from '../../features/buy-product/index.js';
import { orderPanelCallbacks } from '../order-panel/index.js';

const selectEl = document.getElementById('steamAmountSelect');
const buyBtn = document.getElementById('steamTopupBuyBtn');
const currencyEl = document.getElementById('steamCurrencySwitch');

export async function mountSteamTopup() {
  const products = await fetchProducts();
  const topups = products.filter((p) => p.type === 'topup');

  selectEl.innerHTML = topups
    .map((p) => `<option value="${p.sku}">${formatMoney(p.price, p.currency)}</option>`)
    .join('');

  buyBtn.addEventListener('click', () => handleBuyClick());

  currencyEl.querySelectorAll('.currency-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currencyEl.querySelectorAll('.currency-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

async function handleBuyClick() {
  buyBtn.disabled = true;
  const originalText = buyBtn.textContent;
  buyBtn.textContent = 'Оплата...';

  try {
    await buyProduct(selectEl.value, orderPanelCallbacks());
  } finally {
    buyBtn.disabled = false;
    buyBtn.textContent = originalText;
  }
}
