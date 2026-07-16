// Загружает .md файл из content/, парсит простой YAML front matter (плоские
// key: "value" пары — фронт-маттер контента специально простой, без вложенности)
// и рендерит остальное как markdown через marked.js (подключается в каждой
// странице отдельным <script> из CDN — см. pages/book.html/module.html).

import { withBase } from "./base-path.js?v=5";

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_]+):\s*"?(.*?)"?\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  return { meta, body: match[2] };
}

export async function loadMarkdownDoc(path) {
  const res = await fetch(withBase(path));
  if (!res.ok) throw new Error(`Не удалось загрузить ${path}: HTTP ${res.status}`);
  const raw = await res.text();
  return parseFrontMatter(raw);
}

const STATUS_BADGE = {
  certified: { cls: "badge-certified", label: "Подтверждено шейхом" },
  draft: { cls: "badge-draft", label: "Черновик, ждёт подтверждения шейха" },
  archive: { cls: "badge-archive", label: "Вне сертифицируемой программы" },
};

export function statusBadgeHtml(status) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.draft;
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

/** Рендерит doc {meta, body} в контейнер: заголовок, значок статуса, тело markdown. */
export function renderDocInto(container, doc, { showTitle = true } = {}) {
  const html = window.marked
    ? window.marked.parse(doc.body)
    : `<pre style="white-space:pre-wrap; overflow-wrap:anywhere;">${doc.body}</pre>`;
  container.innerHTML = `
    ${showTitle && doc.meta.title ? `<h1>${doc.meta.title}</h1>` : ""}
    <div class="doc-meta">
      ${statusBadgeHtml(doc.meta.status)}
      ${doc.meta.source ? `<p class="form-note">Источник: ${doc.meta.source}</p>` : ""}
    </div>
    <div class="doc-body">${html}</div>
  `;
}
