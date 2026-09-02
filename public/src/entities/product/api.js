import { getJson } from '../../shared/api/index.js';

const STATIC_FALLBACK_PRODUCTS = [
  { sku: 'STEAM-TOPUP-500', name: 'Пополнение Steam 500 ₽', type: 'topup', price: 500, currency: 'RUB', image: 'assets/steam.png' },
  { sku: 'STEAM-TOPUP-1000', name: 'Пополнение Steam 1000 ₽', type: 'topup', price: 1000, currency: 'RUB', image: 'assets/steam.png' },
  { sku: 'STEAM-TOPUP-2500', name: 'Пополнение Steam 2500 ₽', type: 'topup', price: 2500, currency: 'RUB', image: 'assets/steam.png' },
  { sku: 'KEY-CS2-PRIME', name: 'CS2 Prime Status ключ', type: 'key', price: 1290, currency: 'RUB', image: 'assets/cs2.png' },
  { sku: 'KEY-GTA5', name: 'GTA V ключ активации', type: 'key', price: 1990, currency: 'RUB', image: 'assets/gta5.png' },
  { sku: 'KEY-EFT', name: 'Escape from Tarkov ключ', type: 'key', price: 3490, currency: 'RUB', image: 'assets/eft.png' },
  { sku: 'KEY-RDR2', name: 'Red Dead Redemption 2 ключ', type: 'key', price: 2490, currency: 'RUB', image: 'assets/rdr2.png' },
  { sku: 'KEY-ELDENRING', name: 'Elden Ring ключ активации', type: 'key', price: 2990, currency: 'RUB', image: 'assets/eldenring.png' },
  { sku: 'SUB-DISCORD-1M', name: 'Discord Nitro 1 месяц', type: 'subscription', price: 399, currency: 'RUB', image: 'assets/discord.png' },
  { sku: 'SUB-YT-3M', name: 'YouTube Premium 3 месяца', type: 'subscription', price: 1490, currency: 'RUB', image: 'assets/youtube.png' },
  { sku: 'SUB-SPOTIFY-1M', name: 'Spotify Premium 1 месяц', type: 'subscription', price: 299, currency: 'RUB', image: 'assets/spotify.png' },
  { sku: 'SUB-XBOXGP-1M', name: 'Xbox Game Pass Ultimate 1 месяц', type: 'subscription', price: 899, currency: 'RUB', image: 'assets/xbox.png' },
  { sku: 'SUB-NETFLIX-1M', name: 'Netflix Premium 1 месяц', type: 'subscription', price: 799, currency: 'RUB', image: 'assets/netflix.png' },
  { sku: 'GIFT-PSN-1000', name: 'PlayStation Store карта 1000 ₽', type: 'giftcard', price: 1000, currency: 'RUB', image: 'assets/psn.png' },
  { sku: 'GIFT-XBOX-1500', name: 'Xbox Gift Card 1500 ₽', type: 'giftcard', price: 1500, currency: 'RUB', image: 'assets/xbox.png' },
  { sku: 'GIFT-ROBLOX-800', name: 'Roblox 800 Robux', type: 'giftcard', price: 890, currency: 'RUB', image: 'assets/roblox.png' },
  { sku: 'GIFT-STEAM-2000', name: 'Steam карта пополнения 2000 ₽', type: 'giftcard', price: 2000, currency: 'RUB', image: 'assets/steam.png' },
  { sku: 'GIFT-APPLE-1000', name: 'App Store & iTunes подарочная карта 1000 ₽', type: 'giftcard', price: 1000, currency: 'RUB', image: 'assets/appstore.png' },
];

export async function fetchProducts() {
  try {
    const { ok, data } = await getJson('/api/products');
    if (!ok || !Array.isArray(data)) return STATIC_FALLBACK_PRODUCTS;
    return data;
  } catch {
    return STATIC_FALLBACK_PRODUCTS;
  }
}
