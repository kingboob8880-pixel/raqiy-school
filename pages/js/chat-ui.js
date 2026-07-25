// Рендер списка сообщений переписки ученик↔наставник — общий для
// pages/dashboard/student.html, pages/dashboard/admin.html и страницы-
// мессенджера pages/dashboard/chat.html.
// v3: кастомный голосовой плеер (волна+play/pause), галочки прочтения,
//     обработка ошибок медиа, i18n дат.
// v4: правка/удаление своего сообщения, подсветка поиска, пометка
//     «изменено» (запрос автора «сделай нормальный чат», 2026-07-25).
import { t, getLang } from "./i18n.js?v=11";

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const GROUP_GAP_MS = 5 * 60 * 1000;

function toDate(ts) { return ts?.toDate ? ts.toDate() : null; }

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(d) {
  return d.toLocaleTimeString(getLang() === "uz" ? "uz-UZ" : getLang() === "en" ? "en-US" : "ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(d) {
  const now = new Date();
  if (isSameDay(d, now)) return t("chat.today");
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return t("chat.yesterday");
  const locale = getLang() === "uz" ? "uz-UZ" : getLang() === "en" ? "en-US" : "ru-RU";
  const opts = d.getFullYear() === now.getFullYear() ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" };
  return d.toLocaleDateString(locale, opts);
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDuration(sec) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fileIcon(mimeType, fileName) {
  if (!mimeType && fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc","docx"].includes(ext)) return "📝";
    if (["xls","xlsx"].includes(ext)) return "📊";
    if (["zip","rar","7z"].includes(ext)) return "📦";
  }
  if (mimeType?.startsWith("image/")) return "🖼️";
  if (mimeType?.startsWith("audio/")) return "🎵";
  if (mimeType?.startsWith("video/")) return "🎬";
  if (mimeType === "application/pdf") return "📄";
  return "📎";
}

// ── SVG-иконки ──
const PLAY_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="7,4 20,12 7,20"/></svg>';
const PAUSE_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';
const CHECK_SVG = '<svg class="msg__tick" viewBox="0 0 16 12" width="12" height="9"><path d="M2 6l3 3L13 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DCHECK_SVG = '<svg class="msg__tick msg__tick--read" viewBox="0 0 21 12" width="16" height="9"><path d="M2 6l3 3L13 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 6l3 3L18 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ── Псевдо-волна голосового сообщения ──
function generateWaveform(duration, count) {
  count = count || 28;
  const bars = [];
  let seed = Math.round((duration || 1) * 1000);
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807 + 13) % 2147483647;
    bars.push(20 + (seed % 80));
  }
  return bars;
}

/** Рендер одного медиа-сообщения. q — строка поиска для подсветки текста. */
function renderMediaContent(m, q) {
  const type = m.type || "text";
  if (type === "voice") {
    const bars = generateWaveform(m.duration);
    const barsHtml = bars.map((h) => `<span class="vp-bar" style="height:${h}%"></span>`).join("");
    return `<div class="msg__media msg__voice-player">
      <audio preload="none" src="${escapeHtml(m.mediaUrl)}"></audio>
      <button type="button" class="vp-btn" aria-label="${escapeHtml(t("chat.play"))}">${PLAY_SVG}</button>
      <div class="vp-wave">${barsHtml}</div>
      <span class="vp-time">${formatDuration(m.duration)}</span>
    </div>`;
  }
  if (type === "video") {
    return `<div class="msg__media msg__video">
      <video controls preload="none" src="${escapeHtml(m.mediaUrl)}" playsinline
        onerror="this.hidden=true;this.nextElementSibling.hidden=false"></video>
      <p class="msg__media-err" hidden>${escapeHtml(t("chat.videoError"))}</p>
    </div>`;
  }
  if (type === "file") {
    const icon = fileIcon(m.mimeType, m.fileName);
    const isImage = m.mimeType?.startsWith("image/");
    let preview = "";
    if (isImage) {
      preview = `<img class="msg__file-preview" src="${escapeHtml(m.mediaUrl)}" alt="${escapeHtml(m.fileName)}" loading="lazy">`;
    }
    return `<div class="msg__media msg__file">
      ${preview}
      <a class="msg__file-card" href="${escapeHtml(m.mediaUrl)}" target="_blank" rel="noopener" download="${escapeHtml(m.fileName)}">
        <span class="msg__file-icon">${icon}</span>
        <span class="msg__file-info">
          <span class="msg__file-name">${escapeHtml(m.fileName)}</span>
          <span class="msg__file-size">${formatFileSize(m.fileSize)}</span>
        </span>
      </a>
    </div>`;
  }
  // text (default)
  return `<span class="msg__text">${highlight(m.text, q)}</span>`;
}

