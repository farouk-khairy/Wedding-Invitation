"use strict";

/* =========================================================
   ✏️  المحتوى القابل للتعديل — عدّل هنا فقط
   ========================================================= */
const weddingData = {
  groom: "فاروق",
  bride: "سلمى",
  date: "2026-12-12",                 // تاريخ الزفاف (YYYY-MM-DD)
  countdownTime: "00:00",             // الساعة التي ينتهي عندها العد التنازلي
  timezoneOffset: "+02:00",           // توقيت القاهرة
  displayDate: "السبت، 12 ديسمبر 2026",
  heroDate: "12 ديسمبر 2026",
  time: "السادسة مساءًا",                           // مثال: "8:00 مساءً" — يظهر صف الوقت تلقائيًا عند كتابته
  venue: "شيراتون, مسجد الفاروق",                          // مثال: "قاعة ..." — يظهر صف المكان تلقائيًا عند كتابته
  locationUrl: "https://maps.app.goo.gl/x3oKAE6XPMecfYgn8",
  gateText: "افتح"
};

const assets = {
  heroImage: "assets/images/hero.webp",
  heroImageMobile: "assets/images/hero-mobile.webp",
  music: "assets/audio/music.mp3",
  doorImage: "assets/images/door.svg",       // استبدلها بصورة الباب الخاصة بك (webp/png/svg)
  doorImageMobile: null,                     // اختياري: نسخة طولية للموبايل
  doorFallback: "assets/images/door.svg"     // تُستخدم لو فشل تحميل doorImage
};

const messages = {
  countdownDone: "اليوم بدأت حكايتنا 🤍"
};

/* =========================================================
   Helpers
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isLite =
  window.matchMedia("(max-width: 767px)").matches ||
  (navigator.hardwareConcurrency || 8) <= 4 ||
  (navigator.deviceMemory || 8) <= 4;

const els = {
  body: document.body,
  html: document.documentElement,
  gate: $("#gate"),
  gateBtn: $("#gateBtn"),
  app: $("#app"),
  main: $("#main"),
  audio: $("#bgm"),
  musicBtn: $("#musicBtn"),
  heroImg: $("#heroImg"),
  mapBtn: $("#mapBtn"),
  cursor: $("#cursor")
};

/* =========================================================
   Content + assets
   ========================================================= */
function bindContent() {
  $$("[data-bind]").forEach((node) => {
    const value = weddingData[node.dataset.bind];
    if (value) node.textContent = value;
  });
  // الصفوف الاختيارية (الوقت / المكان) تظهر فقط عند وجود قيمة
  $$("[data-optional]").forEach((row) => {
    if (weddingData[row.dataset.optional]) row.hidden = false;
  });
  els.mapBtn.href = weddingData.locationUrl;
}

function setupAssets() {
  // صورة الـ Hero (نسخة الموبايل للشاشات الطولية الضيقة)
  const portraitPhone = window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
  els.heroImg.src = (portraitPhone && assets.heroImageMobile) || assets.heroImage;

  // الموسيقى
  els.audio.src = assets.music;
  els.audio.loop = true;

  // الباب: نتأكد من تحميله، وإلا نستخدم البديل
  const portrait = window.matchMedia("(max-aspect-ratio: 3/4)").matches;
  const src = (portrait && assets.doorImageMobile) || assets.doorImage;
  const show = (url) => {
    // CSS يحلّ المسار نسبةً لملف الـ CSS، لذلك نحوّله لمسار كامل
    els.gate.style.setProperty("--door-image", `url("${new URL(url, document.baseURI).href}")`);
    els.gate.classList.add("is-ready");
  };
  const probe = new Image();
  probe.onload = () => show(src);
  probe.onerror = () => show(assets.doorFallback);
  probe.src = src;
}

/* =========================================================
   Music
   ========================================================= */
const music = {
  get playing() { return !els.audio.paused; },
  async play() {
    try { await els.audio.play(); } catch (_) { /* المتصفح منع التشغيل: يبقى الزر في حالة Off */ }
    this.sync();
  },
  pause() { els.audio.pause(); this.sync(); },
  toggle() { this.playing ? this.pause() : this.play(); },
  sync() {
    const on = this.playing;
    els.musicBtn.setAttribute("aria-pressed", String(on));
    els.musicBtn.setAttribute("aria-label", on ? "إيقاف الموسيقى" : "تشغيل الموسيقى");
  },
  init() {
    els.musicBtn.addEventListener("click", () => this.toggle());
    els.audio.addEventListener("play", () => this.sync());
    els.audio.addEventListener("pause", () => this.sync());
  }
};

/* =========================================================
   Gate (Scene 00)
   ========================================================= */
const gate = {
  opened: false,
  init() {
    els.app.inert = true;
    els.gateBtn.focus({ preventScroll: true });
    els.gateBtn.addEventListener("click", () => this.open());
  },
  async open() {
    if (this.opened) return;
    this.opened = true;

    // 1) الموسيقى داخل نفس الـ click handler (شرط سياسات المتصفحات)
    const musicStarted = music.play();

    // 2) أنيميشن فتح الباب
    els.gateBtn.disabled = true;
    els.gate.classList.add("is-opening");
    await wait(reducedMotion ? 150 : 1050);

    // 3) تلاشي الشاشة + بدء مشهد الـ Hero
    els.gate.classList.add("is-leaving");
    els.body.classList.remove("is-locked");
    els.app.inert = false;
    window.scrollTo(0, 0);
    els.html.classList.add("is-live");
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    await wait(reducedMotion ? 400 : 760);

    // 4) إزالة الشاشة تمامًا من الـ DOM
    els.gate.remove();
    els.main.focus({ preventScroll: true });
    await musicStarted;
  }
};

