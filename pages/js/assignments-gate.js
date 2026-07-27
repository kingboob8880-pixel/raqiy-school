// Когда упражнение открывается ученику.
//
// Решение автора 2026-07-27: «упражнения должны открываться по
// прохождению». Условие — сданный экзамен той книги, к которой
// упражнение привязано.
//
// Почему именно экзамен, а не «книга открыта». Открытая книга означает
// только оплаченный доступ к тексту, а не то, что ученик его прочитал.
// Упражнения курса не бывают отвлечёнными: «составьте формулу методом
// Аллязи через атрибут Аллаха из аята» невыполнимо, если урок не
// прочитан, — человек либо бросит на первом шаге, либо сделает
// что-нибудь своё и решит, что метод не работает. Экзамен книги — уже
// существующая на сайте проверка, что материал усвоен (порог 70%), и
// отдельной проверки заводить не нужно.
//
// Три случая, когда упражнение открыто без экзамена:
//   1. модуль ещё закрыт — тогда закрыто и всё внутри, и говорить надо
//      про модуль, а не про экзамен;
//   2. у задания нет привязки к книге (Модуль 11 — работа в программе);
//   3. у книги нет экзамена. Сейчас таких нет ни одной, но появится
//      новый урок без теста — упражнение к нему должно открыться, а не
//      остаться запертым навсегда с невыполнимым условием.
import { MODULES, bookKey, isModuleUnlocked } from "./modules-data.js?v=38";

/** Урок по пути к книге — вместе с модулем, которому принадлежит. */
function lessonByDoc(docPath) {
  for (const m of MODULES) {
    for (const l of m.lessons) if (l.doc === docPath) return { lesson: l, module: m };
  }
  return null;
}

/**
 * Состояние замка одного упражнения.
 *
 * Возвращает:
 *   { open: true }
 *   { open: false, why: "module", moduleId }   — закрыт весь модуль
 *   { open: false, why: "exam", exam, book }   — не сдан экзамен книги
 *
 * progress — объект прогресса ученика. Для админа и в режиме просмотра
 * замок не считаем вовсе: он смотрит курс, а не проходит его.
 *
 * opts.full — доступ, выданный автором вручную (поле fullAccess, кнопка
 * «Всё открыто» в кабинете админа, 2026-07-27). Снимает замки целиком:
 * и порядок модулей, и требование сданного экзамена.
 */
export function assignmentGate(a, progress, opts = {}) {
  if (opts.preview || opts.full) return { open: true };

  const moduleId = a.moduleId ?? opts.moduleId ?? null;
  if (moduleId && !isModuleUnlocked(moduleId, progress)) {
    return { open: false, why: "module", moduleId };
  }
  if (!a.book) return { open: true };

  const found = lessonByDoc(a.book);
  if (!found?.lesson?.exam) return { open: true };

  const done = progress?.books?.[bookKey(a.book)]?.status === "done";
  return done ? { open: true } : { open: false, why: "exam", exam: found.lesson.exam, book: a.book };
}

/** Сколько из списка открыто — для заголовков групп на странице «Практика». */
export function countOpen(items, progress, opts = {}) {
  return items.reduce((n, a) => n + (assignmentGate(a, progress, opts).open ? 1 : 0), 0);
}
