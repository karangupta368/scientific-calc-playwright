/**
 * PEMDAS / BODMAS test matrix for the scientific calculator.
 * Expected values follow standard order: parentheses → ×÷ (LTR) → +− (LTR).
 * Exponentiation is not available on this keypad.
 */
export interface PemdasCase {
  /** Stable id for TEST_PLAN traceability (e.g. PEMDAS-001). */
  id: string;
  /** Human-readable title shown in the test report. */
  title: string;
  /** Expression entered via UI button clicks (no spaces). */
  expression: string;
  /** Mathematically correct result. */
  expected: number;
  /** Grouping for reports. */
  category: PemdasCategory;
  /** Known defect ids that may cause failure on the current app build. */
  defects?: string[];
  /** Include in @sanity smoke subset (also @regression). */
  sanity?: boolean;
}

export type PemdasCategory =
  | 'higher_precedence_second'
  | 'higher_precedence_first'
  | 'equal_precedence'
  | 'parentheses'
  | 'nested_parentheses'
  | 'defect_regression';

/** × and ÷ bind tighter than + and −; second operator is × or ÷. */
const HIGHER_PRECEDENCE_SECOND: PemdasCase[] = [
  {
    id: 'PEMDAS-001',
    title: '2 + 4 × 4 = 18',
    expression: '2+4*4',
    expected: 18,
    category: 'higher_precedence_second',
    sanity: true,
  },
  {
    id: 'PEMDAS-002',
    title: '5 + 2 × 2 = 9',
    expression: '5+2*2',
    expected: 9,
    category: 'higher_precedence_second',
    sanity: true,
  },
  {
    id: 'PEMDAS-003',
    title: '2 + 8 ÷ 4 = 4',
    expression: '2+8/4',
    expected: 4,
    category: 'higher_precedence_second',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-004',
    title: '5 + 8 ÷ 4 = 7',
    expression: '5+8/4',
    expected: 7,
    category: 'higher_precedence_second',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-005',
    title: '10 − 2 × 2 = 6',
    expression: '10-2*2',
    expected: 6,
    category: 'higher_precedence_second',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-006',
    title: '9 − 2 × 4 = 1',
    expression: '9-2*4',
    expected: 1,
    category: 'higher_precedence_second',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-007',
    title: '10 − 8 ÷ 4 = 8',
    expression: '10-8/4',
    expected: 8,
    category: 'higher_precedence_second',
    defects: ['DEF-02', 'DEF-04'],
  },
  {
    id: 'PEMDAS-008',
    title: '9 − 8 ÷ 4 = 7',
    expression: '9-8/4',
    expected: 7,
    category: 'higher_precedence_second',
    defects: ['DEF-02', 'DEF-04'],
  },
];

/** × or ÷ appears first in the expression (still binds before +/−). */
const HIGHER_PRECEDENCE_FIRST: PemdasCase[] = [
  {
    id: 'PEMDAS-009',
    title: '6 × 2 + 1 = 13',
    expression: '6*2+1',
    expected: 13,
    category: 'higher_precedence_first',
    sanity: true,
  },
  {
    id: 'PEMDAS-010',
    title: '4 × 2 + 5 = 13',
    expression: '4*2+5',
    expected: 13,
    category: 'higher_precedence_first',
    sanity: true,
  },
  {
    id: 'PEMDAS-011',
    title: '6 × 2 − 1 = 11',
    expression: '6*2-1',
    expected: 11,
    category: 'higher_precedence_first',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-012',
    title: '4 × 2 − 1 = 7',
    expression: '4*2-1',
    expected: 7,
    category: 'higher_precedence_first',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-013',
    title: '8 ÷ 4 + 2 = 4',
    expression: '8/4+2',
    expected: 4,
    category: 'higher_precedence_first',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-014',
    title: '8 ÷ 2 + 1 = 5',
    expression: '8/2+1',
    expected: 5,
    category: 'higher_precedence_first',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-015',
    title: '8 ÷ 4 − 1 = 1',
    expression: '8/4-1',
    expected: 1,
    category: 'higher_precedence_first',
    defects: ['DEF-02', 'DEF-04'],
  },
  {
    id: 'PEMDAS-016',
    title: '8 ÷ 2 − 1 = 3',
    expression: '8/2-1',
    expected: 3,
    category: 'higher_precedence_first',
    defects: ['DEF-02', 'DEF-04'],
  },
];

