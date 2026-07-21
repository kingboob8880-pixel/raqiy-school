// Загружает .md файл из content/, парсит простой YAML front matter (плоские
// key: "value" пары — фронт-маттер контента специально простой, без вложенности)
// и рендерит остальное как markdown через marked.js (подключается в каждой
// странице отдельным <script> из CDN — см. pages/book.html/module.html).

import { withBase } from "./base-path.js?v=6";
import { MODULES } from "./modules-data.js?v=19";

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
  // Предупреждения в тексте книг иногда написаны обычным абзацем "⚠️ ...",
  // а не markdown-цитатой (>) — визуально ничем не отличались от обычной
  // прозы (независимая проверка, 2026-07-20, скриншот автора "текст
  // модуля"). Помечаем классом по первому символу — сам markdown-текст не
  // трогаем, только рендер; design/base.css уже стилизует .doc-warning так
  // же, как существующий <blockquote>.
  container.querySelectorAll(".doc-body > p").forEach((p) => {
    if (p.textContent.trim().startsWith("⚠️")) p.classList.add("doc-warning");
  });
  const bodyEl = container.querySelector(".doc-body");
  if (bodyEl) { enhanceDuaBlocks(bodyEl); enhanceContentLinks(bodyEl); }
}

// Метки "**Арабский текст:**"/"**Транскрипция:**"/"**Перевод:**" перед
// длинными дуа (напр. «Мольба заклинателя») рендерились как обычные жирные
// абзацы — арабский текст ничем визуально не отличался от русской прозы:
// не RTL, не увеличен, нет arial/serif-шрифта для арабской вязи, нет
// зрительной группировки метка+текст+текст+текст в один блок (запрос
// автора "проработай над удобством и видом", 2026-07-20, скриншот книги
// "Мольба заклинателя"). Постобработка DOM после рендера — сам markdown
// не трогаем, метки остаются как источник правды.
const DUA_LABELS = {
  "Арабский текст:": "arabic",
  "Транскрипция:": "translit",
  "Перевод:": "translation",
};

/** Группирует подряд идущие пары "метка + абзац" (Арабский/Транскрипция/
 * Перевод) в один визуальный блок .dua-block, стилизует арабский текст
 * как RTL с арабским шрифтом (design/base.css). Идемпотентна — повторный
 * вызов на уже обработанном узле не ломает разметку (проверяет наличие
 * .dua-block перед повторной группировкой). Экспортирована — вызывается и
 * из renderDocInto(), и отдельно после замены bodyEl.innerHTML полным
 * текстом из Firestore (book.html/module.html, getFullBookContent()). */
/** Оглавление + оценка времени чтения + полоса прогресса — ориентиры для
 * длинного текста (план улучшения курса, 2026-07-18, "chunking"). Раньше
 * жила только в book.html; теперь общая с modules/module.html
 * (loop-проход №3, "удобство", 2026-07-20) — у длинных модулей без
 * отдельных уроков-книг (напр. module-6/index.md, ~2800 слов) не было
 * вообще никакой навигации по тексту. Принимает контейнер с `.doc-meta` и
 * `.doc-body` внутри (root/#doc-root на book.html, #module-doc на
 * module.html). Идемпотентна — `watchAuth` в обоих вызывающих файлах может
 * сработать больше одного раза за сессию (уже известный паттерн Firebase,
 * см. `started`-флаг в quiz/index.html); без guard'а повторный вызов
 * дублировал бы и оглавление, и полосу прогресса. */
/** Плавное появление элементов при попадании во вьюпорт — та же утилита
 * `.reveal`/`.is-visible` (design/base.css), что уже используется на
 * лендинге и "Пути ученика" (modules/index.html), теперь общая: запрос
 * автора "нужно сделать интересным, может анимацию добавить, чтобы не
 * было скукоты", 2026-07-21 — статичный текст книг/модулей выглядел
 * одинаково "включённым" целиком, без ощущения путешествия по странице.
 * `step` — задержка между соседними элементами (для группы, появляющейся
 * разом, напр. оглавление); 0 — каждый элемент проявляется независимо
 * ровно в момент, когда доскроллили именно до него (для контента,
 * растянутого по всей странице — длинная накопленная задержка для
 * дальних элементов выглядела бы как лаг, а не как оживление).
 * Экспортирована (была локальной) — modules/module.html переиспользует её
 * для списка "Уроки" вместо третьей копии того же IntersectionObserver-кода
 * (запрос автора "сделай отображение красивым и интересным", скриншот
 * списка уроков, 2026-07-21). */
