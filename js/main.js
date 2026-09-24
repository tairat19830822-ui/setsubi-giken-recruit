/*
SECTION 01〜12 静的HTML教材。
SECTION 06のみカルーセル操作でJavaScriptを使用します。
Supabase / CMS / 外部通信はまだ未実装です。
*/
(() => {
  const carousel = document.querySelector('[data-voices-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-voices-track]');
  const slides = [...carousel.querySelectorAll('[data-voice-slide]')];
  const prev = document.querySelector('[data-voices-prev]');
  const next = document.querySelector('[data-voices-next]');
  const thumbs = [...document.querySelectorAll('[data-voice-thumb]')];
  const dots = [...document.querySelectorAll('[data-voice-dot]')];
  let index = 0;

  const count = slides.length;
  const maxIndex = () => Math.max(0, count - 1);

  // 円柱の側面にカードを並べて回す表示。
  // d = 選択中のカードから何枚離れているか（最初と最後はつながっていて、ぐるぐる回ります）
  function render() {
    index = ((index % count) + count) % count;
    const cardWidth = slides[0] ? slides[0].offsetWidth : 0;
    const mobile = window.innerWidth <= 680;
    const step = mobile ? 24 : 34;               // 1枚ごとの角度
    const radius = (cardWidth * (mobile ? 0.92 : 0.9)) / Math.sin(step * Math.PI / 180);

    slides.forEach((slide, i) => {
      let d = i - index;
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;
      const angle = d * step;
      const rad = angle * Math.PI / 180;
      const x = radius * Math.sin(rad);
      const z = radius * (Math.cos(rad) - 1);
      const scale = d === 0 ? 1 : 0.72;            // 左右のカードの大きさ
      slide.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`;
      slide.style.opacity = Math.abs(d) <= 1 ? (d === 0 ? '1' : '.4') : '0';
      slide.style.zIndex = String(10 - Math.abs(d));
      slide.style.pointerEvents = d === 0 ? 'auto' : 'none';
      slide.classList.toggle('is-current', d === 0);
      slide.setAttribute('aria-hidden', String(d !== 0));
    });

    thumbs.forEach((thumb, i) => {
      const active = i === index;
      thumb.classList.toggle('is-active', active);
      if (!thumb.disabled) thumb.setAttribute('aria-selected', String(active));
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  prev?.addEventListener('click', () => { index -= 1; render(); });
  next?.addEventListener('click', () => { index += 1; render(); });
  thumbs.forEach((thumb) => thumb.addEventListener('click', () => { index = Number(thumb.dataset.voiceThumb || 0); render(); }));
  dots.forEach((dot) => dot.addEventListener('click', () => { index = Number(dot.dataset.voiceDot || 0); render(); }));
  window.addEventListener('resize', render, { passive: true });

  render();
})();


/* SECTION 12｜エントリーフォーム
   教材用のため外部送信は行いません。
   必須項目とメール形式のみブラウザ標準 + JSで確認します。 */
(() => {
  const form = document.querySelector('#entry-form');
  const status = document.querySelector('#entry-form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.classList.remove('is-error', 'is-success');

    if (!form.checkValidity()) {
      status.textContent = '必須項目をご確認ください。';
      status.classList.add('is-error');
      const firstInvalid = form.querySelector(':invalid');
      firstInvalid?.focus();
      return;
    }

    status.textContent = '入力内容を確認できました。現在は教材版のため、外部送信は行いません。';
    status.classList.add('is-success');
  });
})();


/* SECTION 09｜締めの一文を、画面に入ったときにアニメーション表示 */
(() => {
  const closing = document.querySelector('.message-section__closing');
  if (!closing || !('IntersectionObserver' in window)) return;
  closing.classList.add('is-animate');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { closing.classList.add('is-visible'); io.disconnect(); }
    });
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(closing.parentElement);
})();