/** Экранирует текст и подсвечивает вхождения поисковой строки. Порядок
 *  важен: сначала escapeHtml, потом вставка <mark> — иначе разметка из
 *  сообщения попала бы в DOM как HTML. */
function highlight(text, q) {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const needle = q.trim();
  if (!needle) return safe;
  const rx = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return safe.replace(rx, (hit) => `<mark class="msg__hit">${hit}</mark>`);
}

/** Меню действий над своим сообщением (⋯ → изменить/удалить). Показываем
 *  только автору: правила Firestore всё равно не дадут тронуть чужое, но
 *  предлагать заведомо запрещённое действие в интерфейсе нельзя. */
function msgActionsHtml(m, isOwn, canEdit) {
  if (!isOwn) return "";
  const editBtn = canEdit
    ? `<button type="button" class="msg-menu__item" data-act="edit">${escapeHtml(t("chat.edit"))}</button>`
    : "";
  return `<div class="msg__actions">
    <button type="button" class="msg__menu-btn" aria-label="${escapeHtml(t("chat.actions"))}" aria-haspopup="true" aria-expanded="false">⋯</button>
    <div class="msg-menu" hidden>
      ${editBtn}
      <button type="button" class="msg-menu__item is-danger" data-act="delete">${escapeHtml(t("chat.delete"))}</button>
    </div>
  </div>`;
}

/** msgs — массив { id, from, text, type?, mediaUrl?, …, createdAt, read, editedAt }.
 *  viewerRole — "student"|"admin" — нужен для галочек прочтения и меню действий.
 *  opts.search — строка поиска: сообщения без совпадения скрываются,
 *                совпадения подсвечиваются (запрос автора, 2026-07-25). */
export function renderMessages(container, msgs, viewerRole, opts = {}) {
  const q = (opts.search || "").trim();

  // Поиск фильтрует список, а не просто подсвечивает: в длинной переписке
  // подсветка без фильтра означала бы ручную прокрутку в поисках жёлтого.
  let list = msgs;
  if (q) {
    const needle = q.toLowerCase();
    list = msgs.filter((m) => {
      if (m.text && m.text.toLowerCase().includes(needle)) return true;
      return !!(m.fileName && m.fileName.toLowerCase().includes(needle));
    });
  }

  if (!list.length) {
    container.innerHTML = q
      ? `<div class="msg-empty">
          <span class="msg-empty__icon" aria-hidden="true">🔍</span>
          <p>${escapeHtml(t("chat.noMatches"))}</p>
        </div>`
      : `<div class="msg-empty">
          <span class="msg-empty__icon" aria-hidden="true">💬</span>
          <p>${escapeHtml(t("chat.empty"))}</p>
          <p class="form-note">${escapeHtml(t("chat.emptyHint"))}</p>
        </div>`;
    return;
  }

  let html = "";
  let lastDateLabel = null;
  let lastFrom = null;
  let lastDate = null;

  for (const m of list) {
    const d = toDate(m.createdAt);
    const dateLabel = d ? formatDateLabel(d) : null;

    if (dateLabel && dateLabel !== lastDateLabel) {
      html += `<div class="msg-date-sep"><span>${dateLabel}</span></div>`;
      lastDateLabel = dateLabel;
      lastFrom = null;
    }

    // При активном поиске группировку не применяем: соседние по результату
    // сообщения могут быть из разных дней/веток, слипшийся "хвост" читался
    // бы как продолжение предыдущего.
    const grouped = !q && lastFrom === m.from && d && lastDate && (d - lastDate) < GROUP_GAP_MS;
    const side = m.from === "admin" ? "admin" : "student";
    const cls = `msg msg-${side}${grouped ? " msg--grouped" : ""}`;

    // Галочки прочтения — только на «своих» сообщениях
    const isOwn = !!viewerRole && m.from === (viewerRole === "admin" ? "admin" : "student");
    const tickHtml = isOwn ? (m.read ? DCHECK_SVG : CHECK_SVG) : "";
    const editedHtml = m.editedAt ? `<span class="msg__edited">${escapeHtml(t("chat.edited"))}</span>` : "";

    const time = d ? `<span class="msg__time">${editedHtml}${formatTime(d)}${tickHtml}</span>` : "";
    // Править можно только текст — у голосового/видео/файла менять нечего.
    const canEdit = (m.type || "text") === "text";
    html += `<div class="${cls}" data-msg-id="${escapeHtml(m.id || "")}">`
      + `${renderMediaContent(m, q)}${time}${msgActionsHtml(m, isOwn, canEdit)}</div>`;

    lastFrom = m.from;
    lastDate = d;
  }

  container.innerHTML = html;
}