export function staggerReveal(elements, { step = 0, max = 480 } = {}) {
  if (!("IntersectionObserver" in window) || !elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach((el, i) => {
    el.classList.add("reveal");
    if (step) el.style.transitionDelay = `${Math.min(i * step, max)}ms`;
    observer.observe(el);
  });
}

export function addReadingAids(container) {
  const bodyEl = container.querySelector(".doc-body");
  const metaEl = container.querySelector(".doc-meta");
  if (!bodyEl || bodyEl.dataset.readingAidsAdded) return;
  bodyEl.dataset.readingAidsAdded = "1";

  const words = bodyEl.textContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  if (metaEl) {
    const time = document.createElement("p");
    time.className = "form-note";
    time.textContent = `≈ ${minutes} мин чтения`;
    metaEl.appendChild(time);
  }

  const headings = Array.from(bodyEl.querySelectorAll("h2"));
  if (headings.length >= 2) {
    headings.forEach((h, i) => { h.id = `sec-${i}`; });
    const toc = document.createElement("nav");
    toc.className = "doc-toc";
    toc.setAttribute("aria-label", "Оглавление");
    toc.innerHTML = `
      <p class="doc-toc__title">Оглавление</p>
      <ol>${headings.map((h) => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join("")}</ol>`;
    bodyEl.before(toc);
    // Пункты появляются "лесенкой" один за другим — вся группа видна разом
    // (оглавление в начале страницы), поэтому задержка по индексу здесь
    // уместна, в отличие от контента ниже.
    staggerReveal(Array.from(toc.querySelectorAll("li")), { step: 55, max: 400 });
  }

  // Заголовки разделов и смысловые "врезки" (цитаты, блоки дуа, карточки
  // аятов, предупреждения) мягко проявляются по мере прокрутки — то самое
  // "ощущение путешествия" по длинному тексту, а не стену сплошь видимого
  // текста. Обычные абзацы не трогаем намеренно: анимировать вообще всё
  // подряд при чтении длинного текста мешало бы, а не оживляло.
  staggerReveal(Array.from(bodyEl.querySelectorAll("h2, blockquote, .dua-block, .ayah-card, .doc-warning")));

  // Полоса прогресса чтения — только для достаточно длинного текста
  // (короткие уроки в ней не нуждаются, полоса мгновенно заполнялась бы
  // целиком). Порог совпадает по духу с порогом появления оглавления.
  if (minutes >= 3 && !document.getElementById("reading-progress")) {
    const bar = document.createElement("div");
    bar.id = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.prepend(bar);
    const update = () => {
      const rect = bodyEl.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : (rect.top < 0 ? 1 : 0);
      bar.style.width = `${Math.round(scrolled * 100)}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // Кнопка "наверх" — тот же порог длины (minutes >= 3), что у полосы
  // прогресса: короткому уроку она не нужна, к началу и так рукой подать.
  if (minutes >= 3 && !document.getElementById("back-to-top")) {
    const btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.className = "no-print";
    btn.type = "button";
    btn.setAttribute("aria-label", "Наверх");
    btn.textContent = "↑";
    document.body.appendChild(btn);
    const toggle = () => btn.classList.toggle("is-visible", window.scrollY > 600);
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    btn.addEventListener("click", () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
}

export function enhanceDuaBlocks(bodyEl) {
  const children = Array.from(bodyEl.children);
  let i = 0;
  while (i < children.length) {
    const el = children[i];
    if (el.tagName !== "P" || el.parentElement !== bodyEl) { i++; continue; }
    const onlyStrong = el.children.length === 1 && el.firstElementChild?.tagName === "STRONG";
    const label = onlyStrong ? el.textContent.trim() : null;
    const kind = label && DUA_LABELS[label];
    if (!kind) { i++; continue; }
    const content = children[i + 1];
    if (!content || content.tagName !== "P") { i++; continue; }
    el.classList.add("dua-label");
    content.classList.add(`doc-body__${kind}`);
    if (kind === "arabic") { content.setAttribute("dir", "rtl"); content.setAttribute("lang", "ar"); }
    // Собираем блок из всех подряд идущих пар начиная с текущей позиции —
    // не привязываемся к фиксированному порядку (в некоторых уроках
    // Транскрипция+Перевод есть, а отдельного Арабского текста нет).
    let j = i;
    while (j < children.length) {
      const lp = children[j];
      const lbl = lp.tagName === "P" && lp.children.length === 1 && lp.firstElementChild?.tagName === "STRONG"
        ? lp.textContent.trim() : null;
      if (!lbl || !DUA_LABELS[lbl]) break;
      const cp = children[j + 1];
      if (!cp || cp.tagName !== "P") break;
      lp.classList.add("dua-label");
      cp.classList.add(`doc-body__${DUA_LABELS[lbl]}`);
      if (DUA_LABELS[lbl] === "arabic") { cp.setAttribute("dir", "rtl"); cp.setAttribute("lang", "ar"); }
      j += 2;
    }
    const group = children.slice(i, j);
    const wrap = document.createElement("div");
    wrap.className = "dua-block";
    wrap.setAttribute("role", "group"); // группа связанных абзацев для ассистивных технологий
    group[0].before(wrap);
    group.forEach((node) => wrap.appendChild(node));
    i = j;
  }
}

/** Ссылки внутри текста книг/модулей на другие разделы курса пишутся в
 * markdown как обычные ссылки на сырые файлы контента, напр.
 * "[Модуль 4](/content/module-4/index.md)" — marked.js рендерит их как
 * обычный <a href="/content/module-4/index.md">, что при клике вело бы на
 * сырой .md-файл в репозитории, а не на настоящую страницу модуля/книги
 * (независимая проверка, 2026-07-21, вместе с жалобой автора на вид
 * ссылок). Резолвим такой путь в реальный маршрут сайта через тот же
 * modules-data.js, которым уже пользуются module.html/book.html. */
function resolveContentLink(rawHref) {
  const path = (rawHref || "").replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0];
  if (!path.startsWith("/content/")) return null;
  for (const m of MODULES) {
    if (m.doc === path) return { href: withBase(`/pages/modules/module.html?id=${m.id}`), title: m.title, kind: "module" };
    for (const lesson of m.lessons) {
      if (lesson.doc === path) return { href: withBase(`/pages/book.html?doc=${encodeURIComponent(path)}`), title: lesson.title, kind: "lesson" };
    }
  }
  return null;
}

/** Превращает распознанные ссылки на другие модули/книги/справочники в
 * компактные кнопки-«пилюли» вместо обычного подчёркнутого текста внутри
 * абзаца (запрос автора "тексты которые служат ссылкой для других модулей
 * пусть будут в виде кнопок красиво и современно", 2026-07-21) — и вместо
 * немедленного перехода (который сбрасывает место чтения текущего урока)
 * открывает модалку-предпросмотр с названием раздела и явным выбором
 * "Открыть"/"Остаться здесь" (openContentLinkModal). Ссылки на неизвестные
 * пути (вне modules-data.js) не трогаем — оставляем как есть, безопасный
 * фолбэк. Идемпотентна через data-атрибут, как и остальные enhance*-функции
 * этого файла (bodyEl может обрабатываться повторно при повторном
 * срабатывании watchAuth). */
export function enhanceContentLinks(bodyEl) {
  bodyEl.querySelectorAll('a[href^="/content/"]').forEach((a) => {
    if (a.dataset.contentLinkDone) return;
    a.dataset.contentLinkDone = "1";
    const resolved = resolveContentLink(a.getAttribute("href"));
    if (!resolved) return;
    const label = a.textContent.trim() || resolved.title;
    a.href = resolved.href; // обычная навигация — на случай открытия в новой вкладке/ Ctrl+клика, где preventDefault ниже не сработает
    a.classList.add("content-ref-link");
    a.innerHTML = `<span class="content-ref-link__icon" aria-hidden="true">${resolved.kind === "module" ? "▤" : "▸"}</span><span>${label}</span>`;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openContentLinkModal(resolved, label);
    });
  });
}

let activeModalCleanup = null;

/** Общая модалка-предпросмотр перед переходом на другой раздел курса —
 * без нее клик по ссылке-кнопке сразу же уводил бы со страницы и терял
 * прогресс чтения текущего урока. Закрывается по Escape, клику по
 * подложке или кнопке "Остаться здесь"; фокус переносится на модалку и
 * возвращается на исходную ссылку при закрытии (базовая доступность). */
export function openContentLinkModal({ href, kind }, label) {
  if (activeModalCleanup) activeModalCleanup();
  const trigger = document.activeElement;

  const overlay = document.createElement("div");
  overlay.className = "rp-modal-overlay";
  overlay.innerHTML = `
    <div class="rp-modal" role="dialog" aria-modal="true" aria-labelledby="rp-modal-title">
      <button class="rp-modal__close" type="button" aria-label="Закрыть">×</button>
      <p class="rp-modal__eyebrow">${kind === "module" ? "Другой модуль курса" : "Другая книга / справочник"}</p>
      <h3 id="rp-modal-title" class="rp-modal__title">${label}</h3>
      <p class="form-note">Переход откроет её на новой странице — место в текущем уроке
        не потеряется, можно будет вернуться назад.</p>
      <div class="rp-modal__actions">
        <a class="btn btn-primary" href="${href}">Открыть →</a>
        <button class="btn btn-outline" type="button" data-close>Остаться здесь</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("rp-modal-open");

  const close = () => {
    overlay.remove();
    document.body.classList.remove("rp-modal-open");
    document.removeEventListener("keydown", onKeydown);
    if (trigger && typeof trigger.focus === "function") trigger.focus();
    activeModalCleanup = null;
  };
  const onKeydown = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKeydown);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  overlay.querySelector(".rp-modal__close").addEventListener("click", close);
  overlay.querySelector("[data-close]").addEventListener("click", close);
  activeModalCleanup = close;

  overlay.querySelector(".rp-modal__close").focus();
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

/** Раздел "Архив" (content/archive/index.md) — разбор материалов, исключённых
 * из сертифицируемой программы, с прямой критикой конкретных книг/методик
 * (project.md §7/§9). Раньше был за тем же пейволом, что и обычные платные
 * книги — значит, любой ОПЛАТИВШИЙ курс ученик тоже видел его целиком, не
 * только админ. Автор прислал скриншот live-страницы и явно попросил:
 * "убери от всех кроме меня админа" (2026-07-21) — доступ сузили до
 * admin-only (book.html передаёт сюда, если !admin && это архивный docPath).
 * Отдельная от applyPaywall()/applyRegisterWall() функция — тем двум уместен
 * призыв "оплатите курс"/"зарегистрируйтесь", здесь это неуместно: доступ
 * не продаётся, у обычного ученика (даже оплатившего) его не будет никогда. */
export function applyAdminOnlyWall(bodyEl) {
  Array.from(bodyEl.children).forEach((el) => el.remove());
  const wall = document.createElement("div");
  wall.className = "card paywall-card";
  wall.innerHTML = `
    <h3>Этот раздел виден только администратору школы</h3>
    <p class="form-note">Здесь — внутренний разбор материалов, не входящих в
      сертифицируемую программу курса. Он не продаётся и не открывается по
      оплате — обычная часть курса вам доступна в разделе «Модули».</p>`;
  bodyEl.after(wall);
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
