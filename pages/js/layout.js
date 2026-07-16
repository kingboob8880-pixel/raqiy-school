// Общий header/footer сайта — один источник разметки вместо копирования в
// каждый .html файл. Подключается: <div id="site-header"></div> + этот скрипт.
// Внедряется в страницы на разной глубине вложенности, поэтому все ссылки —
// через withBase() (см. base-path.js), а не относительные.
import { withBase } from "./base-path.js?v=4";
import { initSiteTheme } from "./theme.js?v=4";

export function renderHeader(zone = "learn") {
  const root = document.getElementById("site-header");
  if (!root) return;
  document.documentElement.setAttribute("data-zone", zone);

  // Переключатель тем (project.md, решение 2026-07-16) — только в зоне
  // "learn" (лендинг/модули/книги/вход): кабинеты ученика/админа живут в
  // своих палитрах (§16а) и темами лендинга не управляются.
  const themeSwitcherHtml = zone === "learn"
    ? `<div class="theme-switcher" id="theme-switcher"></div>`
    : "";

  root.innerHTML = `
    <header class="site-header">
      <div class="container site-header__row">
        <a class="site-header__brand" href="${withBase("/pages/index.html")}">
          <span class="site-header__brand-mark">ش</span>
          Онлайн-школа рукии
        </a>
        <nav class="site-header__nav">
          <a href="${withBase("/pages/modules/index.html")}">Модули</a>
          <a href="${withBase("/pages/book.html")}?doc=${encodeURIComponent("/content/archive/index.md")}">Архив</a>
          <a href="${withBase("/pages/dashboard/student.html")}">Кабинет</a>
        </nav>
        <div class="site-header__actions">
          ${themeSwitcherHtml}
          <a class="btn btn-outline btn-sm" href="${withBase("/pages/auth/login.html")}">Войти</a>
        </div>
      </div>
    </header>
  `;

  initSiteTheme();
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
