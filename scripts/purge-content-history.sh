#!/usr/bin/env bash
# Удаление полного текста курса из ВСЕЙ истории git.
#
# ЗАЧЕМ
# -----
# scripts/seed-paid-content.mjs обрезает content/*.md до бесплатного отрывка,
# но это меняет только текущую версию. Вся прошлая история остаётся в
# репозитории, и полный текст достаётся одной командой:
#     git log --all -- content/module-8/prodvinutye-formuly.md
#     git show <старый-коммит>:content/module-8/prodvinutye-formuly.md
# Проверено 2026-07-25 на публичном репозитории: 152 коммита, текст Модуля 8
# вычитывается целиком. Пока история не вычищена, миграция бесполезна.
#
# ЧТО ДЕЛАЕТ ЭТОТ СКРИПТ
# ----------------------
#   1. Делает резервную копию всего репозитория (bundle + рабочая копия).
#   2. Вырезает папку content/ из всех коммитов истории.
#   3. Возвращает ТЕКУЩЕЕ содержимое content/ (уже обрезанное миграцией)
#      одним новым коммитом — сайту оно нужно, чтобы отдавать отрывки.
#   4. Показывает проверку и ждёт подтверждения ПЕРЕД отправкой на GitHub.
#
# История кода (152 коммита) сохраняется — вырезается только content/.
#
# ПОРЯДОК ЗАПУСКА (важен!)
# ------------------------
#   1. Сначала миграция:  GOOGLE_APPLICATION_CREDENTIALS=... node scripts/seed-paid-content.mjs
#   2. Коммит и пуш обрезанных файлов
#   3. Только потом этот скрипт
# Если запустить его ДО миграции, вычищать будет нечего: полный текст
# вернётся обратно шагом 3.
#
# ЗАПУСК
#   bash scripts/purge-content-history.sh
#
# ⚠ ЧЕГО СКРИПТ НЕ МОЖЕТ
# У того, кто уже клонировал репозиторий или открывал файлы через веб-архивы,
# полный текст остаётся. Переписывание истории закрывает будущий доступ, но не
# отменяет уже сделанные копии.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${HOME}/raqiy-backup-${STAMP}"

echo "=== Очистка истории от полного текста курса ==="
echo "Репозиторий: $REPO_ROOT"
echo ""

# ── 0. Проверки перед началом ───────────────────────────────────────────
if [ ! -d .git ]; then
  echo "ОШИБКА: это не git-репозиторий."; exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ОШИБКА: есть незакоммиченные изменения. Сначала закоммитьте или отмените их:"
  git status --short
  exit 1
fi

# Миграция должна быть уже выполнена — иначе вычищать нечего.
if ! grep -rlq "^preview: true" content/ 2>/dev/null; then
  echo "ОСТАНОВЛЕНО: не вижу ни одного файла с меткой 'preview: true'."
  echo ""
  echo "Похоже, миграция ещё не запускалась. Сначала:"
  echo "  GOOGLE_APPLICATION_CREDENTIALS=/путь/к/ключу.json node scripts/seed-paid-content.mjs"
  echo "  git add -A && git commit -m 'Полный текст книг перенесён в Firestore' && git push"
  echo ""
  echo "Иначе очистка истории бессмысленна: полный текст вернётся обратно."
  exit 1
fi

command -v git-filter-repo >/dev/null 2>&1 || {
  echo "ОШИБКА: не установлен git-filter-repo."
  echo "Установите:  pip install git-filter-repo"
  exit 1
}

# ── 1. Резервная копия ──────────────────────────────────────────────────
echo "[1/5] Резервная копия → $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
git bundle create "$BACKUP_DIR/repo-full.bundle" --all >/dev/null
cp -r "$REPO_ROOT" "$BACKUP_DIR/working-copy"
echo "      bundle + рабочая копия сохранены."
echo "      Восстановление при необходимости:"
echo "        git clone $BACKUP_DIR/repo-full.bundle восстановленный-репозиторий"
echo ""