/** Same precedence, evaluated left to right. */
const EQUAL_PRECEDENCE: PemdasCase[] = [
  {
    id: 'PEMDAS-017',
    title: '6 × 2 ÷ 2 = 6',
    expression: '6*2/2',
    expected: 6,
    category: 'equal_precedence',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-018',
    title: '4 × 2 ÷ 2 = 4',
    expression: '4*2/2',
    expected: 4,
    category: 'equal_precedence',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-019',
    title: '8 ÷ 4 × 2 = 4',
    expression: '8/4*2',
    expected: 4,
    category: 'equal_precedence',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-020',
    title: '8 ÷ 2 × 2 = 8',
    expression: '8/2*2',
    expected: 8,
    category: 'equal_precedence',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-021',
    title: '8 ÷ 4 ÷ 2 = 1',
    expression: '8/4/2',
    expected: 1,
    category: 'equal_precedence',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-022',
    title: '16 ÷ 4 ÷ 2 = 2',
    expression: '16/4/2',
    expected: 2,
    category: 'equal_precedence',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-023',
    title: '2 × 4 × 2 = 16',
    expression: '2*4*2',
    expected: 16,
    category: 'equal_precedence',
    sanity: true,
  },
  {
    id: 'PEMDAS-024',
    title: '8 + 2 + 4 = 14',
    expression: '8+2+4',
    expected: 14,
    category: 'equal_precedence',
    sanity: true,
  },
  {
    id: 'PEMDAS-025',
    title: '10 + 2 − 4 = 8',
    expression: '10+2-4',
    expected: 8,
    category: 'equal_precedence',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-026',
    title: '10 − 2 + 4 = 12',
    expression: '10-2+4',
    expected: 12,
    category: 'equal_precedence',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-027',
    title: '10 − 2 − 4 = 4',
    expression: '10-2-4',
    expected: 4,
    category: 'equal_precedence',
    defects: ['DEF-02'],
  },
];

/** Parentheses override standard precedence. */
const PARENTHESES: PemdasCase[] = [
  {
    id: 'PEMDAS-028',
    title: '(2 + 2) × 4 = 16',
    expression: '(2+2)*4',
    expected: 16,
    category: 'parentheses',
    defects: ['DEF-06'],
    sanity: true,
  },
  {
    id: 'PEMDAS-029',
    title: '(6 + 2) × 2 = 16',
    expression: '(6+2)*2',
    expected: 16,
    category: 'parentheses',
    defects: ['DEF-06'],
  },
  {
    id: 'PEMDAS-030',
    title: '(6 + 2) ÷ 4 = 2',
    expression: '(6+2)/4',
    expected: 2,
    category: 'parentheses',
    defects: ['DEF-04', 'DEF-06'],
  },
  {
    id: 'PEMDAS-031',
    title: '(8 − 2) × 2 = 12',
    expression: '(8-2)*2',
    expected: 12,
    category: 'parentheses',
    defects: ['DEF-02', 'DEF-06'],
  },
  {
    id: 'PEMDAS-032',
    title: '(8 − 2) ÷ 2 = 3',
    expression: '(8-2)/2',
    expected: 3,
    category: 'parentheses',
    defects: ['DEF-02', 'DEF-04', 'DEF-06'],
  },
  {
    id: 'PEMDAS-033',
    title: '2 × (4 + 2) = 12',
    expression: '2*(4+2)',
    expected: 12,
    category: 'parentheses',
  },
  {
    id: 'PEMDAS-034',
    title: '4 × (2 + 6) = 32',
    expression: '4*(2+6)',
    expected: 32,
    category: 'parentheses',
  },
  {
    id: 'PEMDAS-035',
    title: '2 × (6 − 2) = 8',
    expression: '2*(6-2)',
    expected: 8,
    category: 'parentheses',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-036',
    title: '8 ÷ (2 + 2) = 2',
    expression: '8/(2+2)',
    expected: 2,
    category: 'parentheses',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-037',
    title: '8 ÷ (6 − 2) = 2',
    expression: '8/(6-2)',
    expected: 2,
    category: 'parentheses',
    defects: ['DEF-02', 'DEF-04'],
  },
  {
    id: 'PEMDAS-038',
    title: '2 + (4 × 2) = 10',
    expression: '2+(4*2)',
    expected: 10,
    category: 'parentheses',
  },
  {
    id: 'PEMDAS-039',
    title: '5 + (2 × 4) = 13',
    expression: '5+(2*4)',
    expected: 13,
    category: 'parentheses',
  },
  {
    id: 'PEMDAS-040',
    title: '2 + (8 ÷ 4) = 4',
    expression: '2+(8/4)',
    expected: 4,
    category: 'parentheses',
    defects: ['DEF-04'],
  },
  {
    id: 'PEMDAS-041',
    title: '10 − (2 × 4) = 2',
    expression: '10-(2*4)',
    expected: 2,
    category: 'parentheses',
    defects: ['DEF-02'],
  },
  {
    id: 'PEMDAS-042',
    title: '10 − (8 ÷ 4) = 8',
    expression: '10-(8/4)',
    expected: 8,
    category: 'parentheses',
    defects: ['DEF-02', 'DEF-04'],
  },
  {
    id: 'PEMDAS-043',
    title: '(4 × 2) + 1 = 9',
    expression: '(4*2)+1',
    expected: 9,
    category: 'parentheses',
    defects: ['DEF-06'],
  },
  {
    id: 'PEMDAS-044',
    title: '(8 ÷ 4) + 2 = 4',
    expression: '(8/4)+2',
    expected: 4,
    category: 'parentheses',
    defects: ['DEF-04', 'DEF-06'],
  },
  {
    id: 'PEMDAS-045',
    title: '(4 × 2) ÷ 2 = 4',
    expression: '(4*2)/2',
    expected: 4,
    category: 'parentheses',
    defects: ['DEF-04', 'DEF-06'],
  },
];

