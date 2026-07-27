/* Service worker — офлайн-доступ к курсу.
 *
 * Зачем: рукья часто читается там, где связи нет или она плохая, а на сайт
 * заходят в основном с телефона (совет по улучшениям, 2026-07-25). Заодно
 * появляется иконка на домашнем экране и запуск без адресной строки.
 *
 * ГЛАВНОЕ ПРАВИЛО: service worker не должен «залипнуть» и отдавать старый
 * код после обновления сайта. Плохой SW — это неделя жалоб «у меня старая
 * версия и ничего не помогает». Поэтому стратегии выбраны так:
 *
 *   • Файлы с версией в адресе (?v=N) — cache-first. Это безопасно именно
 *     потому, что новая версия = новый адрес: при бампе base.css?v=52 старая
 *     запись просто перестаёт запрашиваться. Так работает весь сайт (см.
 *     project.md про cache-busting).
 *   • HTML-страницы, .md-контент и search-index.json — network-first с
 *     откатом в кэш. Они без версии в адресе, поэтому свежесть важнее
 *     скорости; офлайн отдаём последнее, что видели.
 *   • Firebase, Firestore, Storage — НЕ трогаем вообще. Это авторизованные
 *     запросы с данными учеников: кэшировать их и опасно (чужие данные из
 *     кэша), и бессмысленно (у Firestore своя офлайн-персистентность).
 *   • Библиотеки с CDN (marked, html2canvas, jsPDF) — cache-first: они
 *     прибиты к точной версии в адресе.
 */

const VERSION = "v2";   // бампится при правке sw.js — старые кеши чистятся в activate
const SHELL_CACHE = `rp-shell-${VERSION}`;
const RUNTIME_CACHE = `rp-runtime-${VERSION}`;

// Каталог, из которого отдан сам sw.js — на GitHub Pages это /raqiy-school/,
// локально «/». Считаем от своего адреса, чтобы не дублировать base-path.js.
const BASE = new URL("./", self.location).pathname;

/** Минимальный набор, который должен работать офлайн сразу после установки.
 *  Дальше кэш наполняется тем, что человек реально открывал — предзагружать
 *  118 файлов курса за него мы не вправе (это его трафик). */
const SHELL = [
  "pages/index.html",
  "pages/modules/index.html",
  "pages/about.html",
  "offline.html",
  "manifest.webmanifest",
  "assets/icons/icon-192.png",
].map((p) => BASE + p);

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // addAll падает целиком, если хоть один файл недоступен — кладём по
    // одному, чтобы установка не срывалась из-за одного 404.
    await Promise.all(SHELL.map((url) =>
      cache.add(new Request(url, { cache: "reload" })).catch(() => {})
    ));
    // Не ждём закрытия всех вкладок — обновление должно применяться сразу.
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // Чистим кэши прошлых версий SW
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n.startsWith("rp-") && !n.endsWith(VERSION))
           .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

/** Библиотеки с чужих адресов, которые МОЖНО и НУЖНО кешировать.
 *
 *  ⚠️ ИЗ-ЗА НИХ ОФЛАЙН НЕ РАБОТАЛ ВОВСЕ (найдено аудитом 2026-07-27).
 *
 *  Список «не трогать» ниже отсекал всё с gstatic — правильно для данных
 *  Firebase, но именно оттуда грузится и САМ Firebase SDK. Без сети импорт
 *  падал, а вместе с ним падал весь граф модулей страницы: не отрабатывал
 *  даже layout.js, то есть не появлялось ни шапки, ни навигации, ни
 *  подвала. Оставался голый HTML со словом «Загрузка…». То же с marked
 *  для разметки книг. Сайт обещает офлайн-чтение (есть offline.html и
 *  манифест), а на деле офлайн не открывалась ни одна страница.
 *
 *  Кешировать их безопасно: адрес содержит номер версии, значит новая
 *  версия — это новый адрес, устаревшего ответа быть не может.
 */
function isVendorLib(url) {
  return (
    (url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) ||
    url.hostname === "cdn.jsdelivr.net" ||
    url.hostname === "cdnjs.cloudflare.com"
  );
}

/** Запросы, которые SW не должен касаться ни при каких условиях.
 *  Это ДАННЫЕ: профили учеников, переписка, файлы. В кеше им не место. */
function isBypassed(url) {
  if (isVendorLib(url)) return false;
  const h = url.hostname;
  return (
    h.includes("firebase") ||
    h.includes("firebaseio") ||
    h.includes("firebasestorage") ||
    h.includes("googleapis") ||
    h.includes("gstatic") ||
    h.includes("google.com") ||
    h.includes("api.telegram.org")
  );
}

/** Версионированные ассеты сайта (?v=N) и статика, неизменная по адресу. */
function isImmutable(url) {
  if (isVendorLib(url)) return true;   // адрес содержит версию библиотеки
  if (url.searchParams.has("v")) return true;
  return /\.(png|jpg|jpeg|webp|svg|woff2?|ttf|mp4|ogg|mp3)$/i.test(url.pathname);
}

/** Контент и страницы — свежесть важнее скорости. */
function isFreshFirst(url) {
  return /\.(html|md|json)$/i.test(url.pathname) || url.pathname.endsWith("/");
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok && res.type !== "opaque") {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, res.clone());
  }
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Навигация без сети и без кэша — показываем понятную страницу вместо
    // браузерного «нет интернета».
    if (request.mode === "navigate") {
      const offline = await caches.match(BASE + "offline.html");
      if (offline) return offline;
    }
    throw err;
  }
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isBypassed(url)) return;              // Firebase и прочее — мимо SW
  if (url.origin !== self.location.origin && !isImmutable(url)) return;

  if (isImmutable(url)) { e.respondWith(cacheFirst(request)); return; }
  if (isFreshFirst(url) || request.mode === "navigate") { e.respondWith(networkFirst(request)); return; }
  e.respondWith(networkFirst(request));
});

/** Позволяет странице попросить SW обновиться немедленно. */
self.addEventListener("message", (e) => {
  if (e.data === "skip-waiting") self.skipWaiting();
});
