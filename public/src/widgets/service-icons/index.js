const SERVICES = [
  { id: 'steam', name: 'Steam', icon: 'src/widgets/service-icons/assets/steam.png' },
  { id: 'telegram', name: 'Telegram', icon: 'src/widgets/service-icons/assets/telegram.png' },
  { id: 'roblox', name: 'Roblox', icon: 'src/widgets/service-icons/assets/roblox.png' },
  { id: 'brawlstars', name: 'Brawl Stars', icon: 'src/widgets/service-icons/assets/brawlstars.png' },
  { id: 'pubgmobile', name: 'PUBG Mobile', icon: 'src/widgets/service-icons/assets/pubgmobile.png' },
  { id: 'appstore', name: 'App Store', icon: 'src/widgets/service-icons/assets/appstore.png' },
  { id: 'chatgpt', name: 'ChatGPT', icon: 'src/widgets/service-icons/assets/chatgpt.png' },
  { id: 'playstation', name: 'PlayStation', icon: 'src/widgets/service-icons/assets/playstation.png' },
  { id: 'tiktok', name: 'TikTok', icon: 'src/widgets/service-icons/assets/tiktok.png' },
  { id: 'mobilelegends', name: 'Mobile Legends', icon: 'src/widgets/service-icons/assets/mobilelegends.png' },
];

export function mountServiceIcons(containerEl) {
  containerEl.innerHTML =
    SERVICES.map(
      (s) => `
      <button class="service-icon" data-service="${s.id}" type="button">
        <img src="${s.icon}" alt="${s.name}" width="44" height="44" loading="lazy" />
        <span>${s.name}</span>
      </button>
    `
    ).join('') +
    `
      <button class="service-icon service-icon--more" type="button">
        <span class="service-icon-more-circle">841+</span>
        <span>ещё</span>
      </button>
    `;
}
