import { expect } from '@playwright/test';
import type { CalculatorPage } from '../pages/CalculatorPage';

/** Default poll timeout for result assertions (Playwright expect timeout). */
const RESULT_POLL_TIMEOUT = 10_000;

/**
 * Brief poll timeout for defect-monitor tests marked with test.fail().
 * Avoids burning the full 10s expect retry when the app is still broken by design.
 */
const DEFECT_MONITOR_POLL_TIMEOUT = 1_000;

/**
 * Asserts the calculator display parses to a number close to `expected`.
 * Uses expect.poll so transient reads during `=` evaluation auto-retry.
 */
export async function expectDisplayNumeric(
  calculator: CalculatorPage,
  expected: number,
  precision = 5,
  options?: { timeout?: number },
): Promise<void> {
  await expect
    .poll(
      async () => {
        const raw = await calculator.display.inputValue();
        const actual = Number(raw);
        return Number.isFinite(actual) ? actual : Number.NaN;
      },
      {
        message: `Expected display to show a numeric value close to ${expected}`,
        timeout: options?.timeout ?? RESULT_POLL_TIMEOUT,
      },
    )
    .toBeCloseTo(expected, precision);
}

/** Asserts the display shows an exact string (e.g. "Error") with built-in retry. */
export async function expectDisplayText(
  calculator: CalculatorPage,
  expected: string,
  options?: { timeout?: number },
): Promise<void> {
  await expect(calculator.display).toHaveValue(expected, options);
}

/**
 * Asserts the display is one of the allowed literal strings (poll + retry).
 * Use for branching outcomes such as Error vs Infinity.
 */
export async function expectDisplayOneOf(
  calculator: CalculatorPage,
  allowed: readonly string[],
  options?: { timeout?: number },
): Promise<void> {
  await expect
    .poll(async () => calculator.display.inputValue(), {
      message: `Expected display to be one of: ${allowed.join(', ')}`,
      timeout: options?.timeout ?? RESULT_POLL_TIMEOUT,
    })
    .toMatch(new RegExp(`^(${allowed.map(escapeRegExp).join('|')})$`));
}

/**
 * Asserts the display does not equal `unexpected`, with a short poll window.
 * Intended for defect monitors (test.fail) where a fast, deterministic check is preferred
 * over a 10s auto-retry against a known-broken UI.
 */
export async function expectDisplayNotText(
  calculator: CalculatorPage,
  unexpected: string,
  options?: { timeout?: number },
): Promise<void> {
  await expect
    .poll(async () => calculator.display.inputValue(), {
      message: `Expected display not to be "${unexpected}"`,
      timeout: options?.timeout ?? DEFECT_MONITOR_POLL_TIMEOUT,
    })
    .not.toBe(unexpected);
}

/**
 * Returns the display value after it settles (non-empty) following an action.
 * Uses poll-based waiting instead of a one-shot inputValue() read.
 */
export async function expectDisplaySettled(
  calculator: CalculatorPage,
  options?: { timeout?: number },
): Promise<string> {
  let settled = '';
  await expect
    .poll(
      async () => {
        settled = await calculator.display.inputValue();
        return settled;
      },
      {
        message: 'Expected calculator display to settle to a non-empty value',
        timeout: options?.timeout ?? DEFECT_MONITOR_POLL_TIMEOUT,
      },
    )
    .not.toBe('');
  return settled;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
