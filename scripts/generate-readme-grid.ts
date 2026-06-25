import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface PracticeDaysPayload {
  days: Record<string, boolean>;
  lastUpdated: string;
}

const REPO_ROOT = process.cwd();
const README_FILE = path.join(REPO_ROOT, "README.md");
const PRACTICE_DAYS_FILE = path.join(REPO_ROOT, "generated", "practice-days.json");
const GRID_START = "<!-- PRACTICE_GRID_START -->";
const GRID_END = "<!-- PRACTICE_GRID_END -->";
const TARGET_YEAR = 2026;
const PRACTICED_DAY = "🟩";
const NOT_PRACTICED_DAY = "⬜";
const EMPTY_DAY = "  ";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

async function main(): Promise<void> {
  const practiceDays = await readPracticeDays();
  const readme = await readFile(README_FILE, "utf8");
  const nextReadme = replaceGridSection(readme, buildGridSection(practiceDays));

  await writeFile(README_FILE, nextReadme, "utf8");
  console.log(`Updated ${path.relative(REPO_ROOT, README_FILE)}`);
}

async function readPracticeDays(): Promise<PracticeDaysPayload> {
  const raw = await readFile(PRACTICE_DAYS_FILE, "utf8");
  return JSON.parse(raw) as PracticeDaysPayload;
}

function replaceGridSection(readme: string, gridSection: string): string {
  const startIndex = readme.indexOf(GRID_START);
  const endIndex = readme.indexOf(GRID_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`README is missing ${GRID_START} / ${GRID_END} markers.`);
  }

  const before = readme.slice(0, startIndex + GRID_START.length);
  const after = readme.slice(endIndex);

  return `${before}\n\n${gridSection}\n${after}`;
}

function buildGridSection(payload: PracticeDaysPayload): string {
  const monthBlocks = MONTH_NAMES.map((monthName, monthIndex) =>
    buildMonthBlock(TARGET_YEAR, monthIndex, payload.days)
  );

  return [
    `Generated from \`generated/practice-days.json\`. Last updated: \`${payload.lastUpdated}\`.`,
    "",
    ...monthBlocks.map((block) => `\`\`\`text\n${block}\n\`\`\``)
  ].join("\n");
}

function buildMonthBlock(year: number, monthIndex: number, practicedDays: Record<string, boolean>): string {
  const monthName = MONTH_NAMES[monthIndex];
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const leadingPadding = firstDay.getDay();
  const cells: string[] = Array.from({ length: leadingPadding }, () => EMPTY_DAY);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = formatIsoDate(new Date(year, monthIndex, day));
    cells.push(practicedDays[isoDate] ? PRACTICED_DAY : NOT_PRACTICED_DAY);
  }

  while (cells.length % 7 !== 0) {
    cells.push(EMPTY_DAY);
  }

  const weeks: string[] = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7).join(" "));
  }

  return [monthName, "Su Mo Tu We Th Fr Sa", ...weeks].join("\n");
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
