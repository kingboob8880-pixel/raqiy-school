// Карточки практических заданий — общий вид для страницы модуля и страницы
// книги.
//
// Зачем вынесено отдельно (2026-07-27): раньше эта разметка вместе с
// обработчиками жила прямо в pages/modules/module.html. Когда автор решил
// показывать задание ещё и под текстом книги, копия понадобилась бы во
// второй файл — а вместе с ней и копия логики отметки о выполнении,
// вопроса «Аллах ответил?» и записи в ленту достижений. Две копии такой
// логики разъезжаются на первой же правке.
//
// Отметка «выполнил» и свидетельство «Аллах ответил» — запрос автора
// 2026-07-26; сервер переносит уже поставленный флаг в общую ленту.
import { t } from "./i18n.js?v=26";
import { markAssignmentDone, unmarkAssignmentDone } from "../../integration/firestore.js?v=24";
import { openAssignment } from "./assignment-runner.js?v=1";
import { assignmentGate } from "./assignments-gate.js?v=2";
import { withBase } from "./base-path.js?v=6";

const ICONS = { reflection: "\u{1F4DD}", practice: "\u{1F3CB}", daily: "\u{1F4C5}" };

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Ученик мог ответить «пока продолжаю просить» — тогда вопрос больше не
// показываем до конца сессии, иначе он висел бы у выполненного задания
// укором при каждом заходе.
const answerAsked = new Set();

/**
 * Рисует список заданий и подключает отметку о выполнении.
 *
 *   container — куда рисовать
 *   items     — массив заданий из assignments-data.js
 *   opts.uid       — uid ученика; без него карточки только читаются
 *   opts.moduleId  — номер модуля (куда писать отметку в progress)
 *   opts.progress  — объект прогресса; правится на месте, чтобы не
 *                    перечитывать профиль после каждого нажатия
 *   opts.heading   — текст заголовка над списком (необязательно)
 *   opts.preview   — режим просмотра: кнопки видны, но не работают.
 *                    Нужен админу: у него нет ученической записи, запись
 *                    прогресса упала бы на правилах, — но при полностью
 *                    скрытых кнопках карточка выглядит сломанной, и автор
 *                    не видит того, что видит ученик (правка 2026-07-27).
 */
export function renderAssignments(container, items, opts = {}) {
  if (!container || !items || !items.length) return;
  const { uid = null, moduleId = null, progress = {}, heading = "", preview = false, currentBook = null, full = false } = opts;

  const mp = progress?.[moduleId] || {};
  const doneSet = new Set(mp.doneAssignments || []);
  const ansSet = new Set(mp.answeredAssignments || []);

  container.innerHTML = `
    ${heading ? `<h2 class="eyebrow eyebrow--muted">${esc(heading)}</h2>` : ""}
    <div class="assignments-grid">${items.map((a) => cardHtml(a, {
      done: doneSet.has(a.id),
      answered: ansSet.has(a.id),
      asked: answerAsked.has(a.id),
      interactive: !!uid || preview,
      preview,
      currentBook,
      // Замок считаем на карточку, а не на список: в одном модуле часть
      // книг сдана, часть нет.
      gate: assignmentGate(a, progress, { moduleId, preview, full }),
    })).join("")}</div>`;
  container.hidden = false;

  // Один обработчик на контейнер. Флаг нужен потому, что функция
  // перерисовывает себя после каждого нажатия, а innerHTML не снимает
  // слушатель с самого контейнера — без флага их накопилось бы по одному
  // на нажатие.
  if (container.dataset.wired) return;
  container.dataset.wired = "1";

  container.addEventListener("click", async (e) => {
    // «Провести упражнение» работает и без входа: гость и админ должны
    // видеть, из чего упражнение состоит. Сохранять окно тогда просто
    // ничего не будет — оно об этом само пишет.
    const run = e.target.closest("[data-run]");
    if (run) {
      const a = items.find((x) => x.id === run.dataset.run);
      if (a) openAssignment(a, {
        uid: preview ? null : uid,
        moduleId: moduleId ?? a.moduleId,
        progress,
        onChange: () => renderAssignments(container, items, opts),
      });
      return;
    }

    if (!uid || !moduleId || preview) return;

    const btn = e.target.closest("[data-done], [data-undo], [data-answered], [data-wait]");
    if (!btn) return;
    const { done, undo, answered, wait } = btn.dataset;
    const id = done || undo || answered || wait;

    // «Пока продолжаю просить» ничего не пишет в базу: это не факт о
    // прогрессе, а просьба не спрашивать снова.
    if (wait) {
      answerAsked.add(id);
      renderAssignments(container, items, opts);
      return;
    }

    btn.disabled = true;
    try {
      const m = (progress[moduleId] ||= {});
      if (done) {
        await markAssignmentDone(uid, moduleId, id, false);
        m.doneAssignments = [...(m.doneAssignments || []), id];
      } else if (answered) {
        await markAssignmentDone(uid, moduleId, id, true);
        m.answeredAssignments = [...(m.answeredAssignments || []), id];
      } else if (undo) {
        await unmarkAssignmentDone(uid, moduleId, id);
        m.doneAssignments = (m.doneAssignments || []).filter((x) => x !== id);
        m.answeredAssignments = (m.answeredAssignments || []).filter((x) => x !== id);
      }
      renderAssignments(container, items, opts);
    } catch (err) {
      // Не молчим: без сообщения ученик решит, что нажатие прошло, и будет
      // ждать записи в ленте, которой не будет.
      console.warn("assignment mark", err);
      btn.disabled = false;
      alert(t("common.error"));
    }
  });
}

