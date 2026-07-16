// Загружает экзамен по книге из content/exams/*.md — вопросы живут как
// markdown (аналогично остальному контенту курса), не как JS-объект.
// Формат: front matter (title/book/status) + нумерованный список вопросов,
// у каждого — варианты чекбоксами "- [ ]"/"- [x]" (один правильный).
import { withBase } from "./base-path.js?v=6";
import { parseFrontMatter } from "./markdown-loader.js?v=7";

function parseQuestions(body) {
  const questions = [];
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    const qMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    const oMatch = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
    if (qMatch) {
      current = { q: qMatch[1].trim(), options: [], correct: -1 };
      questions.push(current);
    } else if (oMatch && current) {
      if (oMatch[1].toLowerCase() === "x") current.correct = current.options.length;
      current.options.push(oMatch[2].trim());
    }
  }
  return questions.filter((q) => q.options.length >= 2 && q.correct >= 0);
}

export async function loadExamDoc(path) {
  const res = await fetch(withBase(path));
  if (!res.ok) throw new Error(`Не удалось загрузить экзамен ${path}: HTTP ${res.status}`);
  const raw = await res.text();
  const { meta, body } = parseFrontMatter(raw);
  return { meta, questions: parseQuestions(body) };
}
