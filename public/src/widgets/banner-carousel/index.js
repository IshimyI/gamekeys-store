const SLIDES = [
  { title: 'Ключи, пополнения и подписки — мгновенно', subtitle: 'Оплатил → получил код. Без ожидания, без ручной выдачи.' },
  { title: 'Пополнение Steam за пару кликов', subtitle: 'Любая сумма, зачисление сразу после оплаты.' },
  { title: 'Подписки и подарочные карты', subtitle: 'Discord Nitro, YouTube Premium, PSN, Xbox и другие.' },
];

const AUTOPLAY_MS = 4000;

export function mountBannerCarousel() {
  const track = document.getElementById('bannerTrack');
  const dotsEl = document.getElementById('bannerDots');
  const prevBtn = document.getElementById('bannerPrev');
  const nextBtn = document.getElementById('bannerNext');

  track.innerHTML = SLIDES.map(
    (s) => `
      <div class="banner-slide">
        <h1>${s.title}</h1>
        <p>${s.subtitle}</p>
      </div>
    `
  ).join('');

  dotsEl.innerHTML = SLIDES.map((_, i) => `<button class="banner-dot" data-index="${i}" type="button"></button>`).join('');

  let index = 0;
  let timer = null;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsEl.querySelectorAll('.banner-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function goTo(i) {
    index = (i + SLIDES.length) % SLIDES.length;
    render();
    restartAutoplay();
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  dotsEl.querySelectorAll('.banner-dot').forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });

  render();
  restartAutoplay();
}