function cardHtml(a, st) {
  const head = `
      <div class="assignment-card__header">
        <span class="assignment-card__icon">${st.gate.open ? (ICONS[a.type] || ICONS.reflection) : "\u{1F512}"}</span>
        <span class="assignment-card__type">${esc(t("assign." + a.type))}</span>
        <span class="assignment-card__duration">${esc(t("assign.duration"))}: ${esc(a.duration)}</span>
      </div>
      <h3 class="assignment-card__title">${esc(a.title)}</h3>`;

  // Закрытое упражнение: название, условие и путь к нему. Описание, шаги и
  // признак выполнения скрыты — иначе замок ничего не значит, задание
  // можно было бы просто прочитать и «сделать» мимо курса.
  if (!st.gate.open) {
    return `
    <div class="card assignment-card assignment-card--locked" data-id="${esc(a.id)}">
      ${head}
      ${lockHtml(a, st)}
    </div>`;
  }

  return `
    <div class="card lift assignment-card${st.done ? " assignment-card--done" : ""}" data-id="${esc(a.id)}">
      ${head}
      <p class="assignment-card__desc">${esc(a.description)}</p>
      ${checkHtml(a)}
      ${footHtml(a, st)}
    </div>`;
}

/** Условие открытия и ссылка на то, чем его выполнить. Без ссылки замок
 *  превращается в «нельзя» без объяснения, куда идти. */
function lockHtml(a, st) {
  if (st.gate.why === "module") {
    return `
      <p class="assignment-card__lock">${esc(t("assign.lockModule"))} ${st.gate.moduleId}</p>
      <div class="assignment-card__foot">
        <a class="btn btn-outline btn-sm" href="${withBase("/pages/modules/module.html")}?id=${st.gate.moduleId}">${esc(t("assign.goModule"))}</a>
      </div>`;
  }
  const bookLink = st.currentBook === a.book ? "" :
    `<a class="btn btn-outline btn-sm" href="${withBase("/pages/book.html")}?doc=${encodeURIComponent(a.book)}">${esc(t("assign.goBook"))}</a>`;
  return `
    <p class="assignment-card__lock">${esc(t("assign.lockExam"))}</p>
    <div class="assignment-card__foot">
      ${bookLink}
      <a class="btn btn-ghost btn-sm" href="${withBase("/pages/quiz/index.html")}?exam=${encodeURIComponent(st.gate.exam)}">${esc(t("assign.goExam"))}</a>
    </div>`;
}

/** Признак выполнения. Показывается всегда, даже незалогиненному: это
 *  часть самого задания, а не награда за вход. */
function checkHtml(a) {
  if (!a.check) return "";
  return `
    <div class="assignment-card__check">
      <span class="assignment-card__check-label">${esc(t("assign.checkLabel"))}</span>
      <span class="assignment-card__check-text">${esc(a.check)}</span>
    </div>`;
}

function footHtml(a, st) {
  // Вопрос «Аллах ответил?» задаётся ТОЛЬКО по практике и ТОЛЬКО после
  // отметки о выполнении: у размышления такого вопроса нет, а до
  // выполнения он бессмыслен. Свидетельство ставит сам ученик — сервер за
  // него этого не решает.
  const askAnswer = !st.preview && a.type === "practice" && st.done && !st.answered && !st.asked;
  // В режиме просмотра кнопки видны, но выключены: иначе нажатие молча
  // падало бы на правилах Firestore, и было бы не понять, отметилось или
  // нет.
  const off = st.preview ? " disabled" : "";
  return `
    <div class="assignment-card__foot">
      <button type="button" class="btn btn-primary btn-sm" data-run="${esc(a.id)}">${esc(t("runner.open"))}</button>
      ${!st.interactive ? "" : st.done
        ? `<span class="assignment-card__badge">✓ ${esc(t("assign.isDone"))}</span>
           <button type="button" class="assignment-card__undo" data-undo="${esc(a.id)}"${off}>${esc(t("assign.undo"))}</button>`
        : `<button type="button" class="btn btn-ghost btn-sm" data-done="${esc(a.id)}"${off}>${esc(t("assign.markDone"))}</button>`}
      ${st.answered ? `<span class="assignment-card__answered">${esc(t("assign.answeredDone"))}</span>` : ""}
    </div>
    ${st.preview ? `<p class="assignment-card__preview">${esc(t("runner.previewNote"))}</p>` : ""}
    ${askAnswer ? `
      <div class="assignment-card__ask">
        <p class="assignment-card__ask-q">${esc(t("assign.answeredQ"))}</p>
        <div class="assignment-card__ask-btns">
          <button type="button" class="btn btn-primary btn-sm" data-answered="${esc(a.id)}">${esc(t("assign.answeredYes"))}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-wait="${esc(a.id)}">${esc(t("assign.answeredWait"))}</button>
        </div>
      </div>` : ""}`;
}
