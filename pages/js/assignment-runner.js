// Окно упражнения — то место, где упражнение действительно проводят.
//
// Решение автора 2026-07-27. До этого карточка задания только ОПИСЫВАЛА
// упражнение: «зарядите намерение сорока повторениями и прочитайте Аят
// аль-Курси, не отпуская намерение». Что человек делает дальше, не знал
// никто — он закрывал вкладку и выполнял это где-то у себя, без порядка,
// без счёта и без записи. Кнопка «Выполнил» в конце получалась
// формальной: нажал — и всё.
//
// Здесь четыре части, и каждая закрывает свою дыру:
//
//   Шаги      — описание превращается в последовательность, которую видно
//               перед глазами во время выполнения.
//   Счётчик   — держать число в уме мешает удерживать намерение, а
//               удержание намерения и есть суть упражнения. Считает
//               кнопка, ученик считает только сердцем.
//   Сетка дней— «десять дней подряд без пропуска» и «сделал один раз»
//               выглядели в базе одинаково. Теперь видно и серию, и место
//               срыва: пропустил — клетки гаснут.
//   Наблюдения— без записей практика через месяц превращается в туман, и
//               ученик не видит собственной динамики.
//
// Без входа окно работает целиком, но ничего не сохраняет: гость и админ
// должны видеть упражнение как оно есть, а не пустое место.
import { t } from "./i18n.js?v=35";
import { withBase } from "./base-path.js?v=6";
import {
  logAssignmentDay, unlogAssignmentDay, saveAssignmentNote, saveAssignmentState,
  markAssignmentDone, unmarkAssignmentDone,
} from "../../integration/firestore.js?v=28";

const ICONS = { reflection: "\u{1F4DD}", practice: "\u{1F3CB}", daily: "\u{1F4C5}" };

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function todayKey(shift = 0) {
  const d = new Date();
  if (shift) d.setDate(d.getDate() + shift);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Длина серии — сколько дней подряд отмечено, считая назад от сегодня.
 *  Считаем от вчера, если сегодня ещё не отмечено: иначе серия обнулялась
 *  бы каждое утро до того, как человек успел сделать упражнение. */
function streakOf(days) {
  const set = new Set(days || []);
  if (!set.size) return 0;
  let shift = set.has(todayKey()) ? 0 : (set.has(todayKey(-1)) ? -1 : null);
  if (shift === null) return 0;
  let n = 0;
  while (set.has(todayKey(shift))) { n += 1; shift -= 1; }
  return n;
}

let overlay = null;
let lastFocused = null;
let ctx = null;      // { a, uid, moduleId, progress, onChange }
let S = null;        // локальное состояние окна
let saveTimer = null;

/** Открыть окно.
 *  a    — запись задания из assignments-data.js
 *  opts — { uid, moduleId, progress, onChange } */
export function openAssignment(a, opts = {}) {
  if (!a) return;
  closeAssignment();

  const moduleId = opts.moduleId ?? a.moduleId ?? null;
  const log = opts.progress?.[moduleId]?.log?.[a.id] || {};
  ctx = { a, uid: opts.uid || null, moduleId, progress: opts.progress || {}, onChange: opts.onChange || null };
  S = {
    step: Number(log.step || 0),
    count: Number(log.count || 0),
    target: Number(log.target || a.counter?.targets?.[0] || 0),
    days: Array.isArray(log.days) ? [...log.days] : [],
    notes: Array.isArray(log.notes) ? [...log.notes] : [],
  };

  lastFocused = document.activeElement;
  overlay = document.createElement("div");
  overlay.className = "arun-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", a.title);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  render();

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAssignment();
  });
  overlay.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  overlay.querySelector(".arun__close")?.focus();
}

export function closeAssignment() {
  if (!overlay) return;
  flushState();
  document.removeEventListener("keydown", onKey);
  overlay.remove();
  overlay = null;
  document.body.style.overflow = "";
  const cb = ctx?.onChange;
  ctx = null; S = null;
  if (cb) cb();
  lastFocused?.focus?.();
  lastFocused = null;
}

