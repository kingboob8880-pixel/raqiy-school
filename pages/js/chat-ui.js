// Рендер списка сообщений переписки ученик↔наставник — общий для
// pages/dashboard/student.html (свой диалог) и pages/dashboard/admin.html
// (диалог с конкретным учеником в раскрытой строке таблицы). Раньше эта
// логика была продублирована в обоих файлах и рисовала плоский список
// пузырей без времени/дат/группировки — по итогам разбора реальных
// паттернов 1:1-чата (WhatsApp/Telegram/Slack DM) переписано с группировкой
// подряд идущих сообщений одного отправителя, таймштампами и разделителями
// по датам (план улучшения курса, 2026-07-19).

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const GROUP_GAP_MS = 5 * 60 * 1000; // тот же порог, что у Slack — сообщения одного
// отправителя ближе друг к другу по времени визуально объединяются в одну группу.

function toDate(ts) {
  return ts?.toDate ? ts.toDate() : null;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(d) {
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(d) {
  const now = new Date();
  if (isSameDay(d, now)) return "Сегодня";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Вчера";
  const opts = d.getFullYear() === now.getFullYear() ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" };
  return d.toLocaleDateString("ru-RU", opts);
}

/** msgs — массив { from: 'student'|'admin', text, createdAt: Firestore Timestamp|null }. */
export function renderMessages(container, msgs) {
  if (!msgs.length) {
    container.innerHTML = `
      <div class="msg-empty">
        <span class="msg-empty__icon" aria-hidden="true">💬</span>
        <p>Сообщений пока нет</p>
        <p class="form-note">Напишите первое сообщение, чтобы начать переписку</p>
      </div>`;
    return;
  }

  let html = "";
  let lastDateLabel = null;
  let lastFrom = null;
  let lastDate = null;

  for (const m of msgs) {
    const d = toDate(m.createdAt);
    const dateLabel = d ? formatDateLabel(d) : null;

    if (dateLabel && dateLabel !== lastDateLabel) {
      html += `<div class="msg-date-sep"><span>${dateLabel}</span></div>`;
      lastDateLabel = dateLabel;
      lastFrom = null; // новая дата — новая группа, даже если отправитель тот же
    }

    const grouped = lastFrom === m.from && d && lastDate && (d - lastDate) < GROUP_GAP_MS;
    const cls = `msg msg-${m.from === "admin" ? "admin" : "student"}${grouped ? " msg--grouped" : ""}`;
    const time = d ? `<span class="msg__time">${formatTime(d)}</span>` : "";
    html += `<div class="${cls}"><span class="msg__text">${escapeHtml(m.text)}</span>${time}</div>`;

    lastFrom = m.from;
    lastDate = d;
  }

  container.innerHTML = html;
}

/** Textarea с автовысотой + Enter=отправить/Shift+Enter=новая строка + кнопка
 * "Отправить" неактивна, пока поле пустое. Вешается один раз на форму. */
export function wireChatForm(form, textarea, onSend) {
  const btn = form.querySelector('button[type="submit"]');
  const syncDisabled = () => { if (btn) btn.disabled = !textarea.value.trim(); };
  const autoGrow = () => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  syncDisabled();
  textarea.addEventListener("input", () => { syncDisabled(); autoGrow(); });
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textarea.value.trim()) form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;
    if (btn) btn.disabled = true;
    try {
      await onSend(text);
      textarea.value = "";
      textarea.style.height = "auto";
    } finally {
      syncDisabled();
    }
  });
}

/** Мгновенная прокрутка к последнему сообщению — без "прыжка" на глазах. */
export function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}
