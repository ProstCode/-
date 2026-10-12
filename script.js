"use strict";

const TELEGRAM_URL = "https://t.me/prost404";
const LOVE_TEXT = "Я тебя люблю ❤️";
const MUSIC_URL = "music.m4a";
const MUSIC_VOLUME = 0.55;

const TYPE_INTERVAL = 16;
const CHARS_PER_TICK = 2;
const MAX_BG_ITEMS = 26;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TEASES = [
  "Не-а 😜",
  "Попробуй ещё раз",
  "Хитро!",
  "Не так-то просто 😂",
  "Убежала! ",
  "Мимо 😅",
];

const bgLayer = $("#bgLayer");
const fxLayer = $("#fxLayer");

const screenEls = {
  envelope: $("#screenEnvelope"),
  letter: $("#screenLetter"),
  question: $("#screenQuestion"),
  final: $("#screenFinal"),
};

const envelopeScene = $("#envelopeScene");
const envelopeBtn = $("#envelope");
const envelopeWrap = $("#envelopeWrap");

const letterEl = $("#letter");
const letterBody = $("#letterBody");
const skipTypingBtn = $("#skipTypingBtn");
const finishLetterBtn = $("#finishLetterBtn");
const letterHint = $("#letterHint");

const heartEl = $("#heart");
const yesBtn = $("#yesBtn");
const noBtn = $("#noBtn");
const noPlaceholder = $("#noPlaceholder");
const noBtnHome = noBtn.parentNode;

const telegramBtn = $("#telegramBtn");
const restartBtn = $("#restartBtn");

const baseParagraphs = $$("#letterBody p").map((p) =>
  p.textContent.trim().replace(/\s+/g, " "),
);

let currentScreen = "envelope";

function showScreen(name) {
  Object.keys(screenEls).forEach((key) => {
    screenEls[key].classList.toggle("is-active", key === name);
  });
  currentScreen = name;
}

let bgTimer = null;

function spawnBgItem() {
  if (!bgLayer || bgLayer.childElementCount >= MAX_BG_ITEMS) return;

  const item = document.createElement("span");
  item.className = "float-item";
  item.style.left = rand(-2, 98) + "vw";
  item.style.fontSize = rand(9, 20) + "px";
  item.style.animationDuration = rand(9, 18) + "s";
  item.style.animationDelay = rand(0, 1.6) + "s";
  item.style.setProperty("--sway", rand(-70, 70).toFixed(0) + "px");

  const roll = Math.random();
  const inner = document.createElement("i");
  if (roll < 0.55) {
    inner.className = "heart-shape";
  } else if (roll < 0.8) {
    inner.className = "star-shape";
  } else {
    inner.className = "dot-shape";
  }
  item.appendChild(inner);

  item.addEventListener("animationend", () => item.remove());
  bgLayer.appendChild(item);
}

function startBackground() {
  if (bgTimer) return;
  for (let i = 0; i < 8; i++) window.setTimeout(spawnBgItem, i * 220);
  bgTimer = window.setInterval(spawnBgItem, prefersReducedMotion ? 2600 : 850);
}

let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  envelopeBtn.classList.add("is-open");
  spawnMiniHeartsAround(envelopeWrap, 7);

  window.setTimeout(() => envelopeScene.classList.add("is-zooming"), 620);

  window.setTimeout(() => {
    showScreen("letter");
    enterLetter();
  }, 1300);
}

const caret = document.createElement("span");
caret.className = "caret";

let paraEls = [];
const typing = {
  active: false,
  pi: 0,
  ci: 0,
  chars: [],
  textNode: null,
  timer: null,
};

function stopTyping() {
  if (typing.timer) {
    window.clearInterval(typing.timer);
    typing.timer = null;
  }
  typing.active = false;
  if (caret.parentNode) caret.remove();
}

function buildParagraphs() {
  letterBody.innerHTML = "";
  paraEls = baseParagraphs.map((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    letterBody.appendChild(p);
    return p;
  });
}

