// Общий header/footer сайта — один источник разметки вместо копирования в
// каждый .html файл. Подключается: <div id="site-header"></div> + этот скрипт.
// Внедряется в страницы на разной глубине вложенности, поэтому все ссылки —
// через withBase() (см. base-path.js), а не относительные.
import { withBase } from "./base-path.js?v=6";
import { initSiteTheme } from "./theme.js?v=8";
import { watchAuth, isAdmin, getAdminProfile, getStudentProfile } from "../../integration/auth.js?v=11";
import { LANGS, getLang, setLang, t } from "./i18n.js?v=26";
import { initNotifications, stopNotifications } from "./notifications.js?v=8";

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
    skipLink.textContent = t("skip.link");
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

  // Переключатель языка — три кнопки РУ/EN/UZ в углу шапки.
  const currentLang = getLang();
  const langBtnsHtml = LANGS.map((l) =>
    `<button type="button" class="lang-switcher__btn${l.code === currentLang ? " is-active" : ""}" data-lang="${l.code}" title="${l.full}">${l.label}</button>`
  ).join("");
  const langSwitcherHtml = `<div class="lang-switcher">${langBtnsHtml}</div>`;

  root.innerHTML = `
    <header class="site-header">
      <div class="container site-header__row">
        <a class="site-header__brand" href="${withBase("/pages/index.html")}">
          <span class="site-header__brand-mark">ش</span>
          ${t("site.title")}
        </a>
        <nav class="site-header__nav" id="site-nav">
          <a data-nav="about" href="${withBase("/pages/about.html")}"><span aria-hidden="true">🧑‍⚕️</span>${t("nav.about")}</a>
          <a data-nav="modules" href="${withBase("/pages/modules/index.html")}"><span aria-hidden="true">📖</span>${t("nav.modules")}</a>
          <a data-nav="practice" href="${withBase("/pages/practice/index.html")}"><span aria-hidden="true">🏋</span>${t("nav.practice")}</a>
          <a data-nav="tests" href="${withBase("/pages/tests/index.html")}"><span aria-hidden="true">📝</span>${t("nav.tests")}</a>
          <a data-nav="flashcards" href="${withBase("/pages/flashcards/index.html")}"><span aria-hidden="true">🃏</span>${t("nav.flashcards")}</a>
          <a data-nav="glossary" href="${withBase("/pages/glossary/index.html")}"><span aria-hidden="true">📘</span>${t("nav.glossary")}</a>
          <a data-nav="dashboard" href="${withBase("/pages/dashboard/student.html")}"><span aria-hidden="true">👤</span>${t("nav.dashboard")}</a>
        </nav>
        <div class="site-header__actions">
          <!-- Колокольчик монтируется только вошедшему ученику (initNotifications) -->
          <div class="notif-root" id="notif-root"></div>
          ${langSwitcherHtml}
          ${themeSwitcherHtml}
          <a class="btn btn-outline btn-sm" id="auth-btn" href="${withBase("/pages/auth/login.html")}">${t("auth.login")}</a>
          <button type="button" class="site-header__menu-btn" id="site-nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="${t("menu.open")}">
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>
    </header>
  `;

  // Обработчики переключателя языка
  root.querySelectorAll(".lang-switcher__btn").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  // Подсветка активного пункта меню — по сегменту пути, не по точному URL
  // (страница книги/модуля живёт под /pages/modules/ или /pages/book.html,
  // поэтому сравниваем сегмент, а не href целиком).
  const path = location.pathname;
  const navMatch = {
    about: path.includes("/pages/about.html"),
    modules: path.includes("/pages/modules/") || path.includes("/pages/book.html"),
    practice: path.includes("/pages/practice/"),
    tests: path.includes("/pages/tests/"),
    flashcards: path.includes("/pages/flashcards/"),
    glossary: path.includes("/pages/glossary/"),
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
    // aria-label меняется вместе с состоянием: раньше кнопка всегда
    // говорила "Открыть меню", даже когда меню уже открыто и клик его
    // закрывает — скринридер объявлял неверное действие (аудит 2026-07-25).
    const setNavLabel = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
    };
    const closeNav = () => { navEl.classList.remove("is-open"); setNavLabel(false); };
    navToggle.addEventListener("click", () => {
      setNavLabel(navEl.classList.toggle("is-open"));
    });
    navEl.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
    document.addEventListener("click", (e) => {
      if (navEl.classList.contains("is-open") && !navEl.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  const authBtn = root.querySelector("#auth-btn");
  const notifRoot = root.querySelector("#notif-root");
  // Колокольчик уведомлений на любой странице сайта (запрос автора,
  // 2026-07-25). Раньше здесь висел отдельный значок непрочитанных
  // сообщений — он заменён колокольчиком: два счётчика рядом (отдельно
  // сообщения и отдельно всё остальное) показывали бы разные числа про
  // пересекающиеся вещи и сбивали бы с толку. Теперь одно число на все
  // события: ответ наставника, открытие доступа, сертификат, RUKYA Pro.
  //
  // Наставнику колокольчик не нужен: у него переписка не одна, его
  // счётчики живут на chat.html и в кабинете администратора.
  watchAuth(async (user) => {
    stopNotifications();

    if (!user) {
      if (authBtn) {
        authBtn.textContent = t("auth.login");
        authBtn.href = withBase("/pages/auth/login.html");
      }
      if (notifRoot) notifRoot.innerHTML = "";
      return;
    }

    // Пока не знаем роль — показываем нейтральное «Кабинет», а не кусок
    // email: до этой правки в шапке у автора висело «4851» (скриншот,
    // 2026-07-25) — это email до «собаки», который сайт выдавал за имя.
    if (authBtn) authBtn.textContent = t("nav.dashboard");

    let admin = false;
    try { admin = await isAdmin(user.uid); }
    catch { /* нет связи — оставляем нейтральную подпись и без колокольчика */ return; }

    if (authBtn) {
      if (admin) {
        // Админа кнопка вела в кабинет УЧЕНИКА — он попадал не туда и видел
        // чужой по смыслу экран. Ведём в админский и подписываем по роли.
        let name = "";
        try { name = (await getAdminProfile(user.uid))?.name || ""; }
        catch { /* имя необязательно — хватит слова «Админ» */ }
        authBtn.textContent = name || t("nav.admin");
        authBtn.href = withBase("/pages/dashboard/admin.html");
      } else {
        // У ученика имя есть в профиле — оно человеческое, в отличие от
        // email. displayName в этом проекте не заполняется при регистрации.
        let name = "";
        try { name = (await getStudentProfile(user.uid))?.name || ""; }
        catch { /* профиль недоступен — останется «Кабинет» */ }
        authBtn.textContent = name || user.displayName || t("nav.dashboard");
        authBtn.href = withBase("/pages/dashboard/student.html");
      }
    }

    if (!notifRoot) return;
    // Наставнику колокольчик не нужен: у него переписка не одна.
    if (admin) { notifRoot.innerHTML = ""; return; }

    initNotifications(notifRoot, user.uid);
  });

  initSiteTheme();
  initOffline();
  trackHeaderHeight(root);
}

/** Держит --rp-header-h равной реальной высоте шапки.
 *
 *  Нужно странице-мессенджеру: она занимает calc(100dvh - высота шапки), и
 *  захардкоженное значение врало бы при переносе шапки на две строки, при
 *  другом масштабе браузера или крупном системном шрифте — переписка либо
 *  вылезала бы за экран, либо не добирала высоту.
 *
 *  ResizeObserver, а не разовое измерение: шапка меняет высоту при повороте
 *  телефона и при открытии мобильного меню. */
function trackHeaderHeight(root) {
  const header = root.querySelector(".site-header");
  if (!header) return;
  const apply = () => {
    document.documentElement.style.setProperty("--rp-header-h", `${header.offsetHeight}px`);
  };
  apply();
  if ("ResizeObserver" in window) new ResizeObserver(apply).observe(header);
  else window.addEventListener("resize", apply);
}

/** Офлайн-режим и иконка на домашнем экране (совет по улучшениям,
 *  2026-07-25). Манифест и ссылка на иконку подставляются здесь, а не в 15
 *  html-файлах: их набор один на весь сайт, дублировать в каждом — значит
 *  однажды разойтись.
 *
 *  Регистрируем SW только на https (или localhost) — по спецификации на
 *  http он всё равно недоступен, а без проверки в консоли сыпались бы
 *  ошибки при локальном просмотре через file://. */
function initOffline() {
  if (!document.querySelector('link[rel="manifest"]')) {
    const m = document.createElement("link");
    m.rel = "manifest";
    m.href = withBase("/manifest.webmanifest");
    document.head.appendChild(m);

    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = withBase("/assets/icons/apple-touch-icon.png");
    document.head.appendChild(apple);

    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#8f6a22";
    document.head.appendChild(theme);
  }

  if (!("serviceWorker" in navigator)) return;
  const secure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!secure) return;

  navigator.serviceWorker.register(withBase("/sw.js"), { scope: withBase("/") })
    .then((reg) => {
      // Если пришла новая версия, применяем её сразу: сайт обновляется часто,
      // и «залипший» старый код — худшее, что может сделать SW.
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (sw) sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            sw.postMessage("skip-waiting");
          }
        });
      });
    })
    .catch((err) => console.warn("service worker", err));
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
        <p>${t("footer.text")}</p>
        <p><a href="https://t.me/ruqoq">t.me/ruqoq</a></p>
      </div>
    </footer>
  `;
}
