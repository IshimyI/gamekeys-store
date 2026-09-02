import { fetchProducts, renderProductCard } from '../../entities/product/index.js';
import { buyProduct } from '../../features/buy-product/index.js';
import { orderPanelCallbacks } from '../order-panel/index.js';

const SECTIONS = [
  { id: 'productsPopular', start: 0, end: 5 },
  { id: 'productsRecommended', start: 5, end: 10 },
  { id: 'productsOther', start: 10, end: undefined },
];

export async function mountProductList() {
  const products = await fetchProducts();
  const rowProducts = products.filter((p) => p.type !== 'topup');

  SECTIONS.forEach(({ id, start, end }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = rowProducts.slice(start, end).map(renderProductCard).join('');
  });

  document.querySelectorAll('.products .buy-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleBuyClick(btn));
  });

  document.querySelectorAll('.product-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.product-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

async function handleBuyClick(btn) {
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Оплата...';

  try {
    await buyProduct(btn.dataset.sku, orderPanelCallbacks());
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}
