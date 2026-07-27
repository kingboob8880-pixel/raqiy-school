// Единая тема-система сайта. Переключает html[data-site-theme]
// (design/tokens.css), которая переопределяет и --rp-learn-* (зона "learn" —
// лендинг/модули/книги/вход), и --rp-zone-* для кабинетов ученика/админа
// (project.md §16а, решение 2026-07-16 — "темы должны применяться ко всей
// системе, включая кабинеты"). Переключатель в шапке виден на любой странице.
import { withBase } from "./base-path.js?v=6";
// ⚠️ Весь первый экран лендинга и подписи тем жили здесь зашитыми
// по-русски (аудит 2026-07-27): человек переключал язык, шапка менялась,
// а заголовок, лид и ОБЕ главные кнопки — «Читать бесплатные отрывки» и
// «Купить курс» — оставались русскими. Выглядело как поломка.
import { t } from "./i18n.js?v=34";
const STORAGE_KEY = "raqiy-site-theme";
const DEFAULT_THEME = "emerald";

// Названия переписаны под макет автора (2026-07-26): все три палитры взяты
// из «Дизайн новейщий.html», см. шапку design/tokens.css.
//
// КЛЮЧИ НЕ ПЕРЕИМЕНОВАНЫ намеренно, хотя "split" теперь значит «Графит»,
// а "pattern" — «Свет» (2026-07-27: «Пергамент» заменён палитрой из
// макета автора «светлый v2.html» — почти белые поверхности на песочном
// холсте).
// Ключ хранится в localStorage у каждого, кто уже заходил на сайт: смена
// ключа сбросила бы выбранную тему всем сразу и без причины. Ключ — это
// идентификатор, а не подпись; подпись видит человек, ключ — только код.
export const SITE_THEMES = [
  { key: "emerald", labelKey: "theme.emerald", layout: "centered" },
  { key: "pattern", labelKey: "theme.light", layout: "centered" },
  { key: "split", labelKey: "theme.graphite", layout: "split" },
];

function getTheme(key) {
  return SITE_THEMES.find((t) => t.key === key) || SITE_THEMES[0];
}

function readSavedTheme() {
  try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; }
  catch (e) { return DEFAULT_THEME; }
}

function saveTheme(key) {
  try { localStorage.setItem(STORAGE_KEY, key); } catch (e) { /* приватный режим — не критично */ }
}

/** Красит html[data-site-theme] +, если на странице есть лендинг-хиро, перерисовывает его структуру. */
export function applySiteTheme(themeKey) {
  const theme = getTheme(themeKey);
  document.documentElement.setAttribute("data-site-theme", theme.key);
  saveTheme(theme.key);

  document.querySelectorAll(".theme-switcher__btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === theme.key));
  });

  const onThemeChange = document.getElementById("hero-content") ? renderLandingHero : null;
  if (onThemeChange) onThemeChange(theme);
}

/** Вызывается на КАЖДОЙ странице (из layout.js) — применяет сохранённую тему и строит переключатель в шапке. */
export function initSiteTheme() {
  document.documentElement.setAttribute("data-site-theme", readSavedTheme());

  const switcherRoot = document.getElementById("theme-switcher");
  if (switcherRoot) {
    switcherRoot.innerHTML = `
      <span class="theme-switcher__label">${t("theme.label")}</span>
      ${SITE_THEMES.map((th) => {
        const label = t(th.labelKey);
        return `<button type="button" class="theme-switcher__btn" data-theme="${th.key}" title="${label}" aria-label="${label}"></button>`;
      }).join("")}
    `;
    switcherRoot.querySelectorAll(".theme-switcher__btn").forEach((btn) => {
      btn.addEventListener("click", () => applySiteTheme(btn.dataset.theme));
    });
  }

  const current = getTheme(readSavedTheme());
  switcherRoot?.querySelectorAll(".theme-switcher__btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === current.key));
  });

  if (document.getElementById("hero-content")) renderLandingHero(current);
}

// ---------- Лендинг-хиро: структура меняется вместе с темой (только index.html) ----------

// Тексты первого экрана — через словарь. Значения по умолчанию (русские)
// лежат в i18n.js рядом со всеми остальными строками сайта.
const HERO_COPY = () => ({
  badge: t("landing.badge"),
  title: t("landing.title"),
  lead: t("landing.lead"),
});

function heroActionsHtml() {
  return `
    <div class="hero-actions">
      <a class="btn btn-primary" href="${withBase("/pages/auth/register.html")}">${t("landing.ctaFree")}</a>
      <a class="btn btn-outline" href="https://t.me/ruqoq" target="_blank" rel="noopener">${t("landing.ctaBuy")}</a>
    </div>
  `;
}

function renderCenteredHero() {
  return `
    <div class="landing-hero__inner">
      <span class="badge badge-tinted">${HERO_COPY().badge}</span>
      <h1>${HERO_COPY().title}</h1>
      <p class="landing-hero__lead">${HERO_COPY().lead}</p>
      ${heroActionsHtml()}
    </div>
  `;
}

function renderSplitHero() {
  return `
    <div class="hero-split">
      <div class="hero-split__copy">
        <span class="badge badge-tinted">${HERO_COPY().badge}</span>
        <h1>${HERO_COPY().title}</h1>
        <p class="landing-hero__lead">${HERO_COPY().lead}</p>
        ${heroActionsHtml()}
      </div>
      <div class="hero-split__panel">
        <div class="arabic">وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ</div>
        <p class="translation">${t("landing.ayah")}</p>
        <p class="source">${t("landing.ayahSrc")}</p>
      </div>
    </div>
  `;
}

const FEATURES = () => [
  { icon: "📖", title: t("landing.f1t"), text: t("landing.f1") },
  { icon: "🛡", title: t("landing.f2t"), text: t("landing.f2") },
  { icon: "🎓", title: t("landing.f3t"), text: t("landing.f3") },
];

function renderFeatures() {
  return FEATURES().map((f) => `
    <div class="feature-item">
      <div class="feature-item__icon" aria-hidden="true">${f.icon}</div>
      <h3>${f.title}</h3>
      <p>${f.text}</p>
    </div>
  `).join("");
}

function renderLandingHero(theme) {
  const heroRoot = document.getElementById("hero-content");
  if (heroRoot) heroRoot.innerHTML = theme.layout === "split" ? renderSplitHero() : renderCenteredHero();
  const featuresRoot = document.getElementById("feature-row");
  if (featuresRoot) featuresRoot.innerHTML = renderFeatures();
}
