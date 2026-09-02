const promoInput = document.getElementById('promoInput');

export function getPromoCode() {
  return promoInput.value.trim() || undefined;
}