# ── 2. Сохраняем текущее (обрезанное) содержимое content/ ───────────────
echo "[2/5] Сохраняю текущее содержимое content/ (отрывки + индекс поиска)"
CONTENT_TMP="$(mktemp -d)"
cp -r content/. "$CONTENT_TMP/"
FILES_KEPT="$(find "$CONTENT_TMP" -type f | wc -l)"
echo "      файлов сохранено: $FILES_KEPT"
echo ""

# ── 3. Вырезаем content/ из всей истории ────────────────────────────────
echo "[3/5] Вырезаю content/ из всех коммитов истории…"
COMMITS_BEFORE="$(git rev-list --count HEAD)"
REMOTE_URL="$(git remote get-url origin)"

git filter-repo --path content --invert-paths --force

echo "      готово. Коммитов было: $COMMITS_BEFORE, стало: $(git rev-list --count HEAD)"
echo ""

# filter-repo намеренно удаляет remote, чтобы случайно не запушить — вернём.
git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"

# ── 4. Возвращаем обрезанный content/ одним коммитом ────────────────────
echo "[4/5] Возвращаю обрезанный content/ новым коммитом"
mkdir -p content
cp -r "$CONTENT_TMP/." content/
rm -rf "$CONTENT_TMP"
git add content/
git commit -q -m "content: только бесплатные отрывки (полный текст — в Firestore)

Полный текст книг перенесён в Firestore скриптом
scripts/seed-paid-content.mjs и отдаётся только оплатившим по правилам
integration/firestore.rules. В репозитории остаются отрывки с меткой
preview: true и индекс поиска по заголовкам.

История content/ вычищена: до этого полный текст доставался из старых
коммитов командой git show, и обрезка текущей версии его не закрывала."
echo ""

# ── 5. Проверка ─────────────────────────────────────────────────────────
# Ищем фразы из ТЕЛА абзацев, а не заголовки: заголовки законно лежат в
# content/search-index.json, и проверка по ним давала ложную тревогу
# (проверено 2026-07-25 — сработала на индексе поиска).
echo "[5/5] Проверка результата: ищу текст абзацев во всех объектах репозитория"
LEAK=0
PHRASES=(
  "Это подобно разнице между командой"
  "Ты не «надеешься, чтобы вышло»"
  "Применяется на первых этапах, когда недуг слишком силён"
)

# Один проход по всем блобам — перебирать по фразе отдельно слишком долго.
ALL_BLOBS="$(mktemp)"
git rev-list --objects --all | awk '{print $1}' | sort -u > "$ALL_BLOBS"

for phrase in "${PHRASES[@]}"; do
  HIT=""
  while read -r o; do
    [ "$(git cat-file -t "$o" 2>/dev/null)" = "blob" ] || continue
    if git cat-file -p "$o" 2>/dev/null | grep -qF "$phrase"; then
      HIT="$(git rev-list --objects --all | grep "^$o" | cut -d' ' -f2- | head -1)"
      break
    fi
  done < "$ALL_BLOBS"
  if [ -n "$HIT" ]; then
    echo "      ⚠ «${phrase:0:34}…» найдено в: $HIT"
    LEAK=1
  else
    echo "      ✓ «${phrase:0:34}…» — нигде не найдено"
  fi
done
rm -f "$ALL_BLOBS"

if [ "$LEAK" -eq 1 ]; then
  echo ""
  echo "ВНИМАНИЕ: полный текст всё ещё в репозитории. НЕ пушьте."
  echo "Скорее всего, остались файлы под content/, которых нет в modules-data.js"
  echo "(например, дубли content/module-N/module-N/...). Удалите их, закоммитьте"
  echo "и запустите этот скрипт заново — резервная копия уже сделана."
  exit 1
fi

echo "      следов полного текста в истории не найдено."
echo ""
echo "================================================================"
echo "Локально всё готово. Осталась отправка на GitHub — она НЕОБРАТИМА."
echo ""
echo "Проверьте сами, что хотите:"
echo "  git log --oneline | head"
echo "  git log --all --oneline -- content/ | head"
echo ""
echo "Когда убедитесь — отправьте вручную:"
echo "  git push --force origin main"
echo ""
echo "Резервная копия: $BACKUP_DIR"
echo "================================================================"
