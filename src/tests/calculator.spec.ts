import { test, expect } from '../fixtures/calculator.fixture';
import { markExpectedApplicationDefect } from './known-defects';
import {
  PEMDAS_CASES,
  PEMDAS_CATEGORY_LABELS,
  type PemdasCategory,
} from './pemdas.cases';
import {
  REGRESSION_ONLY,
  SANITY_AND_REGRESSION,
} from './tags';
import {
  expectDisplayNotText,
  expectDisplayNumeric,
  expectDisplayOneOf,
  expectDisplaySettled,
  expectDisplayText,
} from '../utils/assertions';

test.describe('Scientific Calculator', () => {
  test.describe('Basic operations', () => {
    test('addition: 2 + 2 = 4', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      await calculator.evaluate('2+2');
      await expectDisplayNumeric(calculator, 4);
    });

    test('multiplication: 6 × 7 = 42', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      await calculator.evaluate('6*7');
      await expectDisplayNumeric(calculator, 42);
    });

    test('subtraction: 10 − 3 = 7', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-02');
      await calculator.evaluate('10-3');
      await expectDisplayNumeric(calculator, 7);
    });

    test('division: 8 ÷ 2 = 4', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-04');
      await calculator.evaluate('8/2');
      await expectDisplayNumeric(calculator, 4);
    });

    test('division: 12 ÷ 4 = 3', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-04');
      await calculator.evaluate('12/4');
      await expectDisplayNumeric(calculator, 3);
    });
  });

  test.describe('Edge cases', () => {
    test('division by zero: 8 ÷ 0 shows Error or Infinity', {
      tag: SANITY_AND_REGRESSION,
    }, async ({ calculator }) => {
      markExpectedApplicationDefect('DEF-05');
      await calculator.evaluate('8/0');
      await expectDisplayOneOf(calculator, ['Error', 'Infinity', '-Infinity']);
    });

    test('decimal addition: 1.2 + 2.4 = 3.6', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      await calculator.evaluate('1.2+2.4');
      await expectDisplayNumeric(calculator, 3.6);
    });

    test('clearing display resets mid-calculation', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      await calculator.enterExpression('6+2');
      await expect(calculator.display).toHaveValue('6+2');
      await calculator.clear();
      await expect(calculator.display).toHaveValue('');
    });

    test('clear then new calculation: 2 + 2 = 4', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      await calculator.enterExpression('9*9');
      await calculator.clear();
      await calculator.evaluate('2+2');
      await expectDisplayNumeric(calculator, 4);
    });

    test('equals on empty display shows 0 or Error, not undefined', {
      tag: REGRESSION_ONLY,
    }, async ({ calculator }) => {
      markExpectedApplicationDefect('DEF-10');
      await calculator.calculate();
      const display = await expectDisplaySettled(calculator);
      expect(display).not.toBe('undefined');
      expect(['0', 'Error', ''].includes(display)).toBe(true);
    });

    test('large values: 999999 × 2', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
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
          test(`${pemdasCase.id}: ${pemdasCase.title}`, {
            tag: pemdasCase.sanity ? SANITY_AND_REGRESSION : REGRESSION_ONLY,
          }, async ({ calculator }) => {
            if (pemdasCase.defects?.length) {
              markExpectedApplicationDefect(...pemdasCase.defects);
              test.info().annotations.push({
                type: 'defect',
                description: pemdasCase.defects.join(', '),
              });
            }
            await calculator.evaluate(pemdasCase.expression);
            await expectDisplayNumeric(
              calculator,
              pemdasCase.expected,
              5,
              { timeout: pemdasCase.defects?.length ? 1_000 : undefined },
            );
          });
        }
      });
    }
  });

  test.describe('Scientific functions', () => {
    test('sin on empty display does not show Error', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-13');
      await calculator.pressScientific('sin');
      await expectDisplayNotText(calculator, 'Error');
    });

    test('cos on empty display does not show Error', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-13');
      await calculator.pressScientific('cos');
      await expectDisplayNotText(calculator, 'Error');
    });

    test('tan on empty display does not show Error', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-13');
      await calculator.pressScientific('tan');
      await expectDisplayNotText(calculator, 'Error');
    });

    test('square root on empty display does not show Error', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-14');
      await calculator.pressScientific('sqrt');
      await expectDisplayNotText(calculator, 'Error');
    });

    test('square root: √9 = 3', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      await calculator.enterNumber(9);
      await calculator.pressScientific('sqrt');
      await expectDisplayNumeric(calculator, 3);
    });

    test('sin(90) ≈ Math.sin(90 radians)', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-12');
      await calculator.enterNumber(90);
      await calculator.pressScientific('sin');
      await expectDisplayNumeric(calculator, Math.sin(90), 5, { timeout: 1_000 });
    });

    test('cos(0) = 1', { tag: SANITY_AND_REGRESSION }, async ({ calculator }) => {
      await calculator.enterNumber(0);
      await calculator.pressScientific('cos');
      await expectDisplayNumeric(calculator, 1);
    });

    test('tan(0) = 0', { tag: SANITY_AND_REGRESSION }, async ({ calculator }) => {
      await calculator.enterNumber(0);
      await calculator.pressScientific('tan');
      await expectDisplayNumeric(calculator, 0);
    });

    test('log(0) shows Error', { tag: REGRESSION_ONLY }, async ({ calculator }) => {
      markExpectedApplicationDefect('DEF-18');
      await calculator.enterNumber(0);
      await calculator.pressScientific('log');
      await expectDisplayText(calculator, 'Error', { timeout: 1_000 });
    });
  });

  test.describe('UI button mapping', () => {
    test('pressing 3 shows 3 in the display', { tag: SANITY_AND_REGRESSION }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-01');
      await calculator.pressNumber(3);
      await expect(calculator.display).toHaveValue('3', { timeout: 1_000 });
    });

    test('pressing minus after 5 shows 5- in the display', {
      tag: SANITY_AND_REGRESSION,
    }, async ({ calculator }) => {
      markExpectedApplicationDefect('DEF-02');
      await calculator.pressNumber(5);
      await calculator.pressOperator('-');
      await expect(calculator.display).toHaveValue('5-', { timeout: 1_000 });
    });

    test('divide and minus buttons produce different expressions', {
      tag: REGRESSION_ONLY,
    }, async ({ calculator }) => {
      markExpectedApplicationDefect('DEF-03');
      await calculator.pressNumber(8);
      await calculator.pressOperator('/');
      const afterDivide = await calculator.display.inputValue();
      await calculator.clear();
      await calculator.pressNumber(8);
      await calculator.pressOperator('-');
      const afterMinus = await calculator.display.inputValue();
      expect(afterMinus).not.toBe(afterDivide);
    });
  });

  test.describe('Expression parsing defects', () => {
    test('missing closing parenthesis shows Error', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-08');
      await calculator.evaluate('(2+3');
      await expectDisplayText(calculator, 'Error', { timeout: 1_000 });
    });

    test('stray closing parenthesis shows Error', { tag: REGRESSION_ONLY }, async ({
      calculator,
    }) => {
      markExpectedApplicationDefect('DEF-09');
      await calculator.evaluate('2+3)');
      await expectDisplayText(calculator, 'Error', { timeout: 1_000 });
    });

    test('cos applied to 5+2 uses full expression or rejects', {
      tag: REGRESSION_ONLY,
    }, async ({ calculator }) => {
      markExpectedApplicationDefect('DEF-15');
      await calculator.enterExpression('5+2');
      await calculator.pressScientific('cos');
      const display = await expectDisplaySettled(calculator);
      const cosOf7 = Math.cos(7);
      const cosOf5 = Math.cos(5);
      expect(Number(display)).toBeCloseTo(cosOf7, 5);
      expect(Number(display)).not.toBeCloseTo(cosOf5, 5);
    });
  });
});
