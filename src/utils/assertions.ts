import { expect } from '@playwright/test';
import type { CalculatorPage } from '../pages/CalculatorPage';

/**
 * Asserts the calculator display parses to a number close to `expected`.
 */
export async function expectDisplayNumeric(
  calculator: CalculatorPage,
  expected: number,
  precision = 5,
): Promise<void> {
  const raw = await calculator.getDisplayValue();
  const actual = Number(raw);
  expect(Number.isFinite(actual), `Display "${raw}" is not a finite number`).toBe(
    true,
  );
  expect(actual).toBeCloseTo(expected, precision);
}

/** Asserts the display shows an exact string (e.g. "Error"). */
export async function expectDisplayText(
  calculator: CalculatorPage,
  expected: string,
): Promise<void> {
  await expect(calculator.display).toHaveValue(expected);
}
