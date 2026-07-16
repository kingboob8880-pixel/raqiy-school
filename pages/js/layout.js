// Общий header/footer сайта — один источник разметки вместо копирования в
// каждый .html файл. Подключается: <div id="site-header"></div> + этот скрипт.
// Внедряется в страницы на разной глубине вложенности, поэтому все ссылки —
// через withBase() (см. base-path.js), а не относительные.
import { withBase } from "./base-path.js";

export function renderHeader(zone = "learn") {
  const root = document.getElementById("site-header");
  if (!root) return;
  document.documentElement.setAttribute("data-zone", zone);
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
          <a class="btn btn-outline btn-sm" href="${withBase("/pages/auth/login.html")}">Войти</a>
        </div>
      </div>
    </header>
  `;
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