/** Подключает меню «изменить/удалить» к контейнеру списка сообщений.
 *  Как и wireVoicePlayers — один раз на контейнер, через делегирование:
 *  renderMessages() перетирает innerHTML при каждом обновлении подписки,
 *  поэтому вешать обработчики на сами кнопки бессмысленно.
 *  onEdit(id, oldText) и onDelete(id) — коллбэки вызывающей страницы. */
export function wireMessageActions(container, { onEdit, onDelete } = {}) {
  if (container._maWired) return;
  container._maWired = true;

  const closeMenus = () => {
    container.querySelectorAll(".msg-menu").forEach((m) => { m.hidden = true; });
    container.querySelectorAll(".msg__menu-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  };
  document.addEventListener("click", (e) => { if (!container.contains(e.target)) closeMenus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

  container.addEventListener("click", async (e) => {
    const toggle = e.target.closest(".msg__menu-btn");
    if (toggle) {
      const menu = toggle.parentElement.querySelector(".msg-menu");
      const willOpen = menu.hidden;
      closeMenus();
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      return;
    }

    const item = e.target.closest(".msg-menu__item");
    if (!item) return;
    const msgEl = item.closest("[data-msg-id]");
    const id = msgEl?.dataset.msgId;
    if (!id) return;
    closeMenus();

    if (item.dataset.act === "delete") {
      if (!confirm(t("chat.confirmDelete"))) return;
      if (onDelete) await onDelete(id);
      return;
    }

    if (item.dataset.act === "edit") {
      const current = msgEl.querySelector(".msg__text")?.textContent || "";
      const next = prompt(t("chat.editPrompt"), current);
      if (next === null) return;
      const trimmed = next.trim();
      // Пустой текст — это удаление, а не правка; молча стирать сообщение
      // по случайному Ctrl+A/Backspace нельзя.
      if (!trimmed || trimmed === current) return;
      if (onEdit) await onEdit(id, trimmed);
    }
  });
}

/** Подключение event delegation для кастомных голосовых плееров.
 *  Вызывается ОДИН раз на контейнер .msg-list — работает для любых
 *  элементов, которые появятся позже через innerHTML (renderMessages). */
export function wireVoicePlayers(container) {
  if (container._vpWired) return;
  container._vpWired = true;

  let curAudio = null;
  let curBtn = null;
  let curWave = null;
  let curTime = null;
  let curDuration = 0;
  let raf = null;

  function resetPlayer() {
    if (curAudio) { curAudio.pause(); curAudio.currentTime = 0; }
    if (curBtn) curBtn.innerHTML = PLAY_SVG;
    if (curWave) curWave.querySelectorAll(".vp-bar").forEach((b) => b.classList.remove("vp-bar--active"));
    if (curTime) curTime.textContent = formatDuration(curDuration);
    if (raf) cancelAnimationFrame(raf);
    curAudio = curBtn = curWave = curTime = null;
    curDuration = 0;
    raf = null;
  }

  function tick() {
    if (!curAudio || curAudio.paused) return;
    const pct = curAudio.duration ? curAudio.currentTime / curAudio.duration : 0;
    if (curWave) {
      const bars = curWave.querySelectorAll(".vp-bar");
      const idx = Math.floor(pct * bars.length);
      bars.forEach((b, i) => b.classList.toggle("vp-bar--active", i <= idx));
    }
    if (curTime) curTime.textContent = formatDuration(curAudio.currentTime);
    raf = requestAnimationFrame(tick);
  }

  container.addEventListener("click", (e) => {
    // ── Play / Pause ──
    const btn = e.target.closest(".vp-btn");
    if (btn) {
      const player = btn.closest(".msg__voice-player");
      if (!player) return;
      const audio = player.querySelector("audio");
      if (!audio) return;

      // Другой плеер → сброс
      if (curAudio && curAudio !== audio) resetPlayer();

      if (audio.paused) {
        audio.play().then(() => {
          curAudio = audio;
          curBtn = btn;
          curWave = player.querySelector(".vp-wave");
          curTime = player.querySelector(".vp-time");
          curDuration = audio.duration || 0;
          btn.innerHTML = PAUSE_SVG;
          raf = requestAnimationFrame(tick);
        }).catch(() => {
          const timeEl = player.querySelector(".vp-time");
          if (timeEl) timeEl.textContent = "⚠";
          btn.disabled = true;
        });

        audio.onended = () => {
          btn.innerHTML = PLAY_SVG;
          if (curWave) curWave.querySelectorAll(".vp-bar").forEach((b) => b.classList.remove("vp-bar--active"));
          const timeEl = player.querySelector(".vp-time");
          if (timeEl) timeEl.textContent = formatDuration(audio.duration || 0);
          curAudio = curBtn = curWave = curTime = null;
          if (raf) cancelAnimationFrame(raf);
          raf = null;
        };

        audio.onerror = () => {
          const timeEl = player.querySelector(".vp-time");
          if (timeEl) timeEl.textContent = "⚠";
          btn.disabled = true;
        };
      } else {
        audio.pause();
        btn.innerHTML = PLAY_SVG;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }
      return;
    }

    // ── Seek по волне ──
    const wave = e.target.closest(".vp-wave");
    if (wave && curAudio) {
      const player = wave.closest(".msg__voice-player");
      if (!player || player.querySelector("audio") !== curAudio) return;
      const rect = wave.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (curAudio.duration) {
        curAudio.currentTime = pct * curAudio.duration;
        tick();
      }
    }
  });
}

/** Подключение формы чата: textarea + отправка текста + медиа-кнопки. */
export function wireChatForm(form, textarea, onSend, onSendMedia) {
  const btn = form.querySelector('button[type="submit"]');
  const syncDisabled = () => { if (btn) btn.disabled = !textarea.value.trim(); };
  const autoGrow = () => { textarea.style.height = "auto"; textarea.style.height = `${textarea.scrollHeight}px`; };

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
    } finally { syncDisabled(); }
  });

  // Медиа-кнопки
  if (onSendMedia) wireMediaButtons(form, onSendMedia);
}

/** Подключение медиа-кнопок (голос/видео/файл) внутри формы чата. */
function wireMediaButtons(form, onSendMedia) {
  const mediaBar = form.querySelector(".chat-media-bar");
  if (!mediaBar) return;

  const voiceBtn = mediaBar.querySelector(".chat-btn-voice");
  const videoBtn = mediaBar.querySelector(".chat-btn-video");
  const fileBtn = mediaBar.querySelector(".chat-btn-file");
  const fileInput = mediaBar.querySelector(".chat-file-input");
  const recIndicator = form.querySelector(".chat-rec-indicator");

  let mediaRecorder = null;
  let recordedChunks = [];
  let recordingType = null;
  let recordingStart = 0;
  let recTimer = null;

  function updateRecUI(active) {
    if (recIndicator) recIndicator.hidden = !active;
    if (voiceBtn) voiceBtn.classList.toggle("is-recording", active && recordingType === "voice");
    if (videoBtn) videoBtn.classList.toggle("is-recording", active && recordingType === "video");
    const textarea = form.querySelector("textarea");
    const submitBtn = form.querySelector('button[type="submit"]');
    if (textarea) textarea.hidden = active;
    if (submitBtn) submitBtn.hidden = active;
  }

  function updateTimer() {
    if (!recIndicator) return;
    const sec = Math.floor((Date.now() - recordingStart) / 1000);
    const label = recIndicator.querySelector(".chat-rec-time");
    if (label) label.textContent = formatDuration(sec);
  }

  async function startRecording(type) {
    try {
      const constraints = type === "video"
        ? { audio: true, video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mimeType = type === "video"
        ? (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm")
        : (MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm");

      mediaRecorder = new MediaRecorder(stream, { mimeType });
      recordedChunks = [];
      recordingType = type;
      recordingStart = Date.now();

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        const duration = Math.round((Date.now() - recordingStart) / 1000);
        stream.getTracks().forEach((tr) => tr.stop());
        clearInterval(recTimer);
        updateRecUI(false);

        if (recordedChunks.length === 0) return;
        const blob = new Blob(recordedChunks, { type: mimeType });
        const fileName = type === "video" ? `video_${Date.now()}.webm` : `voice_${Date.now()}.webm`;
        const file = new File([blob], fileName, { type: mimeType });

        setMediaBarBusy(true);
        try { await onSendMedia(file, type, duration); }
        finally { setMediaBarBusy(false); }
      };

      mediaRecorder.start();
      updateRecUI(true);
      recTimer = setInterval(updateTimer, 500);
    } catch (err) {
      console.warn("getUserMedia error:", err);
      alert(type === "video" ? t("chat.camError") : t("chat.micError"));
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  }

  function setMediaBarBusy(busy) {
    mediaBar.querySelectorAll("button").forEach((b) => { b.disabled = busy; });
    if (fileInput) fileInput.disabled = busy;
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording" && recordingType === "voice") stopRecording();
      else if (!mediaRecorder || mediaRecorder.state === "inactive") startRecording("voice");
    });
  }

  if (videoBtn) {
    videoBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording" && recordingType === "video") stopRecording();
      else if (!mediaRecorder || mediaRecorder.state === "inactive") startRecording("video");
    });
  }

  if (recIndicator) {
    const stopBtn = recIndicator.querySelector(".chat-rec-stop");
    if (stopBtn) stopBtn.addEventListener("click", stopRecording);
  }

  if (fileBtn && fileInput) {
    fileBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      fileInput.value = "";
      setMediaBarBusy(true);
      try { await onSendMedia(file, "file", null); }
      finally { setMediaBarBusy(false); }
    });
  }
}

export function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

/** HTML-разметка медиа-кнопок для вставки в форму чата. */
export function mediaBarHtml() {
  return `<div class="chat-media-bar">
  <button type="button" class="chat-media-btn chat-btn-voice" title="${escapeHtml(t("chat.recVoice"))}" aria-label="${escapeHtml(t("chat.recVoice"))}">🎤</button>
  <button type="button" class="chat-media-btn chat-btn-video" title="${escapeHtml(t("chat.recVideo"))}" aria-label="${escapeHtml(t("chat.recVideo"))}">📹</button>
  <button type="button" class="chat-media-btn chat-btn-file" title="${escapeHtml(t("chat.attachFile"))}" aria-label="${escapeHtml(t("chat.attachFile"))}">📎</button>
  <input type="file" class="chat-file-input" hidden>
</div>
<div class="chat-rec-indicator" hidden>
  <span class="chat-rec-dot"></span>
  <span class="chat-rec-time">0:00</span>
  <button type="button" class="btn btn-sm chat-rec-stop" style="margin-left:auto;">${escapeHtml(t("chat.stop"))}</button>
</div>`;
}
