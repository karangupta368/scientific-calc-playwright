import { test, expect } from '@playwright/test';
import { CalculatorPage } from '../pages/CalculatorPage';
import {
  PEMDAS_CASES,
  PEMDAS_CATEGORY_LABELS,
  type PemdasCategory,
} from './pemdas.cases';
import {
  expectDisplayNumeric,
  expectDisplayText,
} from '../utils/assertions';

test.describe('Scientific Calculator', () => {
  let calculator: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calculator = new CalculatorPage(page);
    await calculator.goto();
  });

  test.describe('Basic operations', () => {
    test('addition: 2 + 2 = 4', async () => {
      await calculator.evaluate('2+2');
      await expectDisplayNumeric(calculator, 4);
    });

    test('multiplication: 6 × 7 = 42', async () => {
      await calculator.evaluate('6*7');
      await expectDisplayNumeric(calculator, 42);
    });

    // DEF-02: The `−` button appends `/` instead of `-`, so subtraction cannot be entered via UI.
    test('subtraction: 10 − 3 = 7', async () => {
      await calculator.evaluate('10-3');
      await expectDisplayNumeric(calculator, 7);
    });

    // DEF-04: Division operands are evaluated in reverse order (8/2 → 2/8).
    test('division: 8 ÷ 2 = 4', async () => {
      await calculator.evaluate('8/2');
      await expectDisplayNumeric(calculator, 4);
    });

    // DEF-04
    test('division: 12 ÷ 4 = 3', async () => {
      await calculator.evaluate('12/4');
      await expectDisplayNumeric(calculator, 3);
    });
  });

  test.describe('Edge cases', () => {
    // DEF-05: Due to reversed division, 8/0 is evaluated as 0/8 → 0 instead of Error/Infinity.
    test('division by zero: 8 ÷ 0 shows Error or Infinity', async () => {
      await calculator.evaluate('8/0');
      const display = await calculator.getDisplayValue();
      expect(
        display === 'Error' || display === 'Infinity' || display === '-Infinity',
        `Expected Error or Infinity, got "${display}"`,
      ).toBe(true);
    });

    // Avoid digit 3 in expression (DEF-01); validates decimal entry otherwise.
    test('decimal addition: 1.2 + 2.4 = 3.6', async () => {
      await calculator.evaluate('1.2+2.4');
      await expectDisplayNumeric(calculator, 3.6);
    });

    test('clearing display resets mid-calculation', async () => {
      await calculator.enterExpression('6+2');
      await expect(calculator.display).toHaveValue('6+2');
      await calculator.clear();
      await expect(calculator.display).toHaveValue('');
    });

    test('clear then new calculation: 2 + 2 = 4', async () => {
      await calculator.enterExpression('9*9');
      await calculator.clear();
      await calculator.evaluate('2+2');
      await expectDisplayNumeric(calculator, 4);
    });

    // DEF-10: Empty expression on `=` should not show "undefined".
    test('equals on empty display shows 0 or Error, not undefined', async () => {
      await calculator.calculate();
      const display = await calculator.getDisplayValue();
      expect(display).not.toBe('undefined');
      expect(display === '0' || display === 'Error' || display === '').toBe(
        true,
      );
    });

    test('large values: 999999 × 2', async () => {
      await calculator.evaluate('999999*2');
      await expectDisplayNumeric(calculator, 1_999_998);
    });
  });

  test.describe('PEMDAS / BODMAS precedence', () => {
    const categories = [
      'higher_precedence_second',
      'higher_precedence_first',
      'equal_precedence',
      'parentheses',
      'nested_parentheses',
      'defect_regression',
    ] as const satisfies readonly PemdasCategory[];

    for (const category of categories) {
      test.describe(PEMDAS_CATEGORY_LABELS[category], () => {
        for (const pemdasCase of PEMDAS_CASES.filter(
          (c) => c.category === category,
        )) {
          test(`${pemdasCase.id}: ${pemdasCase.title}`, async () => {
            if (pemdasCase.defects?.length) {
              test.info().annotations.push({
                type: 'defect',
                description: pemdasCase.defects.join(', '),
              });
            }
            await calculator.evaluate(pemdasCase.expression);
            await expectDisplayNumeric(calculator, pemdasCase.expected);
          });
        }
      });
    }
  });

  test.describe('Scientific functions', () => {
    // DEF-13: sin/cos/tan on empty display show Error instead of a sensible default.
    test('sin on empty display does not show Error', async () => {
      await calculator.pressScientific('sin');
      const display = await calculator.getDisplayValue();
      expect(display).not.toBe('Error');
    });

    // DEF-13
    test('cos on empty display does not show Error', async () => {
      await calculator.pressScientific('cos');
      const display = await calculator.getDisplayValue();
      expect(display).not.toBe('Error');
    });

    // DEF-13
    test('tan on empty display does not show Error', async () => {
      await calculator.pressScientific('tan');
      const display = await calculator.getDisplayValue();
      expect(display).not.toBe('Error');
    });

    // DEF-14: sqrt on empty display shows Error.
    test('square root on empty display does not show Error', async () => {
      await calculator.pressScientific('sqrt');
      const display = await calculator.getDisplayValue();
      expect(display).not.toBe('Error');
    });

    // DEF-17 (positive path): √9 = 3
    test('square root: √9 = 3', async () => {
      await calculator.enterNumber(9);
      await calculator.pressScientific('sqrt');
      await expectDisplayNumeric(calculator, 3);
    });

    // DEF-12: sin always returns 1 regardless of input (should be Math.sin in radians).
    test('sin(90) ≈ Math.sin(90 radians)', async () => {
      await calculator.enterNumber(90);
      await calculator.pressScientific('sin');
      await expectDisplayNumeric(calculator, Math.sin(90));
    });

    test('cos(0) = 1', async () => {
      await calculator.enterNumber(0);
      await calculator.pressScientific('cos');
      await expectDisplayNumeric(calculator, 1);
    });

    test('tan(0) = 0', async () => {
      await calculator.enterNumber(0);
      await calculator.pressScientific('tan');
      await expectDisplayNumeric(calculator, 0);
    });

    // DEF-18: log(0) should show Error, not -Infinity.
    test('log(0) shows Error', async () => {
      await calculator.enterNumber(0);
      await calculator.pressScientific('log');
      await expectDisplayText(calculator, 'Error');
    });
  });

  test.describe('UI button mapping', () => {
    // DEF-01: Button labeled `3` appends `0` to the display.
    test('pressing 3 shows 3 in the display', async () => {
      await calculator.pressNumber(3);
      await expect(calculator.display).toHaveValue('3');
    });

    // DEF-02: Button labeled `−` should append `-`, not `/`.
    test('pressing minus after 5 shows 5- in the display', async () => {
      await calculator.pressNumber(5);
      await calculator.pressOperator('-');
      await expect(calculator.display).toHaveValue('5-');
    });

    // DEF-03: `÷` and `−` should be distinct (both currently append `/`).
    test('divide and minus buttons produce different expressions', async () => {
      await calculator.pressNumber(8);
      await calculator.pressOperator('/');
      const afterDivide = await calculator.getDisplayValue();
      await calculator.clear();
      await calculator.pressNumber(8);
      await calculator.pressOperator('-');
      const afterMinus = await calculator.getDisplayValue();
      expect(afterMinus).not.toBe(afterDivide);
    });
  });

  test.describe('Expression parsing defects', () => {
    // DEF-08: Missing `)` should show Error, not NaN.
    test('missing closing parenthesis shows Error', async () => {
      await calculator.evaluate('(2+3');
      await expectDisplayText(calculator, 'Error');
    });

    // DEF-09: Stray `)` should show Error, not a partial result.
    test('stray closing parenthesis shows Error', async () => {
      await calculator.evaluate('2+3)');
      await expectDisplayText(calculator, 'Error');
    });

    // DEF-15: Scientific functions should not silently use parseFloat prefix of an expression.
    test('cos applied to 5+2 uses full expression or rejects', async () => {
      await calculator.enterExpression('5+2');
      await calculator.pressScientific('cos');
      const display = await calculator.getDisplayValue();
      const cosOf7 = Math.cos(7);
      const cosOf5 = Math.cos(5);
      expect(Number(display)).toBeCloseTo(cosOf7, 5);
      expect(Number(display)).not.toBeCloseTo(cosOf5, 5);
    });
  });
});
