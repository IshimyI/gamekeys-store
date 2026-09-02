const SECTIONS = [
  {
    id: 'games',
    label: 'Игры и игровые сервисы',
    columns: [
      { title: 'Steam', items: ['Игры и DLC', 'Пополнение баланса', 'Подарочные карты', 'Коллекционные карточки', 'Смена региона'] },
      { title: 'PlayStation', items: ['Игры и DLC', 'Пополнение баланса', 'Новые аккаунты', 'PS Plus', 'EA Play'] },
      { title: 'Xbox', items: ['Игры и DLC', 'Пополнение баланса', 'Новые аккаунты', 'Xbox Game Pass', 'Услуги'] },
      { title: 'Nintendo', items: ['Игры и DLC', 'Подарочные карты', 'Новые аккаунты', 'NS Online'] },
      { title: 'Battle.net', items: ['World of Warcraft', 'Подарочные карты', 'Прямое пополнение', 'Новые аккаунты', 'Смена региона'] },
    ],
    collections: { title: 'Подборки', items: ['Скидки 90%', 'Популярные издатели', 'Лучшие серии игр', 'Steam Deck', 'Bundle-наборы'] },
  },
  {
    id: 'values',
    label: 'Игровые ценности',
    columns: [
      { title: 'Игровая валюта', items: ['FIFA Points', 'V-Bucks', 'Robux', 'CS2 скины'] },
      { title: 'Предметы', items: ['Скины', 'Кейсы', 'Внутриигровые предметы'] },
    ],
  },
  {
    id: 'mobile',
    label: 'Мобильные игры',
    columns: [
      { title: 'Популярное', items: ['Brawl Stars', 'PUBG Mobile', 'Mobile Legends', 'Roblox'] },
    ],
  },
  {
    id: 'services',
    label: 'Сервисы и соцсети',
    columns: [
      { title: 'Соцсети', items: ['Telegram Premium', 'TikTok Coins'] },
      { title: 'ИИ-сервисы', items: ['ChatGPT Plus'] },
    ],
  },
  {
    id: 'programs',
    label: 'Программы',
    columns: [
      { title: 'Магазины приложений', items: ['App Store подарочные карты', 'Подписки на ПО'] },
    ],
  },
];

export function mountCatalogMenu() {
  const button = document.getElementById('catalogButton');
  const dropdown = document.getElementById('catalogDropdown');

  let activeId = SECTIONS[0].id;

  function renderNav() {
    return SECTIONS.map(
      (s) => `
        <button class="catalog-nav-item ${s.id === activeId ? 'active' : ''}" data-section="${s.id}" type="button">
          <span>${s.label}</span>
          <span class="catalog-nav-arrow">›</span>
        </button>
      `
    ).join('');
  }

  function renderPanel() {
    const section = SECTIONS.find((s) => s.id === activeId);
    const columns = section.columns
      .map(
        (col) => `
          <div class="catalog-col">
            <div class="catalog-col-title">${col.title} <span class="catalog-col-arrow">›</span></div>
            ${col.items.map((item) => `<div class="catalog-col-item">${item}</div>`).join('')}
          </div>
        `
      )
      .join('');

    const collections = section.collections
      ? `
        <div class="catalog-collections">
          <div class="catalog-col-title">${section.collections.title} <span class="catalog-col-arrow">›</span></div>
          <div class="catalog-collections-items">
            ${section.collections.items.map((item) => `<div class="catalog-col-item">${item}</div>`).join('')}
          </div>
        </div>
      `
      : '';

    return `<div class="catalog-columns">${columns}</div>${collections}`;
  }

  function render() {
    dropdown.innerHTML = `
      <div class="catalog-nav">${renderNav()}</div>
      <div class="catalog-panel">${renderPanel()}</div>
    `;

    dropdown.querySelectorAll('.catalog-nav-item').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        activeId = el.dataset.section;
        render();
      });
    });
  }

  render();

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== button) {
      dropdown.classList.remove('open');
    }
  });
}