/* =========================================================
   Countdown
   ========================================================= */
function initCountdown() {
  const target = new Date(
    `${weddingData.date}T${weddingData.countdownTime || "00:00"}:00${weddingData.timezoneOffset}`
  ).getTime();
  const box = $("#countdown");
  const done = $("#cdDone");
  const nodes = {
    days: $('[data-unit="days"]', box),
    hours: $('[data-unit="hours"]', box),
    minutes: $('[data-unit="minutes"]', box),
    seconds: $('[data-unit="seconds"]', box)
  };
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  let timer = 0;
  let lastLabelMinute = -1;

  function tick() {
    const diff = target - Date.now();
    if (Number.isNaN(target) || diff <= 0) {
      box.classList.add("is-done");
      done.hidden = false;
      done.textContent = messages.countdownDone;
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    nodes.days.textContent = pad(d, 2);
    nodes.hours.textContent = pad(h);
    nodes.minutes.textContent = pad(m);
    nodes.seconds.textContent = pad(s % 60);
    if (m !== lastLabelMinute) {
      lastLabelMinute = m;
      box.setAttribute("aria-label", `متبقي ${d} يوم و${h} ساعة و${m} دقيقة`);
    }
  }

  tick();
  timer = setInterval(tick, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
}

/* =========================================================
   Magic Scroll (GSAP + ScrollTrigger)
   ========================================================= */
function initMotion() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || reducedMotion) return; // بدون حركة: تخطيط ثابت بسيط

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const hero = $("#hero");
  const stage = $("#story");
  const cards = $$(".card", stage);

  /* ---- Hero → cream veil ---- */
  const heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: hero, start: "top top", end: "+=110%", scrub: 0.7, pin: true, anticipatePin: 1 }
  });
  heroTl
    .to(".hero__media", { scale: 1.18, ...(isLite ? {} : { filter: "blur(5px)" }) }, 0)
    .to(".hero__tint", { opacity: 0.55, duration: 0.55 }, 0)
    .to(".hero__content", { yPercent: -14, opacity: 0, duration: 0.45 }, 0)
    .to(".hero__scroll", { opacity: 0, duration: 0.15 }, 0)
    .to(".hero__veil", { opacity: 1, duration: 0.5 }, 0.5);
  const heroTrigger = heroTl.scrollTrigger;

  $("#scrollHint").addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: heroTrigger.end + 2, behavior: "smooth" });
  });

  /* ---- Layered cards ---- */
  stage.classList.add("is-cinematic");
  const measure = () => {
    stage.style.setProperty("--stack-h", "0px");
    const tallest = Math.max(...cards.map((card) => card.offsetHeight));
    stage.style.setProperty("--stack-h", `${Math.ceil(tallest)}px`);
  };
  measure();
  ScrollTrigger.addEventListener("refreshInit", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  gsap.set(cards, { yPercent: -50, y: 80, scale: 0.96, autoAlpha: 0 });

  const hold = 0.75;
  const move = 0.6;
  const stageTl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: stage, start: "top top", end: () => `+=${cards.length * 80}%`,
      scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true
    }
  });

  stageTl.to(cards[0], { autoAlpha: 1, y: 0, scale: 1, duration: move }, 0);
  cards.forEach((card, i) => {
    if (i === 0) return;
    const t = move + hold + (i - 1) * (move + hold);
    stageTl
      .to(cards[i - 1], { autoAlpha: 0, y: -60, scale: 0.9, duration: move }, t)
      .to(card, { autoAlpha: 1, y: 0, scale: 1, duration: move }, t + 0.05);
  });
  stageTl.to({}, { duration: hold });

  if (!isLite) {
    const total = stageTl.duration();
    stageTl
      .to(".branch--a", { y: 140, rotate: -6, ease: "none", duration: total }, 0)
      .to(".branch--b", { y: -140, rotate: 172, ease: "none", duration: total }, 0);
  }

  /* ---- Finale ---- */
  gsap.from(".finale__inner > *", {
    y: 28, opacity: 0, duration: 1, stagger: 0.14, ease: "power2.out",
    scrollTrigger: { trigger: ".finale", start: "top 72%", once: true }
  });
}

/* =========================================================
   Cursor (Desktop فقط)
   ========================================================= */
function initCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || reducedMotion || isLite || !window.gsap) return;

  const x = window.gsap.quickTo(els.cursor, "x", { duration: 0.35, ease: "power3" });
  const y = window.gsap.quickTo(els.cursor, "y", { duration: 0.35, ease: "power3" });
  window.addEventListener("pointermove", (e) => {
    els.cursor.classList.add("is-on");
    x(e.clientX);
    y(e.clientY);
  }, { passive: true });
  document.addEventListener("pointerleave", () => els.cursor.classList.remove("is-on"));
  document.addEventListener("pointerover", (e) => {
    els.cursor.classList.toggle("is-hover", Boolean(e.target.closest("a, button")));
  });
}

/* =========================================================
   Init
   ========================================================= */
bindContent();
setupAssets();
music.init();
gate.init();
initCountdown();
initMotion();
initCursor();
