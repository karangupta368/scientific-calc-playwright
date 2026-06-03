import { test as base, expect } from '@playwright/test';
import { CalculatorPage } from '../pages/CalculatorPage';

type CalculatorFixtures = {
  /** Fresh CalculatorPage per test — no shared describe-level state under fullyParallel. */
  calculator: CalculatorPage;
};

export const test = base.extend<CalculatorFixtures>({
  calculator: async ({ page }, use) => {
    const calculator = new CalculatorPage(page);
    await calculator.goto();
    await use(calculator);
  },
});

export { expect };
