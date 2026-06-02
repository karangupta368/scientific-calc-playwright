import { type Locator, type Page } from '@playwright/test';
import { calculatorPath } from '../config/env';

/** Digits shown on calculator buttons (0–9). */
export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Arithmetic / grouping operators (logical symbols).
 * Mapped to visible button labels in {@link OPERATOR_BUTTON_LABELS}.
 */
export type ArithmeticOperator = '+' | '-' | '*' | '/';

export type GroupingSymbol = '(' | ')';

export type CalculatorOperator = ArithmeticOperator | GroupingSymbol;

/**
 * Scientific functions exposed on the calculator keypad.
 * `sqrt` maps to the visible `√` button.
 */
export type ScientificFunction = 'sin' | 'cos' | 'tan' | 'sqrt' | 'log';

/**
 * Visible button labels for each logical operator.
 * Note: DEF-02 — the `−` button appends `/` instead of `-` in the app under test.
 */
const OPERATOR_BUTTON_LABELS: Record<CalculatorOperator, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '(': '(',
  ')': ')',
};

/** Visible labels for scientific function buttons. */
const SCIENTIFIC_BUTTON_LABELS: Record<ScientificFunction, string> = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  sqrt: '√',
  log: 'log',
};

/**
 * Page Object for the RBI Hub scientific calculator.
 * @see https://rbihubcodechallenge.github.io/calculator/index.html
 */
export class CalculatorPage {
  readonly page: Page;

  /** Main expression / result display (`#display`). */
  readonly display: Locator;

  constructor(page: Page) {
    this.page = page;
    this.display = page.locator('#display');
  }

  /** Navigate to the calculator using `baseURL` from Playwright config. */
  async goto(): Promise<void> {
    await this.page.goto(calculatorPath);
    await this.display.waitFor({ state: 'visible' });
  }

  /**
   * Returns the current value shown in the display.
   */
  async getDisplayValue(): Promise<string> {
    return this.display.inputValue();
  }

  /**
   * Presses the clear (`C`) button.
   */
  async clear(): Promise<void> {
    await this.getButton('C').click();
  }

  /**
   * Presses the equals (`=`) button and evaluates the expression.
   */
  async calculate(): Promise<void> {
    await this.getButton('=').click();
  }

  /** Alias for {@link calculate}. */
  async pressEquals(): Promise<void> {
    await this.calculate();
  }

  /**
   * Presses the decimal point (`.`) button.
   */
  async pressDecimal(): Promise<void> {
    await this.getButton('.').click();
  }

  /**
   * Presses a single digit button (0–9).
   * DEF-01: The `3` button is miswired and appends `0` in the app under test.
   */
  async pressNumber(digit: Digit): Promise<void> {
    await this.getButton(String(digit)).click();
  }

  /**
   * Enters a multi-digit number by pressing each digit in sequence.
   */
  async enterNumber(value: number | string): Promise<void> {
    const digits = String(value).split('');
    for (const char of digits) {
      if (char === '.') {
        await this.pressDecimal();
        continue;
      }
      if (char >= '0' && char <= '9') {
        await this.pressNumber(Number(char) as Digit);
      }
    }
  }

  /**
   * Presses an arithmetic or grouping operator button.
   * @param op - Logical operator (`+`, `-`, `*`, `/`, `(`, `)`).
   */
  async pressOperator(op: CalculatorOperator): Promise<void> {
    const label = OPERATOR_BUTTON_LABELS[op];
    await this.getButton(label).click();
  }

  /**
   * Presses a scientific function button (sin, cos, tan, √, log).
   */
  async pressScientific(fn: ScientificFunction): Promise<void> {
    const label = SCIENTIFIC_BUTTON_LABELS[fn];
    await this.getButton(label).click();
  }

  /**
   * Enters a full expression by pressing digits, operators, and decimals in order.
   * Does not press `=` — call {@link calculate} separately.
   *
   * @example
   * await calculator.enterExpression('12+3.5');
   */
  async enterExpression(expression: string): Promise<void> {
    for (const char of expression) {
      if (char >= '0' && char <= '9') {
        await this.pressNumber(Number(char) as Digit);
      } else if (char === '.') {
        await this.pressDecimal();
      } else if (char === '+' || char === '-' || char === '*' || char === '/') {
        await this.pressOperator(char);
      } else if (char === '(' || char === ')') {
        await this.pressOperator(char);
      } else if (char === ' ') {
        continue;
      } else {
        throw new Error(`Unsupported character in expression: "${char}"`);
      }
    }
  }

  /**
   * Clears the display, enters an expression, and presses `=`.
   */
  async evaluate(expression: string): Promise<void> {
    await this.clear();
    await this.enterExpression(expression);
    await this.calculate();
  }

  /**
   * Resolves a calculator button by its visible label using role-based locators.
   */
  private getButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }
}
