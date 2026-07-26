// Печать и выгрузка в PDF — общий код для страницы урока (pages/book.html) и
// страницы модуля (pages/modules/module.html). Запрос автора «чтобы можно
// было распечатывать и скачивать в красивом PDF во всех модулях»
// (2026-07-25): до этого кнопки были только на странице урока, а у модуля не
// было вообще, и сам PDF собирался скриншотом через canvas.
//
// Два способа получить PDF — сознательно оба (решение автора):
//
//   1. printDoc() — печать браузера, «Сохранить как PDF». Настоящий текст:
//      выделяется, ищется, арабская вязь рендерится настоящим шрифтом, файл
//      ~200 КБ вместо десятков МБ и не мылится при увеличении. Всё
//      оформление — в @media print (design/base.css), здесь только вставка
//      титульного листа и колонтитула.
//
//   2. downloadPdf() — старый одноклик: html2canvas снимает страницу и
//      jsPDF нарезает картинку на листы A4. Внутри именно картинка, поэтому
//      текст не выделяется и файл тяжёлый — оставлено как быстрый вариант
//      для тех, кому диалог печати неудобен.
import { t } from "./i18n.js?v=20";

/** Экранирование — в титульный лист попадают названия из front-matter и
 *  modules-data.js, вставляются через innerHTML. */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Титульный лист и колонтитул создаются перед печатью и убираются сразу
 *  после — держать их в DOM постоянно незачем, а лишние узлы в начале
 *  документа мешали бы экранным читалкам. */
function buildPrintFurniture({ title, eyebrow, meta }) {
  const cover = document.createElement("div");
  cover.className = "print-cover";
  cover.setAttribute("aria-hidden", "true");
  cover.innerHTML = `
    <p class="print-cover__school">${esc(t("site.title"))}</p>
    <p class="print-cover__mark">ش</p>
    ${eyebrow ? `<p class="print-cover__eyebrow">${esc(eyebrow)}</p>` : ""}
    <h1 class="print-cover__title">${esc(title)}</h1>
    <hr class="print-cover__rule">
    <p class="print-cover__author">${esc(t("print.author"))}</p>
    ${meta ? `<p class="print-cover__meta">${esc(meta)}</p>` : ""}
    <p class="print-cover__foot">${esc(t("print.foot"))}</p>
  `;

  const runhead = document.createElement("div");
  runhead.className = "print-runhead";
  runhead.setAttribute("aria-hidden", "true");
  runhead.innerHTML = `
    <span>${esc(t("site.title"))}</span>
    <span class="print-runhead__right">${esc(title)}</span>
  `;

  return { cover, runhead };
}

/** Печать с титульным листом. onAfter вызывается, когда диалог закрыт —
 *  и по событию afterprint, и по таймеру: Safari до сих пор не всегда
 *  присылает afterprint, а без уборки титульный лист остался бы в DOM. */
export function printDoc({ title, eyebrow, meta } = {}) {
  const { cover, runhead } = buildPrintFurniture({ title, eyebrow, meta });
  document.body.prepend(runhead);
  document.body.prepend(cover);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    cover.remove();
    runhead.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  setTimeout(cleanup, 60000);

  // Даём браузеру кадр на применение печатных стилей к только что
  // вставленным узлам — без этого Chrome иногда печатает первый лист
  // без титульного оформления.
  requestAnimationFrame(() => {
    window.print();
    // Если afterprint не пришёл (Safari), уберём через несколько секунд
    // после возврата фокуса на страницу.
    setTimeout(cleanup, 3000);
  });
}

/** Ленивая загрузка библиотеки с CDN — тянем только если человек реально
 *  нажал «быстрое скачивание», а не на каждом открытии урока. */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`script failed: ${src}`));
    document.head.appendChild(s);
  });
}

/** Быстрое скачивание одним кликом: снимок страницы, нарезанный на A4.
 *  root — элемент с текстом, fileName — без расширения.
 *  Внутри картинка (текст не выделяется) — это цена одного клика. */
