// Три темы лендинга (project.md, "Лендинг - новый фон.html"). Тема A выбрана
// по умолчанию (2026-07-16), переключатель позволяет попробовать B/C и
// запоминает выбор в localStorage — только для главной страницы.
const STORAGE_KEY = "raqiy-landing-theme";
const DEFAULT_THEME = "emerald";

export const LANDING_THEMES = [
  { key: "emerald", label: "Тёмный изумруд", layout: "centered" },
  { key: "pattern", label: "Светлый паттерн", layout: "centered" },
  { key: "split", label: "Сплит с каллиграфией", layout: "split" },
];

function getTheme(key) {
  return LANDING_THEMES.find((t) => t.key === key) || LANDING_THEMES[0];
}

const HERO_COPY = {
  badge: "Курс от лекаря Абу Мухаммада",
  title: "Стань полноценным заклинателем — от убеждённости сердца до приёма пациентов",
  lead: "11 модулей: от основ якына и подлинных хадисов о рукье до итоговой практики под супервизией наставника и работы в системе диагностики и лечения RUKYA Pro.",
};

function heroActionsHtml() {
  return `
    <div class="hero-actions">
      <a class="btn btn-primary" href="auth/register.html">Начать бесплатный уровень</a>
      <a class="btn btn-outline" href="https://t.me/ruqoq" target="_blank" rel="noopener">Купить продвинутый уровень</a>
    </div>
  `;
}

function renderCenteredHero() {
  return `
    <div class="landing-hero__inner">
      <span class="badge">${HERO_COPY.badge}</span>
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
        <span class="badge">${HERO_COPY.badge}</span>
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

export function applyLandingTheme(themeKey) {
  const theme = getTheme(themeKey);
  // На <body>, а не на обёртке хиро — так тема окрашивает и #site-header
  // (обычная неподвижная полоса сайта, не участвует в скруглённой карточке
  // хиро/фич, чтобы не ломать position: sticky через overflow:hidden предка).
  document.body.setAttribute("data-landing-theme", theme.key);

  const heroRoot = document.getElementById("hero-content");
  if (heroRoot) heroRoot.innerHTML = theme.layout === "split" ? renderSplitHero() : renderCenteredHero();

  const featuresRoot = document.getElementById("feature-row");
  if (featuresRoot) featuresRoot.innerHTML = renderFeatures();

  document.querySelectorAll(".theme-switcher__btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === theme.key));
  });

  try { localStorage.setItem(STORAGE_KEY, theme.key); } catch (e) { /* приватный режим — не критично */ }
}

export function initThemeSwitcher(switcherRootId = "theme-switcher") {
  const root = document.getElementById(switcherRootId);
  if (root) {
    root.innerHTML = `
      <span class="theme-switcher__label">Оформление:</span>
      ${LANDING_THEMES.map((t) => `<button type="button" class="theme-switcher__btn" data-theme="${t.key}">${t.label}</button>`).join("")}
    `;
    root.querySelectorAll(".theme-switcher__btn").forEach((btn) => {
      btn.addEventListener("click", () => applyLandingTheme(btn.dataset.theme));
    });
  }

  let saved = DEFAULT_THEME;
  try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; } catch (e) { /* приватный режим */ }
  applyLandingTheme(saved);
}
