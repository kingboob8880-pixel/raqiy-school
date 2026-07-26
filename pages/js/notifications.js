// Уведомления ученику на сайте (запрос автора, 2026-07-25).
//
// Зачем: раньше ученик узнавал о происходящем случайно. Ответ наставника
// обнаруживался при заходе в кабинет, а про открытый доступ, выданный
// сертификат и RUKYA Pro не сообщалось вообще — человек просто однажды
// замечал, что появилась новая кнопка.
//
// Уведомления создаёт сервер (functions/index.js), клиент только читает —
// правила Firestore запрещают запись с клиента, иначе ученик мог бы
// подделать себе «доступ открыт».
//
// Два способа показа, оба по решению автора:
//   • колокольчик в шапке — виден на любой странице, включая чтение книги,
//     хранит историю последних уведомлений;
//   • плашка в углу — только для важного (доступ, сертификат, RUKYA Pro).
//     Для каждого сообщения в чате плашку не показываем: при живой
//     переписке она выскакивала бы поверх текста каждые полминуты.
import { withBase } from "./base-path.js?v=6";
import { t, getLang } from "./i18n.js?v=21";
import { watchNotifications, markNotificationRead, markAllNotificationsRead } from "../../integration/firestore.js?v=22";

const ICONS = {
  message: "💬",
  paid: "🔓",
  certificate: "🎓",
  rukyaPro: "📥",
};

// Плашкой показываем только события доступа — то, ради чего стоит
// прервать чтение. Сообщения копятся в колокольчике.
const TOAST_TYPES = new Set(["paid", "certificate", "rukyaPro"]);

// Какие уведомления уже показывались плашкой — иначе при каждом переходе
// по страницам одно и то же всплывало бы заново. Живёт на устройстве:
// показать плашку повторно на другом телефоне — не беда, а вот гонять
// эту отметку в Firestore ради неё одной незачем.
const SEEN_KEY = "rp-toast-seen";

function seenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); }
  catch { return new Set(); }
}

