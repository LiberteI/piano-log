import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type PracticeDayMap = Record<string, boolean>;

interface PracticeDaysPayload {
  days: PracticeDayMap;
  lastUpdated: string;
}

const REPO_ROOT = process.cwd();
const LOGS_DIR = path.join(REPO_ROOT, "logs");
const OUTPUT_DIR = path.join(REPO_ROOT, "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "practice-days.json");
const DATE_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})\.md$/;
const TOTAL_TIME_PATTERN = /\*\*Total time:\*\*\s*([^\n\r]+)/i;

async function main(): Promise<void> {
  const practiceFiles = await collectPracticeFiles(LOGS_DIR);
  const practiceDays = await parsePracticeDays(practiceFiles);
  const payload = buildPayload(practiceDays, getTodayIsoDate());

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Generated ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);
}

async function collectPracticeFiles(rootDir: string): Promise<string[]> {
  const files = await collectPracticeFilesRecursive(rootDir);
  files.sort((left, right) => left.localeCompare(right));
  return files;
}

async function collectPracticeFilesRecursive(currentDir: string): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectPracticeFilesRecursive(entryPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!DATE_FILENAME_PATTERN.test(entry.name)) {
      continue;
    }

    files.push(entryPath);
  }

  return files;
}

async function parsePracticeDays(filePaths: string[]): Promise<PracticeDayMap> {
  const practiceDays: PracticeDayMap = {};

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const dateMatch = fileName.match(DATE_FILENAME_PATTERN);

    if (!dateMatch) {
      continue;
    }

    const practiceDate = dateMatch[1];
    const markdown = await readFile(filePath, "utf8");
    const hasCompletedSession = parseCompletedPracticeSession(markdown);

    // If multiple logs ever exist for one day, any completed session makes the day true.
    practiceDays[practiceDate] = Boolean(practiceDays[practiceDate] || hasCompletedSession);
  }

  return practiceDays;
}

function parseCompletedPracticeSession(markdown: string): boolean {
  const totalTimeMatch = markdown.match(TOTAL_TIME_PATTERN);

  if (!totalTimeMatch) {
    return false;
  }

  const rawTotalTime = totalTimeMatch[1].trim();
  const minuteMatch = rawTotalTime.match(/(\d+)/);

  if (!minuteMatch) {
    return false;
  }

  const totalMinutes = Number.parseInt(minuteMatch[1], 10);
  return Number.isFinite(totalMinutes) && totalMinutes > 0;
}

function buildPayload(practiceDays: PracticeDayMap, todayIsoDate: string): PracticeDaysPayload {
  const sortedPracticeDates = Object.keys(practiceDays).sort();

  if (sortedPracticeDates.length === 0) {
    return {
      days: {},
      lastUpdated: todayIsoDate
    };
  }

  const firstPracticeDate = sortedPracticeDates[0];
  const days: PracticeDayMap = {};

  for (const isoDate of enumerateInclusiveDateRange(firstPracticeDate, todayIsoDate)) {
    days[isoDate] = practiceDays[isoDate] ?? false;
  }

  return {
    days,
    lastUpdated: todayIsoDate
  };
}

function* enumerateInclusiveDateRange(startIsoDate: string, endIsoDate: string): Generator<string> {
  let cursor = parseIsoDate(startIsoDate);
  const end = parseIsoDate(endIsoDate);

  while (cursor.getTime() <= end.getTime()) {
    yield formatIsoDate(cursor);
    cursor = addDays(cursor, 1);
  }
}

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getTodayIsoDate(): string {
  return formatIsoDate(new Date());
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
