// Сверка ленты достижений с действительностью.
//
// Вынесено из index.js отдельным файлом по технической причине: всё, что
// index.js кладёт в exports, Firebase считает облачной функцией и пытается
// развернуть. Обычная вспомогательная функция там развернуться не может, а
// нужна она в двух местах — в ночном задании и в разовом скрипте очистки
// (scripts/clean-feed.mjs). Держать одно и то же правило в двух копиях
// нельзя: разойдутся при первой же правке.
//
// db и logger приходят параметрами, чтобы файл не тянул за собой
// инициализацию firebase-admin: скрипт запускается с ключом сервисного
// аккаунта и настраивает её по-своему.

/** Записи в ленте, которые обязаны совпадать с текущим положением дел, и
 *  поле профиля, которое за них отвечает. Виды, которых здесь нет
 *  (экзамен, практика, «Аллах ответил», выпуск), проверке не подлежат:
 *  это события, они произошли. */
const REVOCABLE_FEED = {
  certificate: (s) => !!s.certificateGranted,
  rukyaPro: (s) => !!s.rukyaProAccess,
};

/** Сверка ленты с действительностью — раз в сутки, из dailyReminders.
 *
 * Зачем нужна, если отзыв доступа и так убирает запись (см. dropFeed).
 * Затем, что триггер ловит только сам момент перехода. Он не сработает,
 * если:
 *   • поле правили прямо в консоли Firebase, минуя приложение;
 *   • ученика удалили целиком — его записи остались бы в ленте навсегда,
 *     и школа показывала бы успехи человека, которого в ней нет;
 *   • запись повисла ещё до того, как отзыв научились обрабатывать
 *     (ровно это и случилось с «получил доступ к системе RUKYA Pro»).
 *
 * Поэтому сверка не смотрит на переходы вообще: она берёт ленту и
 * спрашивает у профиля, правда ли это сейчас. Что не подтвердилось —
 * удаляет. Такую проверку нельзя «пропустить», и она чинит записи,
 * появившиеся любым путём.
 *
 * Возвращает число удалённых записей — его печатает разовый скрипт
 * scripts/clean-feed.mjs.
 */
async function sweepFeed(db, logger) {
  const feed = await db.collection("feed").get();
  if (feed.empty) return 0;

  // Профили читаем по одному разу на ученика, а не на запись: у активного
  // ученика записей в ленте с десяток.
  const uids = [...new Set(feed.docs.map((d) => d.data()?.uid).filter(Boolean))];
  const students = new Map();
  await Promise.all(uids.map(async (uid) => {
    const s = await db.doc(`students/${uid}`).get();
    students.set(uid, s.exists ? s.data() : null);
  }));

  const stale = [];
  for (const d of feed.docs) {
    const e = d.data() || {};
    const s = e.uid ? students.get(e.uid) : null;
    if (!s) { stale.push({ ref: d.ref, why: "ученика нет" }); continue; }
    const stillTrue = REVOCABLE_FEED[e.kind];
    if (stillTrue && !stillTrue(s)) stale.push({ ref: d.ref, why: `${e.kind} отозван` });
  }

  if (!stale.length) return 0;

  // По 400 за раз: предел батча Firestore — 500 операций.
  for (let i = 0; i < stale.length; i += 400) {
    const batch = db.batch();
    for (const { ref } of stale.slice(i, i + 400)) batch.delete(ref);
    await batch.commit();
  }
  logger.info(`sweepFeed: убрано записей — ${stale.length}`,
    stale.map((x) => `${x.ref.id} (${x.why})`));
  return stale.length;
}

// Нужна разовому скрипту очистки (scripts/clean-feed.mjs), который делает
// то же самое, но сразу, не дожидаясь ночного запуска.

module.exports = { sweepFeed, REVOCABLE_FEED };
