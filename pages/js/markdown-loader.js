// Загружает .md файл из content/, парсит простой YAML front matter (плоские
// key: "value" пары — фронт-маттер контента специально простой, без вложенности)
// и рендерит остальное как markdown через marked.js (подключается в каждой
// странице отдельным <script> из CDN — см. pages/book.html/module.html).

import { withBase } from "./base-path.js?v=6";

export function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_]+):\s*"?(.*?)"?\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  return { meta, body: match[2] };
}

export async function loadMarkdownDoc(path) {
  const res = await fetch(withBase(path));
  if (!res.ok) throw new Error(`Не удалось загрузить ${path}: HTTP ${res.status}`);
  const raw = await res.text();
  return parseFrontMatter(raw);
}

const STATUS_BADGE = {
  certified: { cls: "badge-certified", label: "Подтверждено шейхом" },
  draft: { cls: "badge-draft", label: "Черновик, ждёт подтверждения шейха" },
  archive: { cls: "badge-archive", label: "Вне сертифицируемой программы" },
  author: { cls: "badge-author", label: "Авторская методика — не Сунна" },
};

export function statusBadgeHtml(status) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.draft;
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

/** Рендерит doc {meta, body} в контейнер: заголовок, значок статуса, тело markdown. */
export function renderDocInto(container, doc, { showTitle = true } = {}) {
  const html = window.marked
    ? window.marked.parse(doc.body)
    : `<pre style="white-space:pre-wrap; overflow-wrap:anywhere;">${doc.body}</pre>`;
  container.innerHTML = `
    ${showTitle && doc.meta.title ? `<h1>${doc.meta.title}</h1>` : ""}
    <div class="doc-meta">
      ${statusBadgeHtml(doc.meta.status)}
      ${doc.meta.source ? `<p class="form-note">Источник: ${doc.meta.source}</p>` : ""}
    </div>
    <div class="doc-body">${html}</div>
  `;
  // Таблицы контента (напр. таблицы классификации в Справочнике) не имели
  // защиты от горизонтального overflow на мобильном — оборачиваем в тот же
  // .table-scroll, что уже используют таблицы кабинетов (независимая
  // проверка, 2026-07-19).
  container.querySelectorAll(".doc-body table").forEach((table) => {
    const wrap = document.createElement("div");
    wrap.className = "table-scroll";
    table.replaceWith(wrap);
    wrap.appendChild(table);
  });
}

/** Три уровня доступа к тексту книги/модуля (project.md §18): гость — текста
 * не видит вообще, только призыв зарегистрироваться; зарегистрированный, но
 * неоплативший — небольшой бесплатный отрывок; оплативший/админ — полный
 * текст. Общая логика для book.html (отдельные уроки) и modules/module.html
 * (текст модуля у тех модулей, где нет отдельных уроков-книг) — раньше была
 * только в book.html, из-за чего страница модуля отдавала полный текст
 * анонимному гостю без проверки (независимая проверка, 2026-07-19). Это
 * программная защита "для честных" — сам файл в content/ всё равно читается
 * напрямую через публичный GitHub-репозиторий, без сервера скрыть статический
 * .md технически нельзя (см. project.md). */
export function applyPaywall(bodyEl) {
  const children = Array.from(bodyEl.children);
  if (children.length <= 1) return; // нечего резать без потери смысла
  const cutIndex = Math.max(1, Math.ceil(children.length * 0.12));
  if (cutIndex >= children.length) return;
  for (let i = cutIndex; i < children.length; i++) children[i].remove();

  const fade = document.createElement("div");
  fade.className = "paywall-fade";
  fade.setAttribute("aria-hidden", "true");
  bodyEl.after(fade);

  const paywall = document.createElement("div");
  paywall.className = "card paywall-card";
  paywall.innerHTML = `
    <h3>Это лишь небольшой бесплатный отрывок</h3>
    <p class="form-note">Полный текст, экзамен по нему и весь курс целиком —
      11 модулей от основ якына до практики под супервизией наставника —
      открываются только после покупки курса.</p>
    <p class="paywall-card__price">30 000 ₽</p>
    <div class="book-exam-cta__actions">
      <a class="btn btn-primary" href="https://t.me/ruqoq" target="_blank" rel="noopener">Написать лекарю в Telegram</a>
      <a class="btn btn-outline" href="${withBase("/pages/auth/login.html")}">Уже оплатили? Войти</a>
    </div>`;
  fade.after(paywall);
}

/** Гость без регистрации — текст не показываем вообще, только призыв
 * зарегистрироваться. Иначе регистрация не даёт никакой разницы в доступе
 * по сравнению с обычным посетителем сайта. */
/** Личная заметка ученика к книге/модулю — общая для book.html и
 * modules/module.html (веб-исследование лучших LMS-практик, "оживление
 * обучающей системы", 2026-07-20): возможность аннотировать текст —
 * стандартный паттерн у читалок и курсов, у нас не было вообще. Не
 * импортирует firestore.js напрямую (этот файл — только рендер/DOM,
 * без знания о бэкенде) — сохранение передаётся колбэком onSave(text)
 * от вызывающей страницы. Ручное сохранение по кнопке, не автосейв на
 * каждый символ — меньше записей в Firestore, понятнее момент "сохранено". */
export function setupNoteCard(container, existingNote, onSave) {
  container.className = "card no-print";
  container.innerHTML = `
    <h3>Мои заметки</h3>
    <p class="form-note">Видны только вам — не часть текста книги.</p>
    <textarea id="note-text" class="text-input" style="width:100%; min-height:5rem; resize:vertical;"
      placeholder="Мысли, вопросы, то, что хочется запомнить…">${existingNote ? existingNote.replace(/</g, "&lt;") : ""}</textarea>
    <div class="hero-actions" style="margin-top: var(--rp-space-3); justify-content:flex-start;">
      <button id="note-save" class="btn btn-outline btn-sm" type="button">Сохранить заметку</button>
      <span id="note-status" class="form-note" role="status" aria-live="polite"></span>
    </div>`;
  const textarea = container.querySelector("#note-text");
  const status = container.querySelector("#note-status");
  container.querySelector("#note-save").addEventListener("click", async () => {
    status.textContent = "Сохранение…";
    try {
      await onSave(textarea.value);
      status.textContent = "Сохранено ✓";
    } catch (err) {
      console.warn(err);
      status.textContent = "Не удалось сохранить — проверьте связь с интернетом.";
    }
  });
}

export function applyRegisterWall(bodyEl) {
  Array.from(bodyEl.children).forEach((el) => el.remove());
  const wall = document.createElement("div");
  wall.className = "card paywall-card";
  wall.innerHTML = `
    <h3>Зарегистрируйтесь, чтобы прочитать бесплатный отрывок</h3>
    <p class="form-note">Регистрация бесплатна и займёт меньше минуты.
      После входа откроется небольшой отрывок — полный текст, экзамены и
      весь курс целиком — 30 000 ₽.</p>
    <div class="book-exam-cta__actions">
      <a class="btn btn-primary" href="${withBase("/pages/auth/register.html")}">Зарегистрироваться бесплатно</a>
      <a class="btn btn-outline" href="${withBase("/pages/auth/login.html")}">Уже есть аккаунт? Войти</a>
    </div>`;
  bodyEl.after(wall);
}
