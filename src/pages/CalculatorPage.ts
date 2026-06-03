import { expect, type Locator, type Page } from '@playwright/test';
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

/** Characters appended to `#display.value` (internal representation, not button glyphs). */
const DISPLAY_APPEND: Record<string, string> = {
  '+': '+',
  '-': '/',
  '*': '*',
  '/': '/',
  '(': '(',
  ')': ')',
  '.': '.',
};

/**
 * Page Object for the RBI Hub scientific calculator.
 * @see https://rbihubcodechallenge.github.io/calculator/index.html
 */
export class CalculatorPage {
  readonly page: Page;

  /** Main expression / result display (`#display`). */
  readonly display: Locator;

  /** Clear (`C`) — stable entry point proving the keypad is interactive. */
  private readonly clearButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.display = page.locator('#display');
    this.clearButton = page.getByRole('button', { name: 'C', exact: true });
  }

  /**
   * Navigate and wait until the calculator is ready for input.
   * Retries transient GitHub Pages / network errors (ERR_CONNECTION_CLOSED, timeouts)
   * when many parallel tests each call goto() against the same external host.
   */
  async goto(): Promise<void> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.page.goto(calculatorPath, { waitUntil: 'domcontentloaded' });
        await expect(this.display).toBeVisible();
        await expect(this.clearButton).toBeEnabled();
        await expect(this.display).toHaveValue('');
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(500 * attempt);
      }
    }
  }

  /**
   * Reads the display once. Prefer {@link expectDisplayNumeric} / `expect(locator).toHaveValue()`
   * in tests — this is for composing custom poll-based assertions only.
   */
  async getDisplayValue(): Promise<string> {
    return this.display.inputValue();
  }

  /** Presses `C` and waits until the display is empty. */
  async clear(): Promise<void> {
    await this.clearButton.click();
    await expect(this.display).toHaveValue('');
  }

  /** Presses `=` — handler is synchronous; Playwright `click()` waits for it to finish. */
  async calculate(): Promise<void> {
    await this.getButton('=').click();
  }

  /** Alias for {@link calculate}. */
  async pressEquals(): Promise<void> {
    await this.calculate();
  }

  /** Presses `.` and verifies the staged display string. */
  async pressDecimal(): Promise<void> {
    const staged = (await this.display.inputValue()) + '.';
    await this.clickButtonAndWaitForDisplay('.', staged);
  }

  /**
   * Presses a single digit button (0–9).
   * DEF-01: The `3` button is miswired and appends `0` in the app under test.
   */
  async pressNumber(digit: Digit): Promise<void> {
    const appended = digit === 3 ? '0' : String(digit);
    const staged = (await this.display.inputValue()) + appended;
    await this.clickButtonAndWaitForDisplay(String(digit), staged);
  }

  /** Enters a multi-digit number by pressing each digit in sequence. */
  async enterNumber(value: number | string): Promise<void> {
    for (const char of String(value)) {
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
    const appended = DISPLAY_APPEND[op];
    const staged = (await this.display.inputValue()) + appended;
    await this.clickButtonAndWaitForDisplay(OPERATOR_BUTTON_LABELS[op], staged);
  }

  /** Presses a scientific function button. Handler is synchronous (inline `onclick`). */
  async pressScientific(fn: ScientificFunction): Promise<void> {
    await this.getButton(SCIENTIFIC_BUTTON_LABELS[fn]).click();
  }

  /**
   * Enters a full expression by pressing digits, operators, and decimals in order.
   * Verifies the staged display after every keystroke so rapid parallel clicks cannot
   * outpace the application's synchronous `append()` handler.
   * Does not press `=` — call {@link calculate} separately.
   */
  async enterExpression(expression: string): Promise<void> {
    let staged = '';

    for (const char of expression) {
      if (char === ' ') {
        continue;
      }

      if (char >= '0' && char <= '9') {
        staged += char === '3' ? '0' : char;
        await this.clickButtonAndWaitForDisplay(char, staged);
      } else if (char === '.') {
        staged += '.';
        await this.clickButtonAndWaitForDisplay('.', staged);
      } else if (
        char === '+' ||
        char === '-' ||
        char === '*' ||
        char === '/'
      ) {
        staged += DISPLAY_APPEND[char];
        await this.clickButtonAndWaitForDisplay(
          OPERATOR_BUTTON_LABELS[char],
          staged,
        );
      } else if (char === '(' || char === ')') {
        staged += char;
        await this.clickButtonAndWaitForDisplay(char, staged);
      } else {
        throw new Error(`Unsupported character in expression: "${char}"`);
      }
    }
  }

  /**
   * Clears the display, enters an expression, and presses `=`.
   * Confirms the full staged expression is present before evaluation.
   */
  async evaluate(expression: string): Promise<void> {
    await this.clear();
    await this.enterExpression(expression);
    await expect(this.display).toHaveValue(this.stagedDisplayFromExpression(expression));
    await this.calculate();
  }

  /**
   * Maps a logical expression to the value held in `#display` before `=`.
   * Mirrors known app wiring (DEF-01, DEF-02) so waits assert real UI state.
   */
  stagedDisplayFromExpression(expression: string): string {
    let staged = '';
    for (const char of expression) {
      if (char === ' ') {
        continue;
      }
      if (char >= '0' && char <= '9') {
        staged += char === '3' ? '0' : char;
      } else if (char in DISPLAY_APPEND) {
        staged += DISPLAY_APPEND[char];
      }
    }
    return staged;
  }

  /**
   * Clicks a keypad button and auto-retries until the display matches the staged value.
   */
  private async clickButtonAndWaitForDisplay(
    label: string,
    expectedDisplay: string,
  ): Promise<void> {
    await this.getButton(label).click();
    await expect(this.display).toHaveValue(expectedDisplay);
  }

  /** Resolves a calculator button by its visible label using role-based locators. */
  private getButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }
}
