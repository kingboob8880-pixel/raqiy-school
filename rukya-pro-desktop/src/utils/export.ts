// ==========================================
// RUKYA PRO - Export Utilities (HTML/PDF/PNG)
// ==========================================

import { jsPDF } from 'jspdf';
import { TreatmentPlan, Patient, ExportSettings } from '../types';
import { getTheme, getExportStyles } from '../theme';
import { APP_NAME, APP_SUBNAME, APP_VERSION } from '../constants';
import { getFormula } from '../data/formulas';
import { formatRU } from './date';

// Generate HTML document for export
export function generateHTML(
  plan: TreatmentPlan,
  patient: Patient,
  settings: ExportSettings
): string {
  const theme = getTheme(settings.themeId);
  const styles = getExportStyles(theme);
  
  const formulasHtml = plan.phases.map(phase => `
    <div style="margin-bottom: 2rem; page-break-inside: avoid;">
      <h3 style="color: ${theme.colors.primary}; margin-bottom: 1rem; font-size: 1.25rem;">
        ${phase.name} (Дни ${phase.startDay}-${phase.endDay})
      </h3>
      <p style="color: ${theme.colors.textSecondary}; margin-bottom: 1rem;">
        ${phase.description || ''}
      </p>
      <div style="display: grid; gap: 1rem;">
        ${phase.steps.map(step => {
          const formula = step.formula || getFormula(step.formulaId);
          if (!formula) return '';
          
          return `
            <div style="background: ${theme.colors.surface}; border: 1px solid ${theme.colors.border}; border-radius: 0.5rem; padding: 1rem; page-break-inside: avoid;">
              <h4 style="margin-bottom: 0.5rem;">${formula.name}</h4>
              ${settings.includeArabic ? `
                <div class="arabic-text" style="margin: 1rem 0; font-size: 1.5rem; line-height: 2.2; direction: rtl;">
                  ${formula.arabic}
                </div>
              ` : ''}
              <p style="color: ${theme.colors.textSecondary}; font-style: italic; margin-bottom: 0.5rem;">
                ${formula.transliteration}
              </p>
              ${settings.includeTranslation ? `
                <p style="margin-bottom: 0.5rem;">
                  <strong>Перевод:</strong> ${formula.translation}
                </p>
              ` : ''}
              <div style="display: flex; gap: 1rem; flex-wrap: wrap; color: ${theme.colors.textSecondary}; font-size: 0.875rem;">
                <span>🔁 Повторы: ${formula.repeats}</span>
                <span>📖 Источник: ${formula.source}</span>
                ${formula.duration ? `<span>⏱ ${formula.duration}</span>` : ''}
              </div>
              ${settings.includeNotes && step.notes ? `
                <p style="margin-top: 0.5rem; color: ${theme.colors.textSecondary};">
                  📝 ${step.notes}
                </p>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="${settings.language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${plan.name} - ${APP_NAME}</title>
      <style>
        ${styles}
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid ${theme.colors.border};
        }
        
        .header h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .header h2 {
          font-size: 1.25rem;
          color: ${theme.colors.primary};
          margin-bottom: 1rem;
        }
        
        .patient-info {
          background: ${theme.colors.surface};
          border: 1px solid ${theme.colors.border};
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 2rem;
        }
        
        .patient-info h3 {
          margin-bottom: 0.5rem;
          color: ${theme.colors.primary};
        }
        
        .footer {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid ${theme.colors.border};
          text-align: center;
          font-size: 0.875rem;
          color: ${theme.colors.textSecondary};
        }
        
        @media print {
          body {
            padding: 1rem;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${APP_NAME}</h1>
        <h2>${APP_SUBNAME}</h2>
        <p>${plan.name}</p>
        <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">
          Дата: ${formatRU(plan.createdAt)} | Длительность: ${plan.totalDays} дней
        </p>
      </div>
      
      <div class="patient-info">
        <h3>Пациент</h3>
        <p><strong>${patient.lastName} ${patient.firstName} ${patient.middleName || ''}</strong></p>
        ${patient.birthDate ? `<p>Дата рождения: ${formatRU(patient.birthDate)}</p>` : ''}
        ${patient.phone ? `<p>Телефон: ${patient.phone}</p>` : ''}
      </div>
      
      <h2 style="margin-bottom: 1.5rem;">Программа лечения</h2>
      
      ${formulasHtml}
      
      ${plan.notes ? `
        <div style="margin-top: 2rem; padding: 1rem; background: ${theme.colors.surface}; border-radius: 0.5rem;">
          <h3>Примечания</h3>
          <p>${plan.notes}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>${APP_NAME} v${APP_VERSION}</p>
        <p>Сгенерировано: ${new Date().toLocaleString('ru-RU')}</p>
      </div>
    </body>
    </html>
  `;
}

// Download HTML file
export function downloadHTML(
  plan: TreatmentPlan,
  patient: Patient,
  settings: ExportSettings
): void {
  const html = generateHTML(plan, patient, settings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${plan.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate PDF
export async function downloadPDF(
  plan: TreatmentPlan,
  patient: Patient,
  settings: ExportSettings
): Promise<void> {
  const html = generateHTML(plan, patient, settings);
  
  // Create temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  document.body.appendChild(container);
  
  try {
    // Use html2canvas if available, otherwise simple PDF
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: settings.pageSize
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;
    
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 20);
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
    }
    
    pdf.save(`${plan.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    // Fallback: download as HTML
    downloadHTML(plan, patient, settings);
  } finally {
    document.body.removeChild(container);
  }
}

// Generate PNG from element
export async function downloadPNG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }
  
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('PNG generation failed:', error);
  }
}

// Generate simple text report
export function generateTextReport(plan: TreatmentPlan, patient: Patient): string {
  let report = `${APP_NAME} - ${APP_SUBNAME}\n`;
  report += `${'='.repeat(40)}\n\n`;
  report += `План лечения: ${plan.name}\n`;
  report += `Дата: ${formatRU(plan.createdAt)}\n`;
  report += `Длительность: ${plan.totalDays} дней\n\n`;
  
  report += `ПАЦИЕНТ\n${'-'.repeat(20)}\n`;
  report += `${patient.lastName} ${patient.firstName} ${patient.middleName || ''}\n`;
  if (patient.phone) report += `Телефон: ${patient.phone}\n`;
  report += '\n';
  
  report += `ПРОГРАММА ЛЕЧЕНИЯ\n${'='.repeat(20)}\n\n`;
  
  plan.phases.forEach(phase => {
    report += `${phase.name} (Дни ${phase.startDay}-${phase.endDay})\n`;
    report += `${'-'.repeat(30)}\n`;
    
    phase.steps.forEach(step => {
      const formula = step.formula || getFormula(step.formulaId);
      if (!formula) return;
      
      report += `\n• ${formula.name}\n`;
      report += `  Повторы: ${formula.repeats}\n`;
      report += `  Источник: ${formula.source}\n`;
      if (formula.duration) report += `  Длительность: ${formula.duration}\n`;
    });
    
    report += '\n';
  });
  
  if (plan.notes) {
    report += `ПРИМЕЧАНИЯ\n${'-'.repeat(20)}\n${plan.notes}\n`;
  }
  
  report += `\n${'-'.repeat(40)}\n`;
  report += `${APP_NAME} v${APP_VERSION}\n`;
  report += `Сгенерировано: ${new Date().toLocaleString('ru-RU')}\n`;
  
  return report;
}

// Download text report
export function downloadTextReport(plan: TreatmentPlan, patient: Patient): void {
  const text = generateTextReport(plan, patient);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${plan.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