function enterLetter() {
  stopTyping();
  buildParagraphs();

  typing.pi = 0;
  typing.ci = 0;
  typing.chars = [];
  typing.textNode = null;
  typing.active = true;

  skipTypingBtn.classList.remove("is-hidden");
  finishLetterBtn.classList.add("is-hidden");
  letterHint.classList.remove("is-hidden");
  screenEls.letter.scrollTop = 0;

  if (prefersReducedMotion) {
    revealWholeLetter();
    return;
  }
  typing.timer = window.setInterval(typeStep, TYPE_INTERVAL);
}

function typeStep() {
  if (!typing.active) return;

  if (typing.pi >= paraEls.length) {
    revealWholeLetter();
    return;
  }

  const p = paraEls[typing.pi];

  if (!typing.chars.length) {
    typing.chars = Array.from(baseParagraphs[typing.pi]);
    typing.ci = 0;
    typing.textNode = document.createTextNode("");
    p.appendChild(typing.textNode);
    p.appendChild(caret);
    p.classList.add("is-typing");
  }

  typing.ci = Math.min(typing.chars.length, typing.ci + CHARS_PER_TICK);
  typing.textNode.nodeValue = typing.chars.slice(0, typing.ci).join("");
  keepCaretVisible();

  if (typing.ci >= typing.chars.length) {
    p.classList.remove("is-typing");
    typing.chars = [];
    typing.pi += 1;
    typing.ci = 0;
    typing.textNode = null;
  }
}

function keepCaretVisible() {
  if (!caret.parentNode) return;
  const scroller = screenEls.letter;
  const cRect = caret.getBoundingClientRect();
  const sRect = scroller.getBoundingClientRect();
  const margin = 56;
  if (cRect.bottom > sRect.bottom - margin) {
    scroller.scrollTop += cRect.bottom - sRect.bottom + margin + 24;
  }
}

function revealWholeLetter() {
  stopTyping();
  paraEls.forEach((p, i) => {
    p.textContent = baseParagraphs[i];
    p.classList.remove("is-typing");
  });
  typing.active = false;
  skipTypingBtn.classList.add("is-hidden");
  finishLetterBtn.classList.remove("is-hidden");
  letterHint.classList.add("is-hidden");
}

function skipTyping() {
  if (!typing.active) return;
  revealWholeLetter();
}

let answered = false;
let noEscaped = false;
let lastEscapeAt = 0;

const ESCAPE_COOLDOWN = 340;
const NO_PROXIMITY = 78;

function resetQuestion() {
  answered = false;
  noEscaped = false;
  lastEscapeAt = 0;

  yesBtn.classList.remove("is-winning");
  yesBtn.style.pointerEvents = "";
  noBtn.style.pointerEvents = "";
  noBtn.style.visibility = "";
  noBtn.classList.remove("is-fixed");
  noBtn.style.cssText = "";

  if (noBtn.parentNode !== noBtnHome) {
    noBtnHome.appendChild(noBtn);
  }

  noPlaceholder.classList.remove("is-visible");
  noPlaceholder.style.width = "";
  noPlaceholder.style.height = "";

  heartEl.classList.remove("is-celebrating");
}

function detachNoButton() {
  if (noEscaped) return;

  const rect = noBtn.getBoundingClientRect();

  noBtn.style.position = "fixed";
  noBtn.style.left = rect.left + "px";
  noBtn.style.top = rect.top + "px";
  noBtn.style.width = rect.width + "px";
  noBtn.style.height = rect.height + "px";
  noBtn.style.margin = "0";
  noBtn.classList.add("is-fixed");

  noPlaceholder.style.width = rect.width + "px";
  noPlaceholder.style.height = rect.height + "px";
  noPlaceholder.classList.add("is-visible");

  document.body.appendChild(noBtn);

  noEscaped = true;
  void noBtn.offsetWidth;
}

