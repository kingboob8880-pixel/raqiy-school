// Рендер списка сообщений переписки ученик↔наставник — общий для
// pages/dashboard/student.html и pages/dashboard/admin.html.
// v2: поддержка голосовых, видео и файловых сообщений.

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const GROUP_GAP_MS = 5 * 60 * 1000;

function toDate(ts) { return ts?.toDate ? ts.toDate() : null; }

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(d) {
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(d) {
  const now = new Date();
  if (isSameDay(d, now)) return "Сегодня";
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Вчера";
  const opts = d.getFullYear() === now.getFullYear() ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" };
  return d.toLocaleDateString("ru-RU", opts);
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " КБ";
  return (bytes / 1048576).toFixed(1) + " МБ";
}

function formatDuration(sec) {
  if (!sec) return "0:00";
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

/** Рендер одного медиа-сообщения. */
function renderMediaContent(m) {
  const type = m.type || "text";
  if (type === "voice") {
    return `<div class="msg__media msg__voice">
      <audio controls preload="metadata" src="${escapeHtml(m.mediaUrl)}"></audio>
      <span class="msg__duration">${formatDuration(m.duration)}</span>
    </div>`;
  }
  if (type === "video") {
    return `<div class="msg__media msg__video">
      <video controls preload="metadata" src="${escapeHtml(m.mediaUrl)}" playsinline></video>
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
  return `<span class="msg__text">${escapeHtml(m.text)}</span>`;
}

/** msgs — массив { from, text, type?, mediaUrl?, fileName?, fileSize?, duration?, mimeType?, createdAt }. */
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
      lastFrom = null;
    }

    const grouped = lastFrom === m.from && d && lastDate && (d - lastDate) < GROUP_GAP_MS;
    const cls = `msg msg-${m.from === "admin" ? "admin" : "student"}${grouped ? " msg--grouped" : ""}`;
    const time = d ? `<span class="msg__time">${formatTime(d)}</span>` : "";
    html += `<div class="${cls}">${renderMediaContent(m)}${time}</div>`;

    lastFrom = m.from;
    lastDate = d;
  }

  container.innerHTML = html;
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
  let recordingType = null; // 'voice' | 'video'
  let recordingStart = 0;
  let recTimer = null;

  function updateRecUI(active) {
    if (recIndicator) recIndicator.hidden = !active;
    if (voiceBtn) voiceBtn.classList.toggle("is-recording", active && recordingType === "voice");
    if (videoBtn) videoBtn.classList.toggle("is-recording", active && recordingType === "video");
    // Скрываем textarea и кнопку отправки при записи
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
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(recTimer);
        updateRecUI(false);

        if (recordedChunks.length === 0) return;
        const blob = new Blob(recordedChunks, { type: mimeType });
        const ext = type === "video" ? "webm" : "webm";
        const fileName = type === "video" ? `video_${Date.now()}.${ext}` : `voice_${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: mimeType });

        // Визуальная индикация загрузки
        setMediaBarBusy(true);
        try {
          await onSendMedia(file, type, duration);
        } finally {
          setMediaBarBusy(false);
        }
      };

      mediaRecorder.start();
      updateRecUI(true);
      recTimer = setInterval(updateTimer, 500);
    } catch (err) {
      console.warn("getUserMedia error:", err);
      alert(type === "video"
        ? "Не удалось получить доступ к камере и микрофону"
        : "Не удалось получить доступ к микрофону");
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }

  function setMediaBarBusy(busy) {
    mediaBar.querySelectorAll("button").forEach((b) => { b.disabled = busy; });
    if (fileInput) fileInput.disabled = busy;
  }

  // Голос
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording" && recordingType === "voice") {
        stopRecording();
      } else if (!mediaRecorder || mediaRecorder.state === "inactive") {
        startRecording("voice");
      }
    });
  }

  // Видео
  if (videoBtn) {
    videoBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording" && recordingType === "video") {
        stopRecording();
      } else if (!mediaRecorder || mediaRecorder.state === "inactive") {
        startRecording("video");
      }
    });
  }

  // Кнопка «Остановить» в индикаторе записи
  if (recIndicator) {
    const stopBtn = recIndicator.querySelector(".chat-rec-stop");
    if (stopBtn) stopBtn.addEventListener("click", stopRecording);
  }

  // Файл
  if (fileBtn && fileInput) {
    fileBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      fileInput.value = "";
      setMediaBarBusy(true);
      try {
        await onSendMedia(file, "file", null);
      } finally {
        setMediaBarBusy(false);
      }
    });
  }
}

export function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

/** HTML-разметка медиа-кнопок для вставки в форму чата. */
export function mediaBarHtml() {
  return `<div class="chat-media-bar">
  <button type="button" class="chat-media-btn chat-btn-voice" title="Голосовое сообщение" aria-label="Записать голосовое сообщение">🎤</button>
  <button type="button" class="chat-media-btn chat-btn-video" title="Видеообращение" aria-label="Записать видеообращение">📹</button>
  <button type="button" class="chat-media-btn chat-btn-file" title="Прикрепить файл" aria-label="Прикрепить файл">📎</button>
  <input type="file" class="chat-file-input" hidden>
</div>
<div class="chat-rec-indicator" hidden>
  <span class="chat-rec-dot"></span>
  <span class="chat-rec-time">0:00</span>
  <button type="button" class="btn btn-sm chat-rec-stop" style="margin-left:auto;">Остановить</button>
</div>`;
}
