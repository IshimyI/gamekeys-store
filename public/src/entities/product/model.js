const CURRENCY_SYMBOL = { RUB: '₽', USD: '$', KZT: '₸' };

export function formatMoney(amount, currency = 'RUB') {
  return amount.toLocaleString('ru-RU') + ' ' + (CURRENCY_SYMBOL[currency] || currency);
}

export const TYPE_LABEL = {
  topup: 'Пополнение',
  key: 'Ключ активации',
  subscription: 'Подписка',
  giftcard: 'Подарочная карта',
};

export const TYPE_ICON = {
  topup: '💳',
  key: '🔑',
  subscription: '⭐',
  giftcard: '🎁',
};
