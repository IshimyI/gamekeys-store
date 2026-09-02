import { formatMoney, TYPE_ICON } from './model.js';

const COVER_CLASS = {
  topup: 'product-cover--topup',
  key: 'product-cover--key',
  subscription: 'product-cover--subscription',
  giftcard: 'product-cover--giftcard',
};

export function renderProductCard(product) {
  const coverClass = COVER_CLASS[product.type] || 'product-cover--key';
  const icon = TYPE_ICON[product.type] || '🎮';
  return `
    <div class="product-card" data-sku="${product.sku}">
      <div class="product-cover ${coverClass}">${icon}</div>
      <div class="product-body">
        <h3>${product.name}</h3>
        <div class="product-price">${formatMoney(product.price, product.currency)}</div>
        <button class="buy-btn" data-sku="${product.sku}">Купить</button>
      </div>
    </div>
  `;
}
