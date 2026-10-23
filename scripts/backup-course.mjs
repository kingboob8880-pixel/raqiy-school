#!/usr/bin/env node
// Локальный резервный снимок курса RUKYA PRO — на случай, если репозиторий
// удалят, перезапишут историю или кто-то поправит контент «на сервере».
//
// Что попадает в архив: всё, из чего собирается курс и сайт — content/,
// pages/, design/, integration/, assets/, docs/, scripts/, functions/,
// «Методы», drafts/, mockups/, учебные страницы Fully/ и ruqya-healingg/,
// исходники рукописей (.docx), а также файлы корня (index.html, sw.js,
// firebase.json и т.п.).
//
// Что НЕ попадает:
//   • public/ — это сборка scripts/build-site.mjs, восстанавливается одной
//     командой из исходников, а место занимает вдвое больше;
//   • tg/ и Скрины/ — личный экспорт переписки и скриншоты (только с --full);
//   • секреты: .env, api.txt, *adminsdk*.json, firebase-config.local.js.
//     Резервная копия не должна тиражировать ключи, дающие полный доступ
//     к проекту; они восстанавливаются из Firebase/локального окружения;
//   • node_modules, dist, release, .git, .claude, кэш .firebase.
//
// Формат: один zip + рядом манифест с SHA-256 каждого файла. Проверка
// (`--verify`) пересчитывает хеши прямо из архива, поэтому «тихую» порчу
// файла на диске она поймает.
//
// Запуск:
//   node scripts/backup-course.mjs                # сделать снимок
//   node scripts/backup-course.mjs --full         # + tg/ и Скрины/
//   node scripts/backup-course.mjs --out D:\Raqiy-BACKUPS
//   node scripts/backup-course.mjs --list         # что уже сохранено
//   node scripts/backup-course.mjs --verify backups\Raqiy-course-....zip
//   node scripts/backup-course.mjs --restore backups\Raqiy-course-....zip D:\restore
//
// Архив пишется своим упаковщиком, а не tar.exe: встроенный bsdtar не читает
// кириллические имена из списка файлов (проверено 2026-10-23 на «Методы/…»).
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREFIX = "Raqiy-course";
const DEFAULT_KEEP = 7;

/** Каталоги, которые целиком считаются частью курса. */
const INCLUDE_DIRS = [
  "content",
  "pages",
  "design",
  "integration",
  "assets",
  "docs",
  "drafts",
  "mockups",
  "Методы",
  "scripts",
  "functions",
  "Fully",
  "ruqya-healingg",
  "rukya-pro-desktop",
];

/** Добавляются только по флагу --full: тяжёлые и личные. */
const FULL_DIRS = ["tg", "Скрины"];

/** Шаблоны исключений (путь в posix-виде, от корня проекта). */
const EXCLUDE = [
  /(^|\/)(node_modules|\.git|\.firebase|\.claude|\.vscode|dist|release|backups)(\/|$)/,
  /(^|\/)(\.env|\.env\.local)$/,
  /(^|\/)api\.txt$/,
  /adminsdk|service-account|serviceAccount/i,
  /^integration\/firebase-config\.local\.js$/,
  /\.log$/i,
  /(^|\/)tmp-[^/]*$/,
  /(^|\/)(result\.json|messages\.html)$/,
  /(^|\/)\.DS_Store$/,
  /\.(exe|msi|dll|pdb|zip)$/i,
];

/** Уже сжатые форматы не гоняем через deflate — только время терять. */
const STORE_EXT = /\.(jpe?g|png|gif|webp|avif|mp3|m4a|ogg|oga|opus|wav|mp4|webm|mov|pdf|docx|xlsx|pptx|epub|woff2?|ttf|otf)$/i;

// ─── утилиты ────────────────────────────────────────────────────────────────

const posix = (p) => p.split(path.sep).join("/");
const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

function gitInfo() {
  const run = (args) => {
    const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
    return r.status === 0 ? r.stdout.trim() : null;
  };
  return {
    commit: run(["rev-parse", "HEAD"]),
    branch: run(["rev-parse", "--abbrev-ref", "HEAD"]),
    dirty: (run(["status", "--porcelain"]) || "").split("\n").filter(Boolean).length,
  };
}

