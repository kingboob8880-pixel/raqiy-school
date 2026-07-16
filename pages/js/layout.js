// Общий header/footer сайта — один источник разметки вместо копирования в
// каждый .html файл. Подключается: <div id="site-header"></div> + этот скрипт.
export function renderHeader(zone = "learn") {
  const root = document.getElementById("site-header");
  if (!root) return;
  document.documentElement.setAttribute("data-zone", zone);
  root.innerHTML = `
    <header class="site-header">
      <div class="container site-header__row">
        <a class="site-header__brand" href="./pages/index.html">
          <span class="site-header__brand-mark">ش</span>
          Онлайн-школа рукии
        </a>
        <nav class="site-header__nav">
          <a href="./pages/modules/index.html">Модули</a>
          <a href="./pages/book.html?doc=./content/archive/index.md">Архив</a>
          <a href="./pages/dashboard/student.html">Кабинет</a>
        </nav>
        <div class="site-header__actions">
          <a class="btn btn-outline btn-sm" href="./pages/auth/login.html">Войти</a>
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
