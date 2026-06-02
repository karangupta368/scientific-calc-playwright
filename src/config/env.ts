import 'dotenv/config';

const DEFAULT_BASE_URL =
  'https://rbihubcodechallenge.github.io/calculator/';
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Parses a boolean environment variable.
 * Accepts "true" / "false" (case-insensitive). Falls back when unset or invalid.
 */
function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
}

/**
 * Parses a positive integer environment variable, or returns undefined.
 */
function parsePositiveInt(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Base URL for the calculator app (trailing slash recommended). */
export const baseUrl = process.env.BASE_URL?.trim() || DEFAULT_BASE_URL;

/** Whether browsers run in headless mode. */
export const headless = parseBoolean(process.env.HEADLESS, true);

/** Optional worker count for parallel execution. */
export const workers = parsePositiveInt(process.env.WORKERS);

/** Default test timeout in milliseconds. */
export const timeoutMs =
  parsePositiveInt(process.env.TIMEOUT) ?? DEFAULT_TIMEOUT_MS;

/** Relative path from baseUrl to the calculator page. */
export const calculatorPath = 'index.html';

const DEFAULT_PROJECTS = ['chromium', 'firefox', 'webkit'] as const;
export type BrowserProject = (typeof DEFAULT_PROJECTS)[number];

/**
 * Comma-separated Playwright project names to run (e.g. "chromium,firefox").
 * Use "chromium,firefox" on macOS 14 if you want to skip frozen WebKit locally.
 */
export const browserProjects: BrowserProject[] = (() => {
  const raw = process.env.PROJECTS?.trim();
  if (!raw) return [...DEFAULT_PROJECTS];
  const allowed = new Set<string>(DEFAULT_PROJECTS);
  const selected = raw
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length > 0);
  const valid = selected.filter((p): p is BrowserProject =>
    allowed.has(p),
  );
  return valid.length > 0 ? valid : [...DEFAULT_PROJECTS];
})();