// ─── сбор списка файлов ─────────────────────────────────────────────────────

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
}

function collectFiles({ full }) {
  const dirs = full ? [...INCLUDE_DIRS, ...FULL_DIRS] : INCLUDE_DIRS;
  const abs = [];

  for (const name of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (name.isFile()) abs.push(path.join(ROOT, name.name));
  }
  for (const dir of dirs) {
    const absDir = path.join(ROOT, dir);
    if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) walk(absDir, abs);
  }

  const seen = new Set();
  const files = [];
  for (const full of abs) {
    const rel = posix(path.relative(ROOT, full));
    if (seen.has(rel)) continue;
    if (EXCLUDE.some((re) => re.test(rel))) continue;
    const st = fs.statSync(full);
    seen.add(rel);
    files.push({ rel, abs: full, size: st.size, mtime: st.mtime });
  }
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  return files;
}

// ─── запись zip (без внешних зависимостей) ──────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function dosTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time: time & 0xffff, date: date & 0xffff };
}

/**
 * @returns {{entries:number, raw:number, packed:number}}
 */
function writeZip(files, zipPath, log) {
  // Node 22+ больше не принимает "wb" — только числовые флаги.
  const fd = fs.openSync(zipPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC);
  const central = [];
  let offset = 0;
  let rawTotal = 0;
  let packedTotal = 0;

  try {
    for (const file of files) {
      const data = fs.readFileSync(file.abs);
      const nameBuf = Buffer.from(file.rel, "utf8");
      const store = STORE_EXT.test(file.rel);
      const body = store ? data : zlib.deflateRawSync(data, { level: 9 });
      const method = store ? 0 : 8;
      const { time, date } = dosTime(file.mtime);
      const crc = crc32(data);

      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(20, 4); // version needed
      local.writeUInt16LE(0x0800, 6); // UTF-8 имена
      local.writeUInt16LE(method, 8);
      local.writeUInt16LE(time, 10);
      local.writeUInt16LE(date, 12);
      local.writeUInt32LE(crc, 14);
      local.writeUInt32LE(body.length, 18);
      local.writeUInt32LE(data.length, 22);
      local.writeUInt16LE(nameBuf.length, 26);
      local.writeUInt16LE(0, 28); // extra

      fs.writeSync(fd, local);
      fs.writeSync(fd, nameBuf);
      fs.writeSync(fd, body);

      const cd = Buffer.alloc(46);
      cd.writeUInt32LE(0x02014b50, 0);
      cd.writeUInt16LE(20, 4); // version made by
      cd.writeUInt16LE(20, 6);
      cd.writeUInt16LE(0x0800, 8);
      cd.writeUInt16LE(method, 10);
      cd.writeUInt16LE(time, 12);
      cd.writeUInt16LE(date, 14);
      cd.writeUInt32LE(crc, 16);
      cd.writeUInt32LE(body.length, 20);
      cd.writeUInt32LE(data.length, 24);
      cd.writeUInt16LE(nameBuf.length, 28);
      cd.writeUInt16LE(0, 30); // extra
      cd.writeUInt16LE(0, 32); // comment
      cd.writeUInt16LE(0, 34); // disk
      cd.writeUInt16LE(0, 36); // internal attrs
      cd.writeUInt32LE(0, 38); // external attrs
      cd.writeUInt32LE(offset, 42);
      central.push({ cd, nameBuf });

      offset += local.length + nameBuf.length + body.length;
      rawTotal += data.length;
      packedTotal += body.length;
      if (log && files.length > 40 && central.length % 100 === 0) {
        log(`  упаковано ${central.length}/${files.length}`);
      }
    }

    const cdStart = offset;
    for (const { cd, nameBuf } of central) {
      fs.writeSync(fd, cd);
      fs.writeSync(fd, nameBuf);
      offset += cd.length + nameBuf.length;
    }

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(central.length, 8);
    eocd.writeUInt16LE(central.length, 10);
    eocd.writeUInt32LE(offset - cdStart, 12);
    eocd.writeUInt32LE(cdStart, 16);
    eocd.writeUInt16LE(0, 20);
    fs.writeSync(fd, eocd);
  } finally {
    fs.closeSync(fd);
  }

  return { entries: central.length, raw: rawTotal, packed: packedTotal };
}