function rectsOverlap(a, b) {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

function findFreePosition(width, height, pointerX, pointerY) {
  const pad = 10;
  const maxX = Math.max(pad, window.innerWidth - width - pad);
  const maxY = Math.max(pad, window.innerHeight - height - pad);

  const avoid = [];
  [yesBtn, heartEl, $(".question__text"), $(".question__eyebrow")].forEach(
    (el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      avoid.push({
        left: r.left - 14,
        top: r.top - 14,
        right: r.right + 14,
        bottom: r.bottom + 14,
      });
    },
  );

  let fallback = { x: pad, y: pad };
  let bestDistance = -1;

  for (let i = 0; i < 40; i++) {
    const x = rand(pad, maxX);
    const y = rand(pad, maxY);
    const candidate = { left: x, top: y, right: x + width, bottom: y + height };

    let free = true;
    for (let j = 0; j < avoid.length; j++) {
      if (rectsOverlap(candidate, avoid[j])) {
        free = false;
        break;
      }
    }

    const cx = x + width / 2;
    const cy = y + height / 2;
    const pointerDistance =
      pointerX == null ? Infinity : Math.hypot(cx - pointerX, cy - pointerY);

    if (free && pointerDistance > 140) {
      return { x, y };
    }

    if (pointerDistance > bestDistance) {
      bestDistance = pointerDistance;
      fallback = { x, y };
    }
  }

  return fallback;
}

function escapeNo(pointerX, pointerY) {
  if (answered) return;

  const now = performance.now();
  if (now - lastEscapeAt < ESCAPE_COOLDOWN) return;
  lastEscapeAt = now;

  const rect = noBtn.getBoundingClientRect();
  const startX = rect.left;
  const startY = rect.top;

  detachNoButton();

  const target = findFreePosition(rect.width, rect.height, pointerX, pointerY);
  noBtn.style.left = target.x + "px";
  noBtn.style.top = target.y + "px";

  spawnFloatingHeart(startX + rect.width / 2, startY + rect.height / 2);

  if (Math.random() < 0.5) {
    showTease(target.x, target.y, rect.width);
  }
}

function showTease(x, y, width) {
  const el = document.createElement("span");
  el.className = "tease";
  el.textContent = pick(TEASES);
  el.style.left = x + width / 2 + "px";
  el.style.top = y + "px";
  el.addEventListener("animationend", () => el.remove());
  fxLayer.appendChild(el);
}

function onPointerMove(event) {
  if (currentScreen !== "question" || answered) return;
  if (event.pointerType === "touch") return;

  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
  const threshold = Math.max(rect.width, rect.height) / 2 + NO_PROXIMITY;

  if (distance < threshold) {
    escapeNo(event.clientX, event.clientY);
  }
}

function onNoTouch(event) {
  if (currentScreen !== "question" || answered) return;
  event.preventDefault();
  const touch = event.touches[0];
  escapeNo(touch ? touch.clientX : null, touch ? touch.clientY : null);
}

function onHeartClick() {
  if (answered) return;
  spawnMiniHeartsAround(heartEl, 6);
}

function onYesClick() {
  if (answered) return;
  answered = true;

  yesBtn.style.pointerEvents = "none";
  noBtn.style.pointerEvents = "none";
  noBtn.style.visibility = "hidden";

  heartEl.classList.add("is-celebrating");
  yesBtn.classList.add("is-winning");

  spawnMiniHeartsAround(yesBtn, 10);
  softGlow();
  playWinFill();

  window.setTimeout(() => bigBurst(), 430);

  window.setTimeout(() => {
    showScreen("final");
    enterFinal();
  }, 1450);
}

function enterFinal() {
  window.setTimeout(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    burstAt(cx, cy, 14);
  }, 260);
}

function setupTelegram() {
  telegramBtn.href = TELEGRAM_URL || "https://t.me/";
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => fallbackCopy(text),
    );
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch (error) {
    return false;
  }
}

function onTelegramClick() {
  copyText(LOVE_TEXT).then((ok) => {
    showToast(
      ok ? "Скопировала: «" + LOVE_TEXT + "» 💗" : "Открываю Telegram… 💗",
    );
  });
}

function restartExperience() {
  stopTyping();
  clearFx();

  envelopeOpened = false;
  envelopeBtn.classList.remove("is-open");
  envelopeScene.classList.remove("is-zooming");

  buildParagraphs();
  skipTypingBtn.classList.remove("is-hidden");
  finishLetterBtn.classList.add("is-hidden");
  letterHint.classList.remove("is-hidden");
  screenEls.letter.scrollTop = 0;

  resetQuestion();
  showScreen("envelope");
}