function markSeen(id) {
  try {
    const all = [...seenIds(), id].slice(-40); // не растим список бесконечно
    localStorage.setItem(SEEN_KEY, JSON.stringify(all));
  } catch { /* приватный режим — покажем ещё раз, не страшно */ }
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Относительное время: «только что», «5 мин», «вчера». Точная дата в
 *  ленте уведомлений не нужна — важна свежесть. */
function ago(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  if (!d) return "";
  const sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (sec < 60) return t("notif.now");
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${t("notif.min")}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${t("notif.hour")}`;
  const day = Math.floor(hr / 24);
  if (day === 1) return t("notif.yesterday");
  if (day < 7) return `${day} ${t("notif.day")}`;
  const locale = getLang() === "uz" ? "uz-UZ" : getLang() === "en" ? "en-US" : "ru-RU";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

let unwatch = null;
let items = [];
let panelOpen = false;

/** Монтирует колокольчик в шапку и подписывается на уведомления.
 *  Вызывается из layout.js после определения пользователя. */
export function initNotifications(container, uid) {
  stopNotifications();
  if (!container || !uid) return;

  container.innerHTML = `
    <button type="button" class="notif-bell" id="notif-bell"
            aria-label="${esc(t("notif.title"))}" aria-expanded="false" aria-haspopup="true">
      <span aria-hidden="true">🔔</span>
      <span class="notif-bell__badge" id="notif-badge" hidden></span>
    </button>
    <div class="notif-panel" id="notif-panel" role="dialog" aria-label="${esc(t("notif.title"))}" hidden>
      <div class="notif-panel__head">
        <span class="notif-panel__title">${esc(t("notif.title"))}</span>
        <button type="button" class="notif-panel__all" id="notif-mark-all" hidden>${esc(t("notif.markAll"))}</button>
      </div>
      <div class="notif-panel__list" id="notif-list"></div>
    </div>`;

  const bell = container.querySelector("#notif-bell");
  const panel = container.querySelector("#notif-panel");
  const badge = container.querySelector("#notif-badge");
  const list = container.querySelector("#notif-list");
  const markAllBtn = container.querySelector("#notif-mark-all");

  const closePanel = () => {
    panelOpen = false;
    panel.hidden = true;
    bell.setAttribute("aria-expanded", "false");
  };
  const openPanel = () => {
    panelOpen = true;
    panel.hidden = false;
    bell.setAttribute("aria-expanded", "true");
  };

  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    panelOpen ? closePanel() : openPanel();
  });
  document.addEventListener("click", (e) => {
    if (panelOpen && !container.contains(e.target)) closePanel();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panelOpen) closePanel(); });

  markAllBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    try { await markAllNotificationsRead(uid); } catch (err) { console.warn(err); }
  });

  // Клик по уведомлению: помечаем прочитанным и уводим по ссылке. Отметку
  // не ждём — переход не должен упираться в запись в базу.
  list.addEventListener("click", (e) => {
    const el = e.target.closest(".notif-item");
    if (!el) return;
    const { id, link } = el.dataset;
    if (id) markNotificationRead(uid, id).catch((err) => console.warn(err));
    if (link) location.href = withBase(link);
    else closePanel();
  });

  function render() {
    const unread = items.filter((n) => !n.read).length;
    badge.textContent = unread > 9 ? "9+" : String(unread);
    badge.hidden = unread === 0;
    bell.classList.toggle("has-unread", unread > 0);
    markAllBtn.hidden = unread === 0;

    if (!items.length) {
      list.innerHTML = `<p class="notif-empty">${esc(t("notif.empty"))}</p>`;
      return;
    }
    list.innerHTML = items.map((n) => `
      <button type="button" class="notif-item${n.read ? "" : " is-unread"}"
              data-id="${esc(n.id)}" ${n.link ? `data-link="${esc(n.link)}"` : ""}>
        <span class="notif-item__icon" aria-hidden="true">${ICONS[n.type] || "🔔"}</span>
        <span class="notif-item__body">
          <span class="notif-item__title">${esc(n.title || "")}</span>
          ${n.body ? `<span class="notif-item__text">${esc(n.body)}</span>` : ""}
          <span class="notif-item__time">${esc(ago(n.createdAt))}</span>
        </span>
      </button>`).join("");
  }

  unwatch = watchNotifications(uid, (list_) => {
    items = list_;
    render();
    maybeToast(items);
  }, () => { /* нет доступа или сети — колокольчик просто пуст */ });

  render();
}

export function stopNotifications() {
  if (unwatch) { unwatch(); unwatch = null; }
  items = [];
  panelOpen = false;
}

/** Плашка для важного. Показываем только непрочитанное, только событий
 *  доступа и только один раз на устройство. */
function maybeToast(list) {
  const seen = seenIds();
  const fresh = list.find((n) => !n.read && TOAST_TYPES.has(n.type) && !seen.has(n.id));
  if (!fresh) return;
  markSeen(fresh.id);
  showNotifToast(fresh);
}

function showNotifToast(n) {
  const el = document.createElement("div");
  el.className = "notif-toast";
  el.setAttribute("role", "status");
  el.innerHTML = `
    <span class="notif-toast__icon" aria-hidden="true">${ICONS[n.type] || "🔔"}</span>
    <span class="notif-toast__body">
      <span class="notif-toast__title">${esc(n.title || "")}</span>
      ${n.body ? `<span class="notif-toast__text">${esc(n.body)}</span>` : ""}
      ${n.link ? `<a class="notif-toast__link" href="${withBase(n.link)}">${esc(t("notif.open"))}</a>` : ""}
    </span>
    <button type="button" class="notif-toast__close" aria-label="${esc(t("common.close"))}">×</button>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-visible"));

  const close = () => {
    el.classList.remove("is-visible");
    setTimeout(() => el.remove(), 250);
  };
  el.querySelector(".notif-toast__close").addEventListener("click", close);
  // Держим дольше обычного тоста: это не «сохранено», а событие, ради
  // которого человек, возможно, ждал неделю.
  setTimeout(close, 12000);
}
