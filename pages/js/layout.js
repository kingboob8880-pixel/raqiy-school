// Общий header/footer сайта — один источник разметки вместо копирования в
// каждый .html файл. Подключается: <div id="site-header"></div> + этот скрипт.
// Внедряется в страницы на разной глубине вложенности, поэтому все ссылки —
// через withBase() (см. base-path.js), а не относительные.
import { withBase } from "./base-path.js?v=6";
import { initSiteTheme } from "./theme.js?v=8";
import { watchAuth, isAdmin } from "../../integration/auth.js?v=9";

export function renderHeader(zone = "learn") {
  const root = document.getElementById("site-header");
  if (!root) return;
  document.documentElement.setAttribute("data-zone", zone);

  // Skip-link (WCAG 2.4.1, "Bypass Blocks") — первый элемент на странице,
  // невидим, пока не получит фокус с клавиатуры; позволяет не пролистывать
  // шапку/навигацию Tab'ом на каждой странице (план улучшения курса,
  // 2026-07-18, шестой проход). <main> получает id/tabindex динамически,
  // если их ещё нет — у большинства страниц сайта своего id на <main> нет.
  const mainEl = document.querySelector("main");
  if (mainEl && !document.getElementById("skip-link")) {
    if (!mainEl.id) mainEl.id = "main-content";
    mainEl.setAttribute("tabindex", "-1");
    const skipLink = document.createElement("a");
    skipLink.id = "skip-link";
    skipLink.className = "skip-link";
    skipLink.href = `#${mainEl.id}`;
    skipLink.textContent = "Перейти к содержимому";
    document.body.prepend(skipLink);
  }

  // Живой фон (project.md §21) — мягкий плавающий градиент поверх фона
  // страницы, один на весь сайт. Цвета берутся из --rp-zone-accent, поэтому
  // сами подстраиваются под активную тему/зону, отдельно красить не нужно.
  // prefers-reduced-motion уже глобально отключает анимации в tokens.css.
  if (!document.getElementById("bg-ambient")) {
    const ambient = document.createElement("div");
    ambient.id = "bg-ambient";
    ambient.setAttribute("aria-hidden", "true");
    document.body.prepend(ambient);
  }

  // Переключатель тем (project.md §16а, решение 2026-07-16) — виден на любой
  // зоне, включая кабинеты ученика/админа: у каждой зоны свои комбинации
  // палитр на тему (design/tokens.css), поэтому переключение реально влияет
  // и на кабинеты, а не только на лендинг/модули/книги.
  const themeSwitcherHtml = `<div class="theme-switcher" id="theme-switcher"></div>`;

  root.innerHTML = `
    <header class="site-header">
      <div class="container site-header__row">
        <a class="site-header__brand" href="${withBase("/pages/index.html")}">
          <span class="site-header__brand-mark">ش</span>
          Онлайн-школа рукии
        </a>
        <nav class="site-header__nav" id="site-nav">
          <a data-nav="about" href="${withBase("/pages/about.html")}"><span aria-hidden="true">🧑‍⚕️</span>Об авторе</a>
          <a data-nav="modules" href="${withBase("/pages/modules/index.html")}"><span aria-hidden="true">📖</span>Модули</a>
          <a data-nav="tests" href="${withBase("/pages/tests/index.html")}"><span aria-hidden="true">📝</span>Тесты</a>
          <a data-nav="archive" href="${withBase("/pages/book.html")}?doc=${encodeURIComponent("/content/archive/index.md")}" hidden><span aria-hidden="true">🗃</span>Архив</a>
          <a data-nav="dashboard" href="${withBase("/pages/dashboard/student.html")}"><span aria-hidden="true">👤</span>Кабинет</a>
        </nav>
        <div class="site-header__actions">
          ${themeSwitcherHtml}
          <a class="btn btn-outline btn-sm" id="auth-btn" href="${withBase("/pages/auth/login.html")}">Войти</a>
          <button type="button" class="site-header__menu-btn" id="site-nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Открыть меню">
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>
    </header>
  `;

  // Подсветка активного пункта меню — по сегменту пути, не по точному URL
  // (страница книги/модуля живёт под /pages/modules/ или /pages/book.html,
  // поэтому сравниваем сегмент, а не href целиком).
  const path = location.pathname;
  // Урок (book.html) без "archive" в query — часть раздела "Модули", просто
  // не подсвечивалось раньше (независимая проверка, 2026-07-19).
  const isArchiveDoc = path.includes("/pages/book.html") && location.search.includes("archive");
  const navMatch = {
    about: path.includes("/pages/about.html"),
    modules: path.includes("/pages/modules/") || (path.includes("/pages/book.html") && !isArchiveDoc),
    tests: path.includes("/pages/tests/"),
    archive: isArchiveDoc,
    dashboard: path.includes("/pages/dashboard/"),
  };
  root.querySelectorAll(".site-header__nav a[data-nav]").forEach((a) => {
    if (navMatch[a.dataset.nav]) a.classList.add("is-active");
  });

  // Мобильное меню (< 56rem, доработка UI/UX 2026-07-18) — до этого пункты
  // навигации были недостижимы на телефоне (.site-header__nav имел
  // display:none без замены ниже breakpoint'а). Кнопка видна только на
  // мобильном (CSS скрывает её на десктопе), поэтому здесь не нужно
  // проверять ширину экрана отдельно.
  const navToggle = root.querySelector("#site-nav-toggle");
  const navEl = root.querySelector("#site-nav");
  if (navToggle && navEl) {
    const closeNav = () => { navEl.classList.remove("is-open"); navToggle.setAttribute("aria-expanded", "false"); };
    navToggle.addEventListener("click", () => {
      const open = navEl.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navEl.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
    document.addEventListener("click", (e) => {
      if (navEl.classList.contains("is-open") && !navEl.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  // Пункт "Архив" виден только админу (запрос автора "убери от всех кроме
  // меня админа", 2026-07-21 — раздел разбирает материалы, исключённые из
  // сертифицируемой программы, и не должен быть виден ни гостю, ни
  // оплатившему ученику). По умолчанию скрыт атрибутом hidden в разметке
  // выше — так пункт меню не мигает видимым до проверки роли и не ведёт
  // обычного посетителя в тупик "виден только администратору"
  // (book.html?doc=/content/archive/index.md — applyAdminOnlyWall()).
  // watchAuth может сработать больше раза за сессию — операция идемпотентна.
  const archiveLink = root.querySelector('.site-header__nav a[data-nav="archive"]');
  const authBtn = root.querySelector("#auth-btn");
  // Один watchAuth вместо двух — archiveLink + authBtn переключаются за
  // один обработчик, чтобы не удваивать подписку на auth-события.
  watchAuth(async (user) => {
    if (archiveLink) {
      if (!user) { archiveLink.hidden = true; }
      else { try { archiveLink.hidden = !(await isAdmin(user.uid)); } catch { archiveLink.hidden = true; } }
    }
    // Кнопка «Войти» → скрыть для залогиненных (аудит, 2026-07-21).
    if (authBtn) {
      if (user) {
        authBtn.textContent = user.displayName || user.email?.split("@")[0] || "Кабинет";
        authBtn.href = withBase("/pages/dashboard/student.html");
      } else {
        authBtn.textContent = "Войти";
        authBtn.href = withBase("/pages/auth/login.html");
      }
    }
  });

  initSiteTheme();
}

// Явная обратная связь после действий в кабинетах (kabinet-ux-improvements.md
// §3) — тост вместо тихого обновления списка/alert(). Один контейнер на
// страницу, создаётся лениво при первом вызове.
export function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("is-visible"), 10);
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

export function renderFooter() {
  const root = document.getElementById("site-footer");
  if (!root) return;
  root.innerHTML = `
    <footer class="footer">
      <div class="container">
        <p>Онлайн-школа рукии · Лекарь Абу Мухаммад · Основатель школы</p>
        <p><a href="https://t.me/ruqoq">t.me/ruqoq</a></p>
      </div>
    </footer>
  `;
}
