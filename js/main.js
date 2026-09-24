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


/* SECTION 09｜締めの一文を、スクロールに合わせて表示
   ・文字が画面に入ってからスクロールした分だけ、左から1文字ずつ現れます
   ・各文字は画面の手前（大きく・ぼやけた状態）から飛んできて、ページに貼り付きます */
(() => {
  const closing = document.querySelector('.message-section__closing');
  if (!closing) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let chars = [];
  function split() {
    // CMSで文言が変わった場合も作り直します
    if (closing.querySelector('.fly-char')) return;
    const text = closing.textContent;
    closing.textContent = '';
    chars = [...text].map((ch) => {
      const span = document.createElement('span');
      span.className = 'fly-char';
      span.textContent = ch;
      closing.appendChild(span);
      return span;
    });
    closing.setAttribute('aria-label', text);
  }

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function update() {
    split();
    const rect = closing.getBoundingClientRect();
    const vh = window.innerHeight;
    // 文字の上端が画面の下端に来たら開始 → 文字が画面の上から45%の位置に来たら完成
    const start = vh;
    const end = vh * 0.45;
    const p = clamp((start - rect.top) / (start - end));
    const n = chars.length || 1;
    chars.forEach((span, i) => {
      // 1文字ごとに少しずつずらして登場（全体の85%の間に全文字が貼り付く）
      const t = ease(clamp((p / 0.85 - (i / n) * 0.75) / 0.25));
      span.style.opacity = t;
      span.style.transform = `translateY(${(1 - t) * -18}px) scale(${1 + (1 - t) * 2.2})`;
      span.style.filter = t >= 1 ? 'none' : `blur(${(1 - t) * 8}px)`;
    });
    closing.style.setProperty('--line', clamp((p - 0.85) / 0.15));
  }

  closing.classList.add('is-scroll-anim');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

/* SECTION 01｜青い部分に気泡を浮かべる（見た目はsection-01.css） */
(() => {
  const shape = document.querySelector('.intro__blue-shape');
  if (!shape || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.className = 'intro-bubble';
    const size = 10 + Math.random() * 26;               // 気泡の大きさ(px)
    b.style.width = b.style.height = `${size}px`;
    b.style.left = `${2 + Math.random() * 50}%`;       // 青い部分の中に出す
    b.style.setProperty('--dur', `${5 + Math.random() * 5}s`);
    b.style.setProperty('--delay', `${4.8 + Math.random() * 6}s`);
    b.style.setProperty('--sway', `${(Math.random() * 2 - 1) * 24}px`);
    shape.appendChild(b);
  }
})();
