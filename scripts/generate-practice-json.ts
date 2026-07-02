import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface PracticeEntry {
  date: string;
  practiceTime: number;
}

const REPO_ROOT = process.cwd();
const LOGS_DIR = path.join(REPO_ROOT, "logs");
const OUTPUT_DIR = path.join(REPO_ROOT, "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "practice-days.json");
const DATE_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})\.md$/;
const TOTAL_TIME_PATTERN = /\*\*Total time:\*\*\s*([^\n\r]+)/i;

async function main(): Promise<void> {
  const practiceFiles = await collectPracticeFiles(LOGS_DIR);
  const payload = await parsePracticeEntries(practiceFiles);

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

async function parsePracticeEntries(filePaths: string[]): Promise<PracticeEntry[]> {
  const practiceEntries: PracticeEntry[] = [];

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const dateMatch = fileName.match(DATE_FILENAME_PATTERN);

    if (!dateMatch) {
      continue;
    }

    const practiceDate = dateMatch[1];
    const markdown = await readFile(filePath, "utf8");
    const practiceTime = parsePracticeTimeMinutes(markdown);

    if (practiceTime === null) {
      continue;
    }

    practiceEntries.push({
      date: practiceDate,
      practiceTime
    });
  }

  practiceEntries.sort((left, right) => left.date.localeCompare(right.date));
  return practiceEntries;
}

function parsePracticeTimeMinutes(markdown: string): number | null {
  const totalTimeMatch = markdown.match(TOTAL_TIME_PATTERN);

  if (!totalTimeMatch) {
    return null;
  }

  const rawTotalTime = totalTimeMatch[1].trim();
  const minuteMatch = rawTotalTime.match(/(\d+)/);

  if (!minuteMatch) {
    return null;
  }

  const totalMinutes = Number.parseInt(minuteMatch[1], 10);
  return Number.isFinite(totalMinutes) ? totalMinutes : null;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