function spawnFloatingHeart(x, y) {
  const wrapper = document.createElement("span");
  wrapper.className = "burst-particle";
  wrapper.style.setProperty("--tx", rand(-24, 24).toFixed(0) + "px");
  wrapper.style.setProperty("--ty", "-72px");
  wrapper.style.setProperty("--rot", rand(-25, 25).toFixed(0) + "deg");
  wrapper.style.left = x + "px";
  wrapper.style.top = y + "px";
  wrapper.style.fontSize = "15px";

  const heart = document.createElement("i");
  heart.className = "heart-shape";
  wrapper.appendChild(heart);

  wrapper.addEventListener("animationend", () => wrapper.remove());
  fxLayer.appendChild(wrapper);
}

function spawnMiniHeartsAround(element, count) {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement("span");
    wrapper.className = "burst-particle";
    const angle = rand(0, Math.PI * 2);
    const distance = rand(60, 170);
    wrapper.style.setProperty(
      "--tx",
      (Math.cos(angle) * distance).toFixed(0) + "px",
    );
    wrapper.style.setProperty(
      "--ty",
      (Math.sin(angle) * distance).toFixed(0) + "px",
    );
    wrapper.style.setProperty("--rot", rand(-40, 40).toFixed(0) + "deg");
    wrapper.style.left = cx + "px";
    wrapper.style.top = cy + "px";
    wrapper.style.fontSize = rand(10, 18).toFixed(0) + "px";

    const heart = document.createElement("i");
    heart.className = "heart-shape";
    wrapper.appendChild(heart);

    wrapper.addEventListener("animationend", () => wrapper.remove());
    fxLayer.appendChild(wrapper);
  }
}

function burstAt(cx, cy, count) {
  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement("span");
    wrapper.className = "burst-particle";
    const angle = rand(0, Math.PI * 2);
    const distance = rand(
      90,
      Math.min(window.innerWidth, window.innerHeight) * 0.5,
    );
    wrapper.style.setProperty(
      "--tx",
      (Math.cos(angle) * distance).toFixed(0) + "px",
    );
    wrapper.style.setProperty(
      "--ty",
      (Math.sin(angle) * distance).toFixed(0) + "px",
    );
    wrapper.style.setProperty("--rot", rand(-60, 60).toFixed(0) + "deg");
    wrapper.style.left = cx + "px";
    wrapper.style.top = cy + "px";

    if (i % 3 === 1) {
      wrapper.classList.add("burst-particle--dot");
      wrapper.style.fontSize = rand(7, 13).toFixed(0) + "px";
    } else {
      wrapper.style.fontSize = rand(13, 30).toFixed(0) + "px";
      const heart = document.createElement("i");
      heart.className = "heart-shape";
      wrapper.appendChild(heart);
    }

    wrapper.addEventListener("animationend", () => wrapper.remove());
    fxLayer.appendChild(wrapper);
  }
}

function bigBurst() {
  softGlow();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  burstAt(cx, cy, prefersReducedMotion ? 12 : 38);

  window.setTimeout(() => {
    burstAt(
      window.innerWidth * 0.25,
      window.innerHeight * 0.35,
      prefersReducedMotion ? 5 : 12,
    );
    burstAt(
      window.innerWidth * 0.75,
      window.innerHeight * 0.65,
      prefersReducedMotion ? 5 : 12,
    );
  }, 260);
}

function softGlow() {
  const glow = document.createElement("span");
  glow.className = "soft-glow";
  glow.addEventListener("animationend", () => glow.remove());
  fxLayer.appendChild(glow);
}

function playWinFill() {
  const rect = yesBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const far = Math.max(
    Math.hypot(cx, cy),
    Math.hypot(window.innerWidth - cx, cy),
    Math.hypot(cx, window.innerHeight - cy),
    Math.hypot(window.innerWidth - cx, window.innerHeight - cy),
  );
  const scale = (far * 2) / 44 + 1;

  const fill = document.createElement("span");
  fill.className = "win-fill";
  fill.style.left = cx + "px";
  fill.style.top = cy + "px";
  fill.style.setProperty("--fill-scale", scale.toFixed(2));
  fill.addEventListener("animationend", () => fill.remove());
  fxLayer.appendChild(fill);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));

  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 450);
  }, 3400);
}