// ─── чтение zip (проверка и восстановление) ─────────────────────────────────

function readZip(zipPath) {
  const buf = fs.readFileSync(zipPath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("не найден конец центрального каталога — файл повреждён или это не zip");

  const count = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const entries = [];

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error(`битый заголовок каталога #${i}`);
    const method = buf.readUInt16LE(ptr + 10);
    const crc = buf.readUInt32LE(ptr + 16);
    const csize = buf.readUInt32LE(ptr + 20);
    const usize = buf.readUInt32LE(ptr + 24);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOff = buf.readUInt32LE(ptr + 42);
    const name = buf.subarray(ptr + 46, ptr + 46 + nameLen).toString("utf8");
    ptr += 46 + nameLen + extraLen + commentLen;

    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const packed = buf.subarray(dataStart, dataStart + csize);
    const data = method === 0 ? packed : method === 8 ? zlib.inflateRawSync(packed) : null;
    if (!data) throw new Error(`неизвестный метод сжатия ${method} в ${name}`);
    entries.push({ name, data, crc, usize });
  }
  return entries;
}

// ─── команды ────────────────────────────────────────────────────────────────

function cmdBackup({ out, keep, full, dryRun }) {
  const log = (s) => console.log(s);
  const files = collectFiles({ full });
  const total = files.reduce((s, f) => s + f.size, 0);
  const git = gitInfo();

  log(`\nСнимок курса из ${ROOT}`);
  log(`  файлов: ${files.length}, объём: ${mb(total)}`);
  log(`  git:    ${git.branch ?? "—"} @ ${(git.commit ?? "—").slice(0, 8)}${git.dirty ? ` (незакоммиченных изменений: ${git.dirty})` : ""}`);
  log(`  режим:  ${full ? "полный (с tg/ и Скрины/)" : "курс (без личных медиа)"}`);

  if (dryRun) {
    for (const f of files.slice(0, 20)) log(`    ${f.rel}`);
    if (files.length > 20) log(`    … и ещё ${files.length - 20}`);
    log("\n--dry-run: архив не создавался.");
    return;
  }

  fs.mkdirSync(out, { recursive: true });
  const name = `${PREFIX}-${stamp()}${full ? "-full" : ""}`;
  const zipPath = path.join(out, `${name}.zip`);
  const partPath = `${zipPath}.part`;

  log("\nУпаковка…");
  let stats;
  try {
    stats = writeZip(files, partPath, log);
    fs.renameSync(partPath, zipPath);
  } catch (err) {
    fs.rmSync(partPath, { force: true });
    throw err;
  }

  const zipBuf = fs.readFileSync(zipPath);
  const zipHash = sha256(zipBuf);

  const manifest = {
    tool: "scripts/backup-course.mjs",
    createdAt: new Date().toISOString(),
    root: ROOT,
    archive: path.basename(zipPath),
    archiveSha256: zipHash,
    archiveBytes: zipBuf.length,
    git,
    stats: { files: files.length, sourceBytes: total, packedBytes: stats.packed },
    files: files.map((f) => ({ path: f.rel, size: f.size, sha256: sha256(fs.readFileSync(f.abs)) })),
  };
  fs.writeFileSync(`${zipPath}.manifest.json`, JSON.stringify(manifest, null, 1), "utf8");
  fs.writeFileSync(`${zipPath}.sha256`, `${zipHash}  ${path.basename(zipPath)}\n`, "utf8");

  // Сводка по всем снимкам в папке.
  const index = listBackups(out).map((b) => ({
    file: b.file,
    createdAt: b.createdAt,
    files: b.files,
    bytes: b.bytes,
    commit: b.commit,
  }));
  fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index, null, 1), "utf8");

  log(`\nГотово: ${zipPath}`);
  log(`  файлов в архиве: ${stats.entries}, исходный объём: ${mb(stats.raw)}, архив: ${mb(zipBuf.length)}`);
  log(`  SHA-256: ${zipHash}`);

  const pruned = prune(out, keep);
  if (pruned.length) log(`  удалено старых снимков (храним ${keep}): ${pruned.join(", ")}`);
}