const NESTED_PARENTHESES: PemdasCase[] = [
  {
    id: 'PEMDAS-046',
    title: '((2 + 2)) × 4 = 16',
    expression: '((2+2))*4',
    expected: 16,
    category: 'nested_parentheses',
  },
  {
    id: 'PEMDAS-047',
    title: '(2 + (4 + 2)) = 8',
    expression: '(2+(4+2))',
    expected: 8,
    category: 'nested_parentheses',
  },
  {
    id: 'PEMDAS-048',
    title: '((6 + 2) ÷ 2) × 2 = 8',
    expression: '((6+2)/2)*2',
    expected: 8,
    category: 'nested_parentheses',
  },
];

/** Canonical examples that include digit 3 or known parser bugs. */
const DEFECT_REGRESSION: PemdasCase[] = [
  {
    id: 'PEMDAS-049',
    title: '5 + 3 × 2 = 11 (digit 3)',
    expression: '5+3*2',
    expected: 11,
    category: 'defect_regression',
    defects: ['DEF-01'],
  },
  {
    id: 'PEMDAS-050',
    title: '(2 + 3) × 4 = 20 (digit 3)',
    expression: '(2+3)*4',
    expected: 20,
    category: 'defect_regression',
    defects: ['DEF-01', 'DEF-06'],
  },
  {
    id: 'PEMDAS-051',
    title: '2 + 3 × 4 = 14 (digit 3)',
    expression: '2+3*4',
    expected: 14,
    category: 'defect_regression',
    defects: ['DEF-01'],
  },
];

export const PEMDAS_CASES: PemdasCase[] = [
  ...HIGHER_PRECEDENCE_SECOND,
  ...HIGHER_PRECEDENCE_FIRST,
  ...EQUAL_PRECEDENCE,
  ...PARENTHESES,
  ...NESTED_PARENTHESES,
  ...DEFECT_REGRESSION,
];

export const PEMDAS_CATEGORY_LABELS: Record<PemdasCategory, string> = {
  higher_precedence_second: '×÷ before +− (operator second)',
  higher_precedence_first: '×÷ before +− (operator first)',
  equal_precedence: 'Equal precedence, left-to-right',
  parentheses: 'Parentheses override',
  nested_parentheses: 'Nested parentheses',
  defect_regression: 'Regression (digit 3 / parser)',
};
