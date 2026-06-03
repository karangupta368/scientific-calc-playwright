import { test } from '@playwright/test';

/**
 * Known application defects mapped to Jira-style ticket IDs.
 * Used with test.fail() for Green CI Gate — expected failures stay visible
 * without failing the pipeline (alert-fatigue mitigation).
 */
export const JIRA_DEFECTS: Record<string, string> = {
  'DEF-01': 'JIRA-CALC-101: Button "3" appends 0 instead of 3',
  'DEF-02': 'JIRA-CALC-102: Minus button appends "/" instead of "-"',
  'DEF-03': 'JIRA-CALC-103: Divide and minus buttons both append "/"',
  'DEF-04': 'JIRA-CALC-104: Division operands evaluated in reverse order',
  'DEF-05': 'JIRA-CALC-105: Division by zero returns 0 instead of Error/Infinity',
  'DEF-06': 'JIRA-CALC-106: Parser skips operator after closing parenthesis',
  'DEF-08': 'JIRA-CALC-108: Missing ")" shows NaN instead of Error',
  'DEF-09': 'JIRA-CALC-109: Stray ")" accepted; partial numeric result returned',
  'DEF-10': 'JIRA-CALC-110: Empty equals displays literal "undefined"',
  'DEF-12': 'JIRA-CALC-112: sin() hardcoded to 1 regardless of input',
  'DEF-13': 'JIRA-CALC-113: sin/cos/tan on empty display show Error',
  'DEF-14': 'JIRA-CALC-114: Square root on empty display shows Error',
  'DEF-15': 'JIRA-CALC-115: Scientific ops use parseFloat prefix only (cos(5+2) → cos(5))',
  'DEF-18': 'JIRA-CALC-118: log(0) returns -Infinity instead of Error',
};

/**
 * Marks the current test as an expected failure (Green CI Gate).
 * The test passes CI when the assertion fails; fails CI if the app is fixed unexpectedly.
 */
export function markExpectedApplicationDefect(...defectIds: string[]): void {
  const ticket = defectIds
    .map((id) => JIRA_DEFECTS[id] ?? id)
    .join(' | ');
  test.fail(true, ticket);
}
