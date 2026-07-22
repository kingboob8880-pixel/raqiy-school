// Рендер списка сообщений переписки ученик↔наставник — общий для
// pages/dashboard/student.html и pages/dashboard/admin.html.
// v3: кастомный голосовой плеер (волна+play/pause), галочки прочтения,
//     обработка ошибок медиа, i18n дат.
import { t, getLang } from "./i18n.js?v=3";

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

/** Рендер одного медиа-сообщения. */
function renderMediaContent(m) {
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
  return `<span class="msg__text">${escapeHtml(m.text)}</span>`;
}

/** msgs — массив { from, text, type?, mediaUrl?, …, createdAt, read }.
 *  viewerRole — "student"|"admin" — нужен для галочек прочтения. */
export function renderMessages(container, msgs, viewerRole) {
  if (!msgs.length) {
    container.innerHTML = `
      <div class="msg-empty">
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

  for (const m of msgs) {
    const d = toDate(m.createdAt);
    const dateLabel = d ? formatDateLabel(d) : null;

    if (dateLabel && dateLabel !== lastDateLabel) {
      html += `<div class="msg-date-sep"><span>${dateLabel}</span></div>`;
      lastDateLabel = dateLabel;
      lastFrom = null;
    }

    const grouped = lastFrom === m.from && d && lastDate && (d - lastDate) < GROUP_GAP_MS;
    const side = m.from === "admin" ? "admin" : "student";
    const cls = `msg msg-${side}${grouped ? " msg--grouped" : ""}`;

    // Галочки прочтения — только на «своих» сообщениях
    const isOwn = viewerRole && m.from === (viewerRole === "admin" ? "admin" : "student");
    const tickHtml = isOwn ? (m.read ? DCHECK_SVG : CHECK_SVG) : "";

    const time = d ? `<span class="msg__time">${formatTime(d)}${tickHtml}</span>` : "";
    html += `<div class="${cls}">${renderMediaContent(m)}${time}</div>`;

    lastFrom = m.from;
    lastDate = d;
  }

  container.innerHTML = html;
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