function listBackups(out) {
  if (!fs.existsSync(out)) return [];
  const zips = fs
    .readdirSync(out)
    .filter((n) => n.startsWith(`${PREFIX}-`) && n.endsWith(".zip"))
    .sort()
    .reverse();
  return zips.map((file) => {
    const zipPath = path.join(out, file);
    const st = fs.statSync(zipPath);
    let meta = null;
    try {
      meta = JSON.parse(fs.readFileSync(`${zipPath}.manifest.json`, "utf8"));
    } catch {}
    return {
      file,
      path: zipPath,
      bytes: st.size,
      files: meta?.stats?.files ?? null,
      createdAt: meta?.createdAt ?? st.mtime.toISOString(),
      commit: meta?.git?.commit ?? null,
    };
  });
}

function prune(out, keep) {
  if (keep <= 0) return [];
  const all = listBackups(out);
  const old = all.slice(keep);
  const removed = [];
  for (const b of old) {
    fs.rmSync(b.path, { force: true });
    fs.rmSync(`${b.path}.manifest.json`, { force: true });
    fs.rmSync(`${b.path}.sha256`, { force: true });
    removed.push(b.file);
  }
  return removed;
}

function cmdList({ out }) {
  const all = listBackups(out);
  if (!all.length) {
    console.log(`Снимков пока нет (папка ${out}).`);
    return;
  }
  console.log(`\nСнимки в ${out}:\n`);
  for (const b of all) {
    const dt = b.createdAt.replace("T", " ").slice(0, 16);
    console.log(`  ${dt}  ${b.files ?? "?"} файлов  ${mb(b.bytes).padStart(10)}  ${b.file}`);
  }
}

function cmdVerify({ zip, quiet = false }) {
  const log = quiet ? () => {} : console.log;
  const sideManifest = `${zip}.manifest.json`;
  if (!fs.existsSync(sideManifest)) throw new Error(`рядом с архивом нет манифеста: ${sideManifest}`);
  const manifest = JSON.parse(fs.readFileSync(sideManifest, "utf8"));

  log(`\nПроверка ${path.basename(zip)}`);
  const actualHash = sha256(fs.readFileSync(zip));
  const hashOk = actualHash === manifest.archiveSha256;
  log(`  SHA-256 архива: ${hashOk ? "совпадает" : "НЕ СОВПАДАЕТ"} (${actualHash.slice(0, 16)}…)`);
  if (!hashOk) {
    log("  ВНИМАНИЕ: файл архива изменён или недокачан.");
  }

  const entries = readZip(zip);
  const byPath = new Map(entries.map((e) => [e.name, e]));
  const problems = [];
  for (const f of manifest.files) {
    const e = byPath.get(f.path);
    if (!e) {
      problems.push(`отсутствует в архиве: ${f.path}`);
      continue;
    }
    const h = sha256(e.data);
    if (h !== f.sha256) problems.push(`расходится хеш: ${f.path}`);
    byPath.delete(f.path);
  }
  for (const extra of byPath.keys()) problems.push(`лишний файл в архиве: ${extra}`);

  if (problems.length) {
    log(`  ПРОБЛЕМЫ (${problems.length}):`);
    for (const p of problems.slice(0, 30)) log(`    ${p}`);
    if (problems.length > 30) log(`    … и ещё ${problems.length - 30}`);
    return { ok: false, problems };
  }
  log(`  файлов проверено: ${manifest.files.length} — все совпадают.`);
  const git = manifest.git;
  if (git?.commit) log(`  снимок сделан с коммита ${git.commit.slice(0, 8)} (${git.branch ?? "—"})`);
  log("  Архив целый.");
  return { ok: true, problems: [] };
}

