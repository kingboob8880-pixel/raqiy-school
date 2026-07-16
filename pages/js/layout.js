// Общий header/footer сайта — один источник разметки вместо копирования в
// каждый .html файл. Подключается: <div id="site-header"></div> + этот скрипт.
// Внедряется в страницы на разной глубине вложенности, поэтому все ссылки —
// через withBase() (см. base-path.js), а не относительные.
import { withBase } from "./base-path.js?v=6";
import { initSiteTheme } from "./theme.js?v=6";

export function renderHeader(zone = "learn") {
  const root = document.getElementById("site-header");
  if (!root) return;
  document.documentElement.setAttribute("data-zone", zone);

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
