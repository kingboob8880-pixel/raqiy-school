// Единая тема-система сайта. Переключает html[data-site-theme]
// (design/tokens.css), которая переопределяет и --rp-learn-* (зона "learn" —
// лендинг/модули/книги/вход), и --rp-zone-* для кабинетов ученика/админа
// (project.md §16а, решение 2026-07-16 — "темы должны применяться ко всей
// системе, включая кабинеты"). Переключатель в шапке виден на любой странице.
import { withBase } from "./base-path.js?v=6";
const STORAGE_KEY = "raqiy-site-theme";
const DEFAULT_THEME = "emerald";

export const SITE_THEMES = [
  { key: "emerald", label: "Тёмный изумруд", layout: "centered" },
  { key: "pattern", label: "Светлый паттерн", layout: "centered" },
  { key: "split", label: "Сплит с каллиграфией", layout: "split" },
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
      <span class="theme-switcher__label">Тема:</span>
      ${SITE_THEMES.map((t) => `<button type="button" class="theme-switcher__btn" data-theme="${t.key}" title="${t.label}" aria-label="${t.label}"></button>`).join("")}
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

const HERO_COPY = {
  badge: "Курс от лекаря Абу Мухаммада",
  title: "Стань полноценным заклинателем — от убеждённости сердца до приёма пациентов",
  lead: "11 модулей: от основ якына и подлинных хадисов о рукье до итоговой практики под супервизией наставника и работы в системе диагностики и лечения RUKYA Pro.",
};

function heroActionsHtml() {
  return `
    <div class="hero-actions">
      <a class="btn btn-primary" href="${withBase("/pages/auth/register.html")}">Читать бесплатные отрывки</a>
      <a class="btn btn-outline" href="https://t.me/ruqoq" target="_blank" rel="noopener">Купить курс — 30 000 ₽</a>
    </div>
  `;
}

function renderCenteredHero() {
  return `
    <div class="landing-hero__inner">
      <span class="badge badge-tinted">${HERO_COPY.badge}</span>
      <h1>${HERO_COPY.title}</h1>
      <p class="landing-hero__lead">${HERO_COPY.lead}</p>
      ${heroActionsHtml()}
    </div>
  `;
}

function renderSplitHero() {
  return `
    <div class="hero-split">
      <div class="hero-split__copy">
        <span class="badge badge-tinted">${HERO_COPY.badge}</span>
        <h1>${HERO_COPY.title}</h1>
        <p class="landing-hero__lead">${HERO_COPY.lead}</p>
        ${heroActionsHtml()}
      </div>
      <div class="hero-split__panel">
        <div class="arabic">وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ</div>
        <p class="translation">«…то, что является исцелением и милостью для верующих»</p>
        <p class="source">Сура аль-Исра · 17:82</p>
      </div>
    </div>
  `;
}

const FEATURES = [
  { icon: "📖", title: "Только проверенные источники", text: "Каждый фрагмент курса промаркирован: прямая цитата Корана/Сунны, устоявшаяся практика, или авторский метод — открыто, без выдачи одного за другое." },
  { icon: "🛡", title: "Безопасность пациента — не опция", text: "Диагностика — никогда через боль/надавливание. Страдание пациента — никогда не игнорируется. Это встроено в курс, а не добавлено потом." },
  { icon: "🎓", title: "От теории к практике", text: "Финальные модули — разбор реальных кейсов под супервизией и работа в системе RUKYA Pro, где выпускник ведёт приём настоящих пациентов." },
];

function renderFeatures() {
  return FEATURES.map((f) => `
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