function onKey(e) {
  if (!overlay) { document.removeEventListener("keydown", onKey); return; }
  if (e.key === "Escape") { closeAssignment(); return; }
  // Замыкаем Tab внутри окна: иначе фокус уходит на страницу под ним и
  // человек с клавиатуры нажимает вслепую по скрытому списку.
  if (e.key !== "Tab") return;
  const items = [...overlay.querySelectorAll("button, a[href], textarea, [tabindex]:not([tabindex='-1'])")]
    .filter((el) => !el.disabled && el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// ---------------------------------------------------------------- разметка

function render() {
  const { a, uid } = ctx;
  // Недописанное наблюдение переживает перерисовку. Без этого человек,
  // который начал писать и по ходу отметил шаг, терял текст — и второй раз
  // уже не писал.
  const draft = overlay.querySelector("#arun-note")?.value || "";
  const done = new Set(ctx.progress?.[ctx.moduleId]?.doneAssignments || []).has(a.id);
  const answered = new Set(ctx.progress?.[ctx.moduleId]?.answeredAssignments || []).has(a.id);

  overlay.innerHTML = `
    <div class="arun">
      <button type="button" class="arun__close" data-close aria-label="${esc(t("common.close"))}">×</button>

      <header class="arun__head">
        <span class="arun__eyebrow">
          <span aria-hidden="true">${ICONS[a.type] || ICONS.reflection}</span>
          ${esc(t("assign." + a.type))}${ctx.moduleId ? ` · ${esc(t("module.n"))} ${ctx.moduleId}` : ""}
        </span>
        <h2 class="arun__title">${esc(a.title)}</h2>
        <p class="arun__desc">${esc(a.description)}</p>
      </header>

      <div class="arun__body">
        ${intentHtml(a)}
        ${stepsHtml(a)}
        ${counterHtml(a)}
        ${daysHtml(a)}
        ${checkHtml(a)}
        ${notesHtml()}
      </div>

      <footer class="arun__foot">
        ${!uid ? `<p class="arun__guest">${esc(t("runner.guest"))}</p>` : ""}
        ${uid ? (done
          ? `<span class="arun__done">✓ ${esc(t("assign.isDone"))}</span>
             <button type="button" class="btn btn-ghost btn-sm" data-undo>${esc(t("assign.undo"))}</button>`
          : `<button type="button" class="btn btn-primary" data-done>${esc(t("assign.markDone"))}</button>`) : ""}
        <button type="button" class="btn btn-outline btn-sm" data-close>${esc(t("common.close"))}</button>
      </footer>

      ${uid && done && a.type === "practice" && !answered ? `
        <div class="arun__ask">
          <p class="arun__ask-q">${esc(t("assign.answeredQ"))}</p>
          <div class="arun__ask-btns">
            <button type="button" class="btn btn-primary btn-sm" data-answered>${esc(t("assign.answeredYes"))}</button>
            <button type="button" class="btn btn-ghost btn-sm" data-close>${esc(t("assign.answeredWait"))}</button>
          </div>
        </div>` : ""}
    </div>`;

  const ta = overlay.querySelector("#arun-note");
  if (ta && draft) ta.value = draft;
}

/** Намерение к этому упражнению — первым блоком, до шагов.
 *
 *  Запрос автора 2026-07-27: «в модулях и в упражнениях говорится о
 *  намерении, но о каком — не написано». Ученик читал «зарядите
 *  намерение», закрывал книгу и придумывал формулировку сам. Здесь она
 *  готовая, по каркасу «Волевого акта», и стоит ПЕРВОЙ: намерение
 *  формулируют до действия, а не вспоминают в середине.
 *
 *  Квадратные скобки в тексте оставлены намеренно — их заполняет ученик.
 *  Имя и место это второй и восьмой компоненты; подставить их за него
 *  нельзя, а без них намерение пустое. */
function intentHtml(a) {
  if (!a.intent) return "";
  return `
    <section class="arun__block arun__block--intent">
      <h3 class="arun__h">${esc(t("runner.intent"))}</h3>
      <p class="arun__intent">${esc(a.intent)}</p>
      <p class="arun__note-hint">${esc(t("runner.intentHint"))}
        <a href="${withBase("/pages/book.html")}?doc=${encodeURIComponent("/content/reference/niyat.md")}">${esc(t("runner.intentAll"))}</a>
      </p>
    </section>`;
}

function stepsHtml(a) {
  if (!a.steps?.length) return "";
  return `
    <section class="arun__block">
      <h3 class="arun__h">${esc(t("runner.steps"))}
        <span class="arun__h-note">${esc(t("runner.stepOf")).replace("{n}", S.step).replace("{m}", a.steps.length)}</span>
      </h3>
      <ol class="arun-steps">
        ${a.steps.map((s, i) => `
          <li class="arun-step${i < S.step ? " is-done" : ""}${i === S.step ? " is-now" : ""}">
            <button type="button" class="arun-step__btn" data-step="${i}">
              <span class="arun-step__num" aria-hidden="true">${i < S.step ? "✓" : i + 1}</span>
              <span class="arun-step__text">${esc(s)}</span>
            </button>
          </li>`).join("")}
      </ol>
      ${S.step >= a.steps.length ? `<p class="arun__all-steps">${esc(t("runner.allSteps"))}</p>` : ""}
    </section>`;
}

function counterHtml(a) {
  if (!a.counter) return "";
  const targets = a.counter.targets || [];
  const target = S.target || targets[0] || 0;
  const pct = target ? Math.min(100, Math.round((S.count / target) * 100)) : 0;
  return `
    <section class="arun__block arun__block--counter">
      <h3 class="arun__h">${esc(a.counter.label)}</h3>
      ${targets.length > 1 ? `
        <div class="arun-targets" role="group" aria-label="${esc(t("runner.target"))}">
          ${targets.map((n) => `<button type="button" class="arun-target${n === target ? " is-on" : ""}" data-target="${n}">${n}</button>`).join("")}
        </div>` : ""}
      <button type="button" class="arun-count" data-tick>
        <span class="arun-count__n">${S.count}</span>
        <span class="arun-count__of">${target ? `/ ${target}` : ""}</span>
        <span class="arun-count__hint">${esc(t("runner.tap"))}</span>
      </button>
      <div class="arun-count__bar"><span style="width:${pct}%"></span></div>
      <div class="arun-count__ctrls">
        <button type="button" class="arun-count__minor" data-untick>−1</button>
        <button type="button" class="arun-count__minor" data-reset>${esc(t("runner.reset"))}</button>
      </div>
    </section>`;
}

function daysHtml(a) {
  if (!a.days) return "";
  const streak = streakOf(S.days);
  const markedToday = S.days.includes(todayKey());
  return `
    <section class="arun__block">
      <h3 class="arun__h">${esc(t("runner.days"))}
        <span class="arun__h-note">${esc(t("runner.streak"))}: ${streak} / ${a.days}</span>
      </h3>
      <div class="arun-days" aria-hidden="true">
        ${Array.from({ length: a.days }, (_, i) =>
          `<span class="arun-day${i < streak ? " is-on" : ""}">${i + 1}</span>`).join("")}
      </div>
      <button type="button" class="btn ${markedToday ? "btn-ghost" : "btn-primary"} btn-sm" data-day>
        ${esc(markedToday ? t("runner.unmarkToday") : t("runner.markToday"))}
      </button>
      ${S.days.length > streak ? `<p class="arun__note-hint">${esc(t("runner.totalDays"))}: ${S.days.length}</p>` : ""}
    </section>`;
}

function checkHtml(a) {
  if (!a.check) return "";
  return `
    <section class="arun__block arun__block--check">
      <h3 class="arun__h">${esc(t("assign.checkLabel"))}</h3>
      <p class="arun__check">${esc(a.check)}</p>
    </section>`;
}

function notesHtml() {
  const list = [...S.notes].reverse();
  return `
    <section class="arun__block">
      <h3 class="arun__h">${esc(t("runner.notes"))}</h3>
      <textarea class="arun-note" id="arun-note" rows="3" maxlength="1000"
                placeholder="${esc(t("runner.notePh"))}"></textarea>
      <button type="button" class="btn btn-outline btn-sm" data-note>${esc(t("runner.noteSave"))}</button>
      ${list.length ? `
        <ul class="arun-notes">
          ${list.map((n) => `<li><span class="arun-notes__d">${esc(n.d)}</span> ${esc(n.text)}</li>`).join("")}
        </ul>` : `<p class="arun__note-hint">${esc(t("runner.noteEmpty"))}</p>`}
    </section>`;
}

// ---------------------------------------------------------------- действия

function onClick(e) {
  const el = e.target.closest("[data-close], [data-step], [data-tick], [data-untick], [data-reset], [data-target], [data-day], [data-note], [data-done], [data-undo], [data-answered]");
  if (!el) return;
  const d = el.dataset;

  if ("close" in d) { closeAssignment(); return; }

  if ("step" in d) {
    // Нажатие по уже пройденному шагу возвращает на него: ученик заметил,
    // что смахнул лишнее, и должен иметь возможность откатиться.
    const i = Number(d.step);
    S.step = i < S.step ? i : i + 1;
    queueState({ step: S.step });
    return render();
  }

  // Счётчик правим точечно, без перерисовки всего окна. Причина не в
  // скорости: полная перерисовка снимает фокус с кнопки после каждого
  // нажатия, а по ней жмут сорок раз подряд, часто с закрытыми глазами.
  if ("tick" in d)   { S.count += 1; queueState({ count: S.count }); return paintCounter(); }
  if ("untick" in d) { S.count = Math.max(0, S.count - 1); queueState({ count: S.count }); return paintCounter(); }
  if ("reset" in d)  { S.count = 0; queueState({ count: 0 }); return paintCounter(); }
  if ("target" in d) {
    // Смена ступени обнуляет счёт: на новой ступени эталон другой, и
    // перенесённое число сбивало бы с толку.
    S.target = Number(d.target); S.count = 0;
    queueState({ target: S.target, count: 0 });
    return render();
  }

  if ("day" in d)      return void markDay(el);
  if ("note" in d)     return void saveNote(el);
  if ("done" in d)     return void setDone(el, false);
  if ("answered" in d) return void setDone(el, true);
  if ("undo" in d)     return void undoDone(el);
}

function paintCounter() {
  const n = overlay?.querySelector(".arun-count__n");
  if (!n) return;
  n.textContent = S.count;
  const target = S.target || ctx.a.counter?.targets?.[0] || 0;
  const bar = overlay.querySelector(".arun-count__bar > span");
  if (bar) bar.style.width = `${target ? Math.min(100, Math.round((S.count / target) * 100)) : 0}%`;
}

async function markDay(btn) {
  const key = todayKey();
  const had = S.days.includes(key);
  S.days = had ? S.days.filter((x) => x !== key) : [...S.days, key];
  render();
  if (!ctx.uid || !ctx.moduleId) return;
  try {
    if (had) await unlogAssignmentDay(ctx.uid, ctx.moduleId, ctx.a.id);
    else await logAssignmentDay(ctx.uid, ctx.moduleId, ctx.a.id);
    writeBackLog({ days: S.days });
  } catch (err) { fail(err, "runner day"); }
}

async function saveNote(btn) {
  const ta = overlay.querySelector("#arun-note");
  const text = (ta?.value || "").trim();
  if (!text) { ta?.focus(); return; }
  S.notes = [...S.notes, { d: todayKey(), text: text.slice(0, 1000) }];
  // Чистим ДО перерисовки: иначе render() подхватит текст как недописанный
  // черновик, и запись останется и в списке, и в поле ввода.
  ta.value = "";
  render();
  if (!ctx.uid || !ctx.moduleId) return;
  try {
    await saveAssignmentNote(ctx.uid, ctx.moduleId, ctx.a.id, text);
    writeBackLog({ notes: S.notes });
  } catch (err) { fail(err, "runner note"); }
}

async function setDone(btn, answered) {
  if (!ctx.uid || !ctx.moduleId) return;
  btn.disabled = true;
  try {
    await markAssignmentDone(ctx.uid, ctx.moduleId, ctx.a.id, answered);
    const m = (ctx.progress[ctx.moduleId] ||= {});
    m.doneAssignments = [...new Set([...(m.doneAssignments || []), ctx.a.id])];
    if (answered) m.answeredAssignments = [...new Set([...(m.answeredAssignments || []), ctx.a.id])];
    render();
  } catch (err) { btn.disabled = false; fail(err, "runner done"); }
}

async function undoDone(btn) {
  if (!ctx.uid || !ctx.moduleId) return;
  btn.disabled = true;
  try {
    await unmarkAssignmentDone(ctx.uid, ctx.moduleId, ctx.a.id);
    const m = (ctx.progress[ctx.moduleId] ||= {});
    m.doneAssignments = (m.doneAssignments || []).filter((x) => x !== ctx.a.id);
    m.answeredAssignments = (m.answeredAssignments || []).filter((x) => x !== ctx.a.id);
    render();
  } catch (err) { btn.disabled = false; fail(err, "runner undo"); }
}

/** Локальная копия журнала в объекте прогресса — чтобы повторное открытие
 *  окна в этой же сессии показало то, что уже отмечено, без перечитывания
 *  профиля из базы. */
function writeBackLog(patch) {
  const m = (ctx.progress[ctx.moduleId] ||= {});
  const log = (m.log ||= {});
  log[ctx.a.id] = { ...(log[ctx.a.id] || {}), ...patch };
}

/** Счётчик отправляем с задержкой: сорок нажатий подряд — это сорок
 *  записей в базу, а нужна одна. Обязательно сбрасывается при закрытии,
 *  иначе последние повторы не сохранятся. */
let pending = null;
function queueState(patch) {
  pending = { ...(pending || {}), ...patch };
  writeBackLog(patch);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushState, 1200);
}

function flushState() {
  clearTimeout(saveTimer);
  const patch = pending;
  pending = null;
  if (!patch || !ctx?.uid || !ctx?.moduleId) return;
  saveAssignmentState(ctx.uid, ctx.moduleId, ctx.a.id, patch).catch((err) => fail(err, "runner state"));
}

// ⚠️ ДОПИСЫВАЕМ ПРИ УХОДЕ СО СТРАНИЦЫ (найдено аудитом 2026-07-27).
//
// flushState() вызывался только из closeAssignment() — то есть если ученик
// закрыл окно упражнения крестиком. А делают иначе: отсчитали сорок
// повторов и свернули браузер, не закрывая окно. На телефоне система
// потом выгружает вкладку — и счётчик, отмеченный шаг и выбранная ступень
// пропадают. Человек уверен, что практика засчитана, а в прогрессе пусто.
//
// Слушатели вешаются один раз на модуль, а не на каждое открытие окна:
// иначе за занятие их накопились бы десятки.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushState();
});
window.addEventListener("pagehide", flushState);

// Не молчим: без сообщения ученик решит, что отметка прошла, и будет
// ждать её в ленте — а её там не будет.
function fail(err, where) {
  console.warn(where, err);
  alert(t("common.error"));
}
