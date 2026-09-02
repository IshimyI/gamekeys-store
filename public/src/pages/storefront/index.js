import { mountProductList } from '../../widgets/product-list/index.js';
import { mountServiceIcons } from '../../widgets/service-icons/index.js';
import { mountSteamTopup } from '../../widgets/steam-topup/index.js';
import { mountCatalogMenu } from '../../widgets/catalog-menu/index.js';
import { mountBannerCarousel } from '../../widgets/banner-carousel/index.js';

export function initStorefrontPage() {
  mountCatalogMenu();
  mountBannerCarousel();

  const serviceIconsEl = document.getElementById('serviceIcons');
  if (serviceIconsEl) mountServiceIcons(serviceIconsEl);

  mountSteamTopup();
  mountProductList();
}