export async function downloadPdf(root, fileName, btn) {
  const label = btn ? btn.textContent : null;
  if (btn) { btn.disabled = true; btn.textContent = t("pdf.preparing"); }
  try {
    if (!window.html2canvas) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    if (!window.jspdf) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js");

    // Печатаем по белому: на тёмной теме снимок вышел бы тёмным листом.
    const canvas = await window.html2canvas(root, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    const { jsPDF } = window.jspdf;

    // Раньше здесь создавалась ОДНА страница высотой во весь урок
    // (format: [pW, pH]) — для книги на 3000 слов лист в несколько
    // метров: не печатается, вес десятки МБ (аудит 2026-07-25).
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const A4_W = 210, A4_H = 297, MARGIN = 10;
    const imgW = A4_W - MARGIN * 2;
    const imgH = (canvas.height * imgW) / canvas.width;
    const pageH = A4_H - MARGIN * 2;
    let remaining = imgH;
    let offset = 0;
    while (remaining > 0) {
      if (offset > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", MARGIN, MARGIN - offset, imgW, imgH);
      // Белые поля сверху/снизу, чтобы срез не заезжал на край листа
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, A4_W, MARGIN, "F");
      pdf.rect(0, A4_H - MARGIN, A4_W, MARGIN, "F");
      remaining -= pageH;
      offset += pageH;
    }
    const safe = String(fileName || "урок").replace(/[^\wа-яА-ЯёЁ \-]/g, "").trim() || "урок";
    pdf.save(`${safe}.pdf`);
  } catch (e) {
    console.error("downloadPdf", e);
    alert(t("pdf.error"));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = label; }
  }
}

/** Разметка панели кнопок — одна и та же на уроке и на модуле, чтобы они не
 *  разъезжались по виду и подписям. */
export function printBarHtml() {
  return `
    <button id="print-btn" class="btn btn-outline btn-sm" type="button">🖨️ ${esc(t("print.print"))}</button>
    <button id="print-pdf-btn" class="btn btn-outline btn-sm" type="button">📄 ${esc(t("print.pdf"))}</button>
    <button id="dl-pdf-btn" class="btn btn-ghost btn-sm" type="button" title="${esc(t("print.quickHint"))}">⚡ ${esc(t("print.quick"))}</button>
  `;
}

/** Подключает панель: «Распечатать» и «Скачать PDF» ведут в диалог печати
 *  (второй — с подсказкой выбрать «Сохранить как PDF»), «Быстрое
 *  скачивание» отдаёт файл одним кликом.
 *  docInfo — { title, eyebrow, meta } для титульного листа. */
export function wirePrintBar(container, root, docInfo) {
  if (!container) return;
  const printBtn = container.querySelector("#print-btn");
  const pdfBtn = container.querySelector("#print-pdf-btn");
  const quickBtn = container.querySelector("#dl-pdf-btn");

  if (printBtn) printBtn.addEventListener("click", () => printDoc(docInfo));
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      // Подсказка обязательна: без неё человек нажимает «Скачать PDF»,
      // видит окно печати и не понимает, что файл получается именно
      // выбором «Сохранить как PDF» в списке принтеров.
      showPdfHint(() => printDoc(docInfo));
    });
  }
  if (quickBtn) quickBtn.addEventListener("click", () => downloadPdf(root, docInfo?.title, quickBtn));
}

/** Однократная подсказка перед открытием диалога печати. Запоминается на
 *  время сессии — во второй раз сразу открываем печать. */
let pdfHintShown = false;

function showPdfHint(onProceed) {
  if (pdfHintShown) { onProceed(); return; }

  const trigger = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "rp-modal-overlay";
  overlay.innerHTML = `
    <div class="rp-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-hint-title">
      <button class="rp-modal__close" type="button" aria-label="${esc(t("common.close"))}">×</button>
      <p class="rp-modal__eyebrow">${esc(t("print.pdf"))}</p>
      <h3 id="pdf-hint-title" class="rp-modal__title">${esc(t("print.hintTitle"))}</h3>
      <p class="form-note">${esc(t("print.hintText"))}</p>
      <p class="form-note">${esc(t("print.hintPages"))}</p>
      <div class="rp-modal__actions">
        <button class="btn btn-primary" type="button" data-go>${esc(t("print.hintGo"))}</button>
        <button class="btn btn-outline" type="button" data-close>${esc(t("common.cancel"))}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("rp-modal-open");

  const close = () => {
    overlay.remove();
    document.body.classList.remove("rp-modal-open");
    document.removeEventListener("keydown", onKey);
    if (trigger && typeof trigger.focus === "function") trigger.focus();
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  overlay.querySelector(".rp-modal__close").addEventListener("click", close);
  overlay.querySelector("[data-close]").addEventListener("click", close);
  overlay.querySelector("[data-go]").addEventListener("click", () => {
    pdfHintShown = true;
    close();
    onProceed();
  });
  overlay.querySelector("[data-go]").focus();
}
