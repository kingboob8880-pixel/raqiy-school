// Модалка «что внутри модуля» (запрос автора, 2026-07-26).
//
// Зачем: закрытый модуль на «Пути ученика» до сих пор был мёртвым замком —
// у карточки стоит pointer-events: none, и клик по ней не делал ничего.
// Человек видел одиннадцать запертых дверей и не знал, что за ними.
//
// Почему открытые модули она НЕ перехватывает: ученик, нажавший на
// доступный модуль, уже решил заняться делом — вставать между ним и
// уроками с рекламной паузой значит мешать. Хвалить модуль перед тем, кто
// его и так открывает, поздно, а на пятый раз такую модалку начинают
// прокликивать не читая. Для открытых модулей есть отдельная кнопка
// «Что внутри» — по желанию, а не поперёк дороги.
//
// Тексты — pages/js/module-intro-data.js, подписи — i18n.js.
import { t, getLang, moduleTitle, localLevel } from "./i18n.js?v=19";
import { withBase } from "./base-path.js?v=6";
import { moduleIntro } from "./module-intro-data.js?v=1";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

let overlay = null;
let lastFocused = null;

export function closeModuleIntro() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  document.body.style.overflow = "";
  // Возвращаем фокус туда, откуда открыли: иначе после закрытия он падает
  // в начало страницы, и человек с клавиатуры теряет своё место в списке.
  if (lastFocused?.focus) lastFocused.focus();
  lastFocused = null;
}

/** Строка «Внутри: N книг · экзамен по каждой». У Модуля 11 уроков нет
 *  вовсе (это работа в программе), поэтому строку там не показываем — иначе
 *  получилось бы «0 книг», что выглядит как поломка, а не как замысел. */
function contentsLine(mod, delay) {
  const n = mod.lessons?.length || 0;
  if (!n) return "";
  return `<p class="mintro__contents mintro__rise" style="--d:${delay}ms">${esc(t("intro.contains"))}: <strong>${n}</strong> ${esc(t("intro.books"))} · ${esc(t("intro.examEach"))}</p>`;
}

/**
 * Открывает модалку модуля.
 *   mod        — объект модуля из modules-data.js
 *   opts.locked      — модуль ещё закрыт
 *   opts.requiredId  — какой модуль нужно сдать, чтобы открыть этот
 *   opts.trigger     — элемент, с которого открыли (для возврата фокуса)
 */
export function openModuleIntro(mod, opts = {}) {
  closeModuleIntro();
  const { locked = false, requiredId = null, trigger = null } = opts;
  const intro = moduleIntro(mod.id, getLang());
  if (!intro) return;

  lastFocused = trigger || document.activeElement;

  // Адрес обложки считаем один раз: он подставляется дважды — в саму
  // обложку и в размытый фон позади неё.
  const cover = mod.cover ? esc(withBase(mod.cover)) : "";

  overlay = document.createElement("div");
  overlay.className = "mintro-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", moduleTitle(mod));

  const cta = locked
    ? `<div class="mintro__gate">
         <p class="mintro__gate-text">🔒 ${esc(t("intro.opensAfter"))} ${esc(t("module.n"))} ${requiredId}</p>
         <a class="btn btn-primary" href="module.html?id=${requiredId}">${esc(t("intro.goRequired"))} ${esc(t("module.n"))} ${requiredId} →</a>
       </div>`
    : `<a class="btn btn-primary mintro__open" href="module.html?id=${mod.id}">${esc(t("intro.open"))} →</a>`;

  overlay.innerHTML = `
    <div class="mintro">
      <button type="button" class="mintro__close" aria-label="${esc(t("common.close"))}">×</button>

      <div class="mintro__hero">
        ${cover ? `<img class="mintro__hero-bg" src="${cover}" alt="" aria-hidden="true">` : ""}
        <div class="mintro__hero-veil"></div>
        <div class="mintro__hero-inner">
          ${cover ? `<span class="mintro__hero-cover"><img src="${cover}" alt=""></span>` : ""}
          <span class="mintro__hero-text">
            <span class="mintro__eyebrow">${esc(t("module.n"))} ${mod.id} · ${esc(localLevel(mod.level))}</span>
            <h2 class="mintro__title">${esc(moduleTitle(mod))}</h2>
          </span>
        </div>
      </div>

      <div class="mintro__body">
        <p class="mintro__hook mintro__rise" style="--d:0ms">${esc(intro.hook)}</p>

        <h3 class="mintro__h mintro__rise" style="--d:80ms">${esc(t("intro.learn"))}</h3>
        <ul class="mintro__list">
          ${intro.learn.map((li, i) => `<li class="mintro__rise" style="--d:${120 + i * 70}ms">${esc(li)}</li>`).join("")}
        </ul>

        <div class="mintro__after mintro__rise" style="--d:${140 + intro.learn.length * 70}ms">
          <span class="mintro__after-label">${esc(t("intro.after"))}</span>
          <p class="mintro__after-text">${esc(intro.after)}</p>
        </div>

        ${contentsLine(mod, 200 + intro.learn.length * 70)}
      </div>

      <div class="mintro__foot">${cta}</div>
    </div>`;

  document.body.appendChild(overlay);
  // Фон не должен прокручиваться под открытой модалкой — иначе на телефоне
  // палец «проваливается» на список модулей вместо текста модалки.
  document.body.style.overflow = "hidden";

  overlay.querySelector(".mintro__close").addEventListener("click", closeModuleIntro);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModuleIntro(); });
  document.addEventListener("keydown", onKey);

  overlay.querySelector(".mintro__close").focus();
}

function onKey(e) {
  if (!overlay) { document.removeEventListener("keydown", onKey); return; }
  if (e.key === "Escape") { closeModuleIntro(); document.removeEventListener("keydown", onKey); return; }
  // Замыкаем Tab внутри модалки: без этого фокус уходит на карточки под ней,
  // и человек с клавиатуры «печатает вслепую» по скрытой странице.
  if (e.key !== "Tab") return;
  const items = overlay.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])");
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
