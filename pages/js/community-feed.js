// Лента достижений учеников (запрос автора «пусть будет автоматом»,
// 2026-07-26).
//
// Зачем: ученик проходит курс в одиночку и не видит, что рядом кто-то
// доходит до конца. Автор хотел показывать это для мотивации — и решил, что
// записи должны появляться сами, без ручной публикации.
//
// Откуда берутся записи: их пишет сервер (functions/index.js) по реальному
// прогрессу — сданный экзамен, отмеченная практика, сертификат, доступ к
// RUKYA Pro. Клиенту запись запрещена правилами Firestore, иначе в общей
// ленте можно было бы опубликовать что угодно от чужого имени.
//
// Что здесь решается:
//
// 1. Текст собирается на клиенте из ключей i18n, а не берётся из базы. В
//    базе лежат только вид события, имя и номер модуля. Если бы сервер
//    писал готовую строку, лента на английской и узбекской версиях сайта
//    навсегда осталась бы русской — переводить задним числом уже
//    сохранённые строки невозможно.
//
// 2. Свои записи ученик в ленте не видит. «Ты сдал экзамен Модуля 3» в
//    ленте про других ничего не мотивирует, а место занимает.
//
// 3. Показываем по одной записи и меняем их по кругу, а не выводим список.
//    Список из сорока чужих успехов давит вместо того, чтобы подбадривать,
//    и оттесняет вниз то, ради чего ученик открыл кабинет.
import { t, getLang } from "./i18n.js?v=22";
import { watchFeed } from "../../integration/firestore.js?v=22";

const ROTATE_MS = 7000;

// Иконка по виду события — тот же визуальный язык, что у колокольчика
// уведомлений (notifications.js).
const ICONS = {
  module: "✅",       // ✅ сдал экзамен
  practice: "\u{1F3CB}",  // 🏋 практика
  answered: "\u{1F932}",  // 🤲 Аллах ответил
  graduate: "\u{1F393}",  // 🎓 прошёл все модули
  certificate: "\u{1F4DC}", // 📜 сертификат
  rukyaPro: "\u{1F4E5}",  // 📥 доступ к программе
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Собирает текст записи. Имя экранируем до подстановки: оно приходит из
 *  профиля ученика, то есть его набирал человек, а не система. */
function entryText(e) {
  const tpl = t("feed." + e.kind);
  if (!tpl || tpl === "feed." + e.kind) return null; // неизвестный вид — пропускаем
  return tpl
    .replace("{name}", esc(e.firstName || ""))
    .replace("{n}", String(e.moduleId ?? ""));
}

function ago(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  if (!d) return "";
  const sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (sec < 3600) return t("notif.now");
  const hr = Math.floor(sec / 3600);
  if (hr < 24) return `${hr} ${t("notif.hour")}`;
  const day = Math.floor(hr / 24);
  if (day === 1) return t("notif.yesterday");
  if (day < 7) return `${day} ${t("notif.day")}`;
  const locale = getLang() === "uz" ? "uz-UZ" : getLang() === "en" ? "en-US" : "ru-RU";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

let unwatch = null;
let timer = null;

/** Монтирует ленту в контейнер.
 *  container — пустой элемент на странице
 *  selfUid   — uid текущего ученика, чтобы не показывать ему его же записи */
export function initCommunityFeed(container, selfUid) {
  stopCommunityFeed();
  if (!container) return;

  container.innerHTML = `
    <section class="feed" hidden>
      <div class="feed__head">
        <span class="feed__title">${esc(t("feed.title"))}</span>
        <div class="feed__dots" id="feed-dots" aria-hidden="true"></div>
      </div>
      <div class="feed__body" id="feed-body" role="status" aria-live="polite"></div>
      <p class="feed__note">${esc(t("feed.note"))}</p>
    </section>`;

  const root = container.querySelector(".feed");
  const body = container.querySelector("#feed-body");
  const dots = container.querySelector("#feed-dots");

  let entries = [];
  let idx = 0;
  // Пауза при наведении: иначе запись успевает смениться ровно в тот момент,
  // когда её начали читать.
  let paused = false;
  root.addEventListener("mouseenter", () => { paused = true; });
  root.addEventListener("mouseleave", () => { paused = false; });

  function draw() {
    const e = entries[idx];
    if (!e) return;
    const text = entryText(e);
    if (!text) return;
    body.innerHTML = `
      <div class="feed__item feed__item--${esc(e.kind)}">
        <span class="feed__icon" aria-hidden="true">${ICONS[e.kind] || "✨"}</span>
        <span class="feed__text">${text}</span>
        <span class="feed__time">${esc(ago(e.createdAt))}</span>
      </div>`;
    // Точки-индикаторы рисуем только когда записей немного: двадцать точек
    // превращаются в шум и всё равно ничего не подсказывают.
    dots.innerHTML = entries.length > 1 && entries.length <= 8
      ? entries.map((_, i) => `<span class="feed__dot${i === idx ? " is-on" : ""}"></span>`).join("")
      : "";
  }

  function start() {
    clearInterval(timer);
    if (entries.length < 2) return;
    timer = setInterval(() => {
      if (paused) return;
      idx = (idx + 1) % entries.length;
      draw();
    }, ROTATE_MS);
  }

  unwatch = watchFeed((list) => {
    entries = list.filter((e) => e.uid !== selfUid && entryText(e));
    if (!entries.length) {
      // Пустую ленту не показываем вовсе: рамка с «пока никого» в первый же
      // день обучения работает против мотивации, а не на неё.
      root.hidden = true;
      clearInterval(timer);
      return;
    }
    root.hidden = false;
    if (idx >= entries.length) idx = 0;
    draw();
    start();
  }, () => {
    // Нет прав или нет сети — просто не показываем блок. Лента
    // необязательна, из-за неё кабинет ломаться не должен.
    root.hidden = true;
  });
}

export function stopCommunityFeed() {
  if (unwatch) { unwatch(); unwatch = null; }
  clearInterval(timer);
  timer = null;
}