function cmdRestore({ zip, dest, force }) {
  if (!fs.existsSync(zip)) throw new Error(`нет такого архива: ${zip}`);
  const target = path.resolve(dest);
  console.log(`\nВосстановление ${path.basename(zip)} → ${target}`);

  const entries = readZip(zip);
  let written = 0;
  let skipped = 0;
  for (const e of entries) {
    const rel = e.name.replace(/\//g, path.sep);
    if (rel.includes("..") || path.isAbsolute(rel)) throw new Error(`подозрительный путь в архиве: ${e.name}`);
    const full = path.join(target, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (!force && fs.existsSync(full)) {
      skipped++;
      continue;
    }
    fs.writeFileSync(full, e.data);
    written++;
  }
  console.log(`  записано файлов: ${written}${skipped ? `, пропущено существующих: ${skipped} (--force перезапишет)` : ""}`);

  // public/ — сборка: после отката исходников её надо пересобрать, иначе на
  // сайте останется то, что было до восстановления.
  if (target === ROOT) {
    console.log("  Дальше: пересобрать сайт — node scripts/build-site.mjs");
  }
  console.log("  Готово.");
}

function cmdRestoreLatest({ out, dest }) {
  const [latest] = listBackups(out);
  if (!latest) throw new Error(`в ${out} нет снимков — сначала сохраните курс`);
  const dt = latest.createdAt.replace("T", " ").slice(0, 16);
  console.log(`Последний снимок: ${latest.file} (${dt}, ${latest.files ?? "?"} файлов)`);
  cmdRestore({ zip: latest.path, dest: dest ?? ROOT, force: true });
}

function cmdPrune({ out, keep }) {
  const removed = prune(out, keep);
  console.log(removed.length ? `Удалено: ${removed.join(", ")}` : "Удалять нечего.");
}

// ─── разбор аргументов ──────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    cmd: "backup",
    out: path.join(ROOT, "backups"),
    keep: DEFAULT_KEEP,
    full: false,
    dryRun: false,
    force: false,
    zip: null,
    dest: null,
  };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") opts.out = path.resolve(argv[++i]);
    else if (a === "--keep") opts.keep = Number(argv[++i]);
    else if (a === "--full") opts.full = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--list") opts.cmd = "list";
    else if (a === "--prune") opts.cmd = "prune";
    else if (a === "--verify") {
      opts.cmd = "verify";
      opts.zip = path.resolve(argv[++i]);
    } else if (a === "--restore") {
      opts.cmd = "restore";
      opts.zip = path.resolve(argv[++i]);
      opts.dest = argv[++i];
    } else if (a === "--restore-latest") {
      opts.cmd = "restore-latest";
      const maybeDest = argv[i + 1];
      if (maybeDest && !maybeDest.startsWith("--")) opts.dest = argv[++i];
    } else if (a === "--help" || a === "-h") opts.cmd = "help";
    else rest.push(a);
  }
  if (opts.cmd !== "backup" && opts.cmd !== "help" && rest.length) {
    throw new Error(`лишние аргументы: ${rest.join(" ")}`);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  switch (opts.cmd) {
    case "backup":
      cmdBackup(opts);
      break;
    case "list":
      cmdList(opts);
      break;
    case "verify": {
      const res = cmdVerify({ zip: opts.zip });
      process.exitCode = res.ok ? 0 : 1;
      break;
    }
    case "restore":
      cmdRestore({ zip: opts.zip, dest: opts.dest, force: opts.force });
      break;
    case "restore-latest":
      cmdRestoreLatest({ out: opts.out, dest: opts.dest });
      break;
    case "prune":
      cmdPrune(opts);
      break;
    default:
      console.log(
        [
          "",
          "Локальный бэкап курса RUKYA PRO",
          "",
          "  node scripts/backup-course.mjs [--out DIR] [--keep N] [--full] [--dry-run]",
          "  node scripts/backup-course.mjs --list",
          "  node scripts/backup-course.mjs --verify <архив.zip>",
          "  node scripts/backup-course.mjs --restore <архив.zip> <папка> [--force]",
          "  node scripts/backup-course.mjs --restore-latest [папка]",
          "",
          "  --out DIR    куда писать архивы (по умолчанию backups/ в проекте)",
          "  --keep N     сколько последних снимков хранить (0 — все, по умолчанию 7)",
          "  --full       включить tg/ и Скрины/ (личные медиа, +400 МБ)",
          "  --dry-run    показать, что попадёт в архив, ничего не создавая",
          "",
        ].join("\n"),
      );
  }
}

try {
  main();
} catch (err) {
  console.error(`\nОшибка: ${err.message}`);
  process.exitCode = 1;
}
