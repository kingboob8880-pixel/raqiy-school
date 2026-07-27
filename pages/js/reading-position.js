// Запоминание места чтения внутри книги/модуля.
//
// Зачем: прогресс отмечался только по книгам целиком — «прочитана / не
// прочитана». У книги на 3000 слов это значит, что закрыл на середине —
// ищи место заново глазами. Закладки есть, но их надо ставить руками,
// а человек просто закрывает вкладку (совет по улучшениям, 2026-07-25).
//
// Почему localStorage, а не Firestore: позиция прокрутки — вещь одноразовая
// и привязанная к устройству (на телефоне и на ПК одна и та же книга
// прокручена по-разному, ширина экрана другая). Гонять её в базу на каждый
// скролл — лишние записи и лишние деньги за Firestore, а пользы ноль.
// Прогресс и закладки, которые важны между устройствами, как и раньше
// живут в Firestore.
//
// Почему не прыгаем автоматически: беззвучный прыжок на середину страницы
// дезориентирует — человек открыл книгу и не понимает, куда его унесло и
// почему он не видит начала. Поэтому предлагаем вернуться кнопкой, а
// решение оставляем за ним.
import { t } from "./i18n.js?v=30";

const KEY_PREFIX = "rp-read-pos:";
const MAX_ENTRIES = 60;      // чтобы localStorage не разрастался без предела
const MIN_SAVE_RATIO = 0.06; // ближе к началу запоминать нечего
const MAX_SAVE_RATIO = 0.94; // дочитал до конца — предлагать «продолжить» глупо

function storeKey(docId) { return KEY_PREFIX + docId; }

function readAll() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) out.push(k);
    }
  } catch { /* приватный режим — localStorage недоступен */ }
  return out;
}

/** Подчищаем самые старые записи, если их стало слишком много. */
function prune() {
  const keys = readAll();
  if (keys.length <= MAX_ENTRIES) return;
  const items = keys.map((k) => {
    let at = 0;
    try { at = JSON.parse(localStorage.getItem(k))?.at || 0; } catch { /* битая запись */ }
    return { k, at };
  }).sort((a, b) => a.at - b.at);
  for (const it of items.slice(0, items.length - MAX_ENTRIES)) {
    try { localStorage.removeItem(it.k); } catch { /* игнор */ }
  }
}

export function savePosition(docId, ratio) {
  if (!docId) return;
  try {
    if (ratio < MIN_SAVE_RATIO || ratio > MAX_SAVE_RATIO) {
      localStorage.removeItem(storeKey(docId));
      return;
    }
    localStorage.setItem(storeKey(docId), JSON.stringify({ r: ratio, at: Date.now() }));
    prune();
  } catch { /* переполнение или приватный режим — молча пропускаем */ }
}

export function loadPosition(docId) {
  if (!docId) return null;
  try {
    const raw = localStorage.getItem(storeKey(docId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data?.r === "number" ? data.r : null;
  } catch { return null; }
}

export function clearPosition(docId) {
  try { localStorage.removeItem(storeKey(docId)); } catch { /* игнор */ }
}

/** Доля прочитанного = насколько прокручен именно текст, а не вся страница:
 *  у страницы есть шапка, подвал и блоки после текста, и считать по
 *  document.body значило бы «дочитал» задолго до конца книги. */
function currentRatio(bodyEl) {
  const rect = bodyEl.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const readable = Math.max(1, bodyEl.offsetHeight - window.innerHeight * 0.5);
  return Math.min(1, Math.max(0, (window.scrollY - top) / readable));
}

/**
 * Подключает запоминание позиции и, если есть сохранённая, показывает
 * ненавязчивое предложение продолжить.
 *   container — элемент с .doc-body внутри
 *   docId     — стабильный ключ документа (bookKey(doc) или "module-N")
 */
export function setupReadingPosition(container, docId) {
  const bodyEl = container?.querySelector(".doc-body");
  if (!bodyEl || !docId || bodyEl.dataset.posTracked) return;
  bodyEl.dataset.posTracked = "1";

  // Короткий текст целиком виден без прокрутки — запоминать нечего.
  if (bodyEl.offsetHeight < window.innerHeight * 1.5) return;

  const saved = loadPosition(docId);

  let raf = null;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      savePosition(docId, currentRatio(bodyEl));
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  // Сохраняем и при уходе со страницы: последний кадр скролла мог не успеть.
  window.addEventListener("pagehide", () => savePosition(docId, currentRatio(bodyEl)));

  if (saved === null) return;

  const goTo = () => {
    const rect = bodyEl.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const readable = Math.max(1, bodyEl.offsetHeight - window.innerHeight * 0.5);
    window.scrollTo({ top: top + saved * readable, behavior: "smooth" });
  };

  const bar = document.createElement("div");
  bar.className = "resume-bar";
  bar.innerHTML = `
    <span class="resume-bar__text">${t("read.resumeText")} ${Math.round(saved * 100)}%</span>
    <button type="button" class="btn btn-primary btn-sm" data-resume>${t("read.resumeGo")}</button>
    <button type="button" class="resume-bar__close" aria-label="${t("common.close")}">×</button>
  `;
  container.prepend(bar);

  bar.querySelector("[data-resume]").addEventListener("click", () => { bar.remove(); goTo(); });
  bar.querySelector(".resume-bar__close").addEventListener("click", () => {
    bar.remove();
    // Закрыл предложение — значит хочет читать сначала; старую метку
    // держать незачем, иначе она всплывёт снова при следующем заходе.
    clearPosition(docId);
  });
}