function clearFx() {
  if (fxLayer) fxLayer.innerHTML = "";
}

let musicAudio = null;
let musicSoundOn = false;
let musicGestureArmed = false;
let musicHintShown = false;
let musicBroken = false;

function musicEventsRemove(handler) {
  ["pointerdown", "touchstart", "touchend", "click", "keydown"].forEach((t) =>
    document.removeEventListener(t, handler, true),
  );
}

function musicEventsAdd(handler) {
  ["pointerdown", "touchstart", "touchend", "click", "keydown"].forEach((t) =>
    document.addEventListener(t, handler, true),
  );
}

function playOnce() {
  if (!musicAudio) return Promise.resolve(false);
  return musicAudio.play().then(
    () => true,
    () => false,
  );
}

function enableSound() {
  if (!musicAudio || musicBroken) return Promise.resolve(false);
  musicAudio.muted = false;
  musicAudio.volume = MUSIC_VOLUME;
  if (musicAudio.readyState === 0) musicAudio.load();
  return playOnce().then((ok) => {
    if (ok) {
      musicSoundOn = true;
      return true;
    }
    musicAudio.src = MUSIC_URL;
    musicAudio.load();
    return playOnce().then((ok2) => {
      if (ok2) musicSoundOn = true;
      return ok2;
    });
  });
}

function armMusicUnlock() {
  if (musicGestureArmed || !MUSIC_URL || musicBroken) return;
  musicGestureArmed = true;

  const onGesture = () => {
    musicEventsRemove(onGesture);
    enableSound().then((ok) => {
      if (!ok) {
        musicGestureArmed = false;
        armMusicUnlock();
        if (!musicHintShown) {
          musicHintShown = true;
          showToast("Нажми на экран, чтобы включить музыку 🔊");
        }
      }
    });
  };

  musicEventsAdd(onGesture);
}

function startMusic() {
  if (!musicAudio || musicBroken) return;
  playOnce().then((ok) => {
    if (ok) {
      musicSoundOn = true;
      return;
    }
    if (!musicAudio || musicBroken) return;
    musicAudio.muted = true;
    playOnce().then(() => {
      armMusicUnlock();
    });
  });
}

function setupMusic() {
  if (!MUSIC_URL) return;

  musicAudio = new Audio(MUSIC_URL);
  musicAudio.loop = true;
  musicAudio.volume = MUSIC_VOLUME;
  musicAudio.preload = "auto";
  musicAudio.load();

  musicAudio.addEventListener("error", () => {
    musicBroken = true;
    musicAudio = null;
  });

  startMusic();
}

function handleResize() {
  if (!noEscaped || currentScreen !== "question") return;
  const rect = noBtn.getBoundingClientRect();
  const pad = 8;
  const x = Math.min(
    Math.max(pad, rect.left),
    Math.max(pad, window.innerWidth - rect.width - pad),
  );
  const y = Math.min(
    Math.max(pad, rect.top),
    Math.max(pad, window.innerHeight - rect.height - pad),
  );
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

function init() {
  startBackground();
  setupTelegram();
  setupMusic();

  envelopeBtn.addEventListener("click", openEnvelope);

  skipTypingBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    skipTyping();
  });
  finishLetterBtn.addEventListener("click", () => {
    stopTyping();
    showScreen("question");
    resetQuestion();
  });
  letterEl.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    skipTyping();
  });

  yesBtn.addEventListener("click", onYesClick);
  heartEl.addEventListener("click", onHeartClick);
  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    escapeNo(null, null);
  });
  noBtn.addEventListener("touchstart", onNoTouch, { passive: false });
  document.addEventListener("pointermove", onPointerMove, { passive: true });

  telegramBtn.addEventListener("click", onTelegramClick);
  restartBtn.addEventListener("click", restartExperience);

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", () =>
    window.setTimeout(handleResize, 220),
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
