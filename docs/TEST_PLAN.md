# Test Plan — Scientific Calculator E2E

| Field | Value |
|-------|--------|
| **Application** | [RBI Hub Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html) |
| **Automation** | Playwright + TypeScript |
| **Defect register** | [DEFECTS.md](DEFECTS.md) (DEF-01–DEF-22) |
| **Spec file** | [`../src/tests/calculator.spec.ts`](../src/tests/calculator.spec.ts) |
| **Page Object** | [`../src/pages/CalculatorPage.ts`](../src/pages/CalculatorPage.ts) |
| **PEMDAS matrix** | [`../src/tests/pemdas.cases.ts`](../src/tests/pemdas.cases.ts) (51 cases) |
| **Total automated tests** | 77 |
| **Strategy** | Assert **correct** calculator behavior; failures act as living defect reports |

---

## 1. Objectives

- Verify basic arithmetic, operator precedence, decimals, and display behavior through the UI.
- Verify scientific functions (sin, cos, tan, √, log) and edge cases (division by zero, clear, large numbers).
- Expose known application defects (DEF-01–DEF-22) via tests that encode the **expected** (correct) behavior.
- Provide repeatable cross-browser coverage via Playwright (Chromium, Firefox, WebKit).

---

## 2. Scope

### In scope

- All keypad interactions mapped in `CalculatorPage` (digits, operators, `C`, `=`, `.`, parentheses, scientific keys).
- Display readout assertions before and after evaluation.
- Expression entry via button clicks only (no direct DOM manipulation of the display).

### Out of scope

- Visual/regression testing of CSS layout (DEF-20–DEF-22 documented in [DEFECTS.md](DEFECTS.md)).
- Performance, load, and API testing (client-only app).
- Fixing defects in the application under test.

---

## 3. Test environment

| Item | Detail |
|------|--------|
| **Base URL** | `BASE_URL` env (default: `https://rbihubcodechallenge.github.io/calculator/`) |
| **Entry page** | `index.html` |
| **Browsers** | Chromium, Firefox, WebKit (`PROJECTS` env) |
| **Precondition** | Fresh page load; `CalculatorPage.goto()` in `beforeEach` |

---

## 4. Test data & conventions

- **Input method:** UI buttons via `CalculatorPage` (`evaluate`, `enterExpression`, `pressNumber`, etc.).
- **Numeric assertions:** `expectDisplayNumeric` — compares display to expected number with 5 decimal places tolerance.
- **Text assertions:** `expectDisplayText` or `expect(display).toHaveValue(...)` for exact strings (`Error`, expression preview).
- **Defect tags:** Comments and [DEFECTS.md](DEFECTS.md) reference **DEF-XX** IDs.

---

## 5. Suite summary

| Suite | Tests | Primary focus |
|-------|------:|---------------|
| Basic operations | 5 | +, −, ×, ÷ |
| Edge cases | 6 | Div by zero, decimals, clear, empty `=`, large values |
| PEMDAS / BODMAS precedence | 51 | Full operator-precedence matrix |
| Scientific functions | 10 | sin, cos, tan, √, log |
| UI button mapping | 3 | Miswired keys |
| Expression parsing defects | 3 | Invalid / partial expressions |
| **Total** | **77** | |

---

## 6. Test cases

### 6.1 Basic operations

| TC-ID | Test name (spec) | Steps | Expected result | Defect | Pass criteria |
|-------|------------------|-------|-----------------|--------|---------------|
| TC-001 | addition: 2 + 2 = 4 | Clear → enter `2+2` → `=` | Display shows `4` | — | Numeric ≈ 4 |
| TC-002 | multiplication: 6 × 7 = 42 | Clear → enter `6*7` → `=` | Display shows `42` | — | Numeric ≈ 42 |
| TC-003 | subtraction: 10 − 3 = 7 | Clear → enter `10-3` → `=` | Display shows `7` | DEF-02 | Numeric ≈ 7 |
| TC-004 | division: 8 ÷ 2 = 4 | Clear → enter `8/2` → `=` | Display shows `4` | DEF-04 | Numeric ≈ 4 |
| TC-005 | division: 12 ÷ 4 = 3 | Clear → enter `12/4` → `=` | Display shows `3` | DEF-04 | Numeric ≈ 3 |

**Notes**

- TC-003 uses the `−` button; DEF-02 causes `/` to be appended instead of `-`.
- TC-004 / TC-005: DEF-04 reverses division operands (e.g. `8/2` evaluates as `2/8`).

---

### 6.2 Edge cases

| TC-ID | Test name (spec) | Steps | Expected result | Defect | Pass criteria |
|-------|------------------|-------|-----------------|--------|---------------|
| TC-006 | division by zero: 8 ÷ 0 shows Error or Infinity | Clear → enter `8/0` → `=` | `Error`, `Infinity`, or `-Infinity` | DEF-05 | Display is one of those values |
| TC-007 | decimal addition: 1.2 + 2.4 = 3.6 | Clear → enter `1.2+2.4` → `=` | Display shows `3.6` | — | Numeric ≈ 3.6 |
| TC-008 | clearing display resets mid-calculation | Enter `6+2` → press `C` | Before clear: `6+2`; after: empty | — | `toHaveValue` assertions |
| TC-009 | clear then new calculation: 2 + 2 = 4 | Enter `9*9` → `C` → evaluate `2+2` | Display shows `4` | — | Numeric ≈ 4 |
| TC-010 | equals on empty display shows 0 or Error, not undefined | Press `=` on empty display | `0`, `Error`, or empty — not `undefined` | DEF-10 | Not `undefined`; value in allowed set |
| TC-011 | large values: 999999 × 2 | Clear → enter `999999*2` → `=` | Display shows `1999998` | — | Numeric ≈ 1_999_998 |

**Notes**

- TC-007 avoids digit `3` in the expression (DEF-01) while still validating decimal input.
- TC-006: DEF-05 — app may show `0` due to reversed division (`0/8`).

---

### 6.3 PEMDAS / BODMAS precedence (51 tests)

All cases are defined in [`../src/tests/pemdas.cases.ts`](../src/tests/pemdas.cases.ts) and executed from `calculator.spec.ts` under **PEMDAS / BODMAS precedence**. Each test clears the display, enters the expression via UI, presses `=`, and asserts the **mathematically correct** result.

**Order of operations (no exponents on this calculator):**

1. **Parentheses** (innermost first for nested forms)
2. **Multiplication & division** — equal precedence, left to right
3. **Addition & subtraction** — equal precedence, left to right

| Category | IDs | Count | Combinations covered |
|----------|-----|------:|----------------------|
| ×÷ before +− (× or ÷ second in expression) | PEMDAS-001 – 008 | 8 | `a+b×c`, `a+b÷c`, `a−b×c`, `a−b÷c` |
| ×÷ before +− (× or ÷ first in expression) | PEMDAS-009 – 016 | 8 | `a×b+c`, `a×b−c`, `a÷b+c`, `a÷b−c` |
| Equal precedence, left-to-right | PEMDAS-017 – 027 | 11 | `a×b÷c`, `a÷b×c`, `a÷b÷c`, `a×b×c`, `a+b+c`, `a+b−c`, `a−b+c`, `a−b−c` |
| Parentheses override | PEMDAS-028 – 045 | 18 | `(a±b)×÷c`, `a×÷(a±b)`, `a±(b×÷c)`, `(a×÷b)±÷c` |
| Nested parentheses | PEMDAS-046 – 048 | 3 | `((a+b))×c`, `a+(b+c)`, `((a+b)÷c)×d` |
| Defect regression (digit `3`) | PEMDAS-049 – 051 | 3 | `5+3×2`, `(2+3)×4`, `2+3×4` |

**Defect annotations on matrix cases**

| Defect | Affected PEMDAS cases |
|--------|------------------------|
| DEF-01 | PEMDAS-049 – 051 |
| DEF-02 | All expressions using `−` (subtraction) |
| DEF-04 | All expressions using `÷` |
| DEF-06 | PEMDAS-028 – 048, PEMDAS-050 |

**Expected pass rate (Chromium, current app):** Most PEMDAS cases fail due to DEF-02, DEF-04, and DEF-06; cases using only `+` and `×` without `3` (e.g. PEMDAS-001, 002, 009, 010, 023, 024) are most likely to pass.

See `pemdas.cases.ts` for the full expression and expected value per `PEMDAS-XXX` id.

---

### 6.4 Scientific functions

| TC-ID | Test name (spec) | Steps | Expected result | Defect | Pass criteria |
|-------|------------------|-------|-----------------|--------|---------------|
| TC-015 | sin on empty display does not show Error | Press `sin` with empty display | No `Error` string | DEF-13 | `display !== 'Error'` |
| TC-016 | cos on empty display does not show Error | Press `cos` with empty display | No `Error` string | DEF-13 | `display !== 'Error'` |
| TC-017 | tan on empty display does not show Error | Press `tan` with empty display | No `Error` string | DEF-13 | `display !== 'Error'` |
| TC-018 | square root on empty display does not show Error | Press `√` with empty display | No `Error` string | DEF-14 | `display !== 'Error'` |
| TC-019 | square root: √9 = 3 | Enter `9` → press `√` | Display shows `3` | — | Numeric ≈ 3 |
| TC-020 | sin(90) ≈ Math.sin(90 radians) | Enter `90` → press `sin` | Display ≈ `0.894` (sin 90 rad) | DEF-12 | Numeric ≈ `Math.sin(90)` |
| TC-021 | cos(0) = 1 | Enter `0` → press `cos` | Display shows `1` | — | Numeric ≈ 1 |
| TC-022 | tan(0) = 0 | Enter `0` → press `tan` | Display shows `0` | — | Numeric ≈ 0 |
| TC-023 | log(0) shows Error | Enter `0` → press `log` | Display shows `Error` | DEF-18 | Exact text `Error` |

**Notes**

- TC-015–TC-018: App shows `Error` on empty input (DEF-13 / DEF-14).
- TC-020: DEF-12 — app always shows `1` for sin.
- TC-023: DEF-18 — app may show `-Infinity` instead of `Error`.

---

### 6.5 UI button mapping

| TC-ID | Test name (spec) | Steps | Expected result | Defect | Pass criteria |
|-------|------------------|-------|-----------------|--------|---------------|
| TC-024 | pressing 3 shows 3 in the display | Press `3` | Display shows `3` | DEF-01 | `toHaveValue('3')` |
| TC-025 | pressing minus after 5 shows 5- in the display | Press `5` → `−` | Display shows `5-` | DEF-02 | `toHaveValue('5-')` |
| TC-026 | divide and minus buttons produce different expressions | Press `8` → `÷`; clear; press `8` → `−` | Two different expression strings | DEF-03 | `afterMinus !== afterDivide` |

**Notes**

- TC-024: DEF-01 — `3` key appends `0`.
- TC-025: DEF-02 — `−` appends `/`.
- TC-026: DEF-03 — both keys may append `/`.

---

### 6.6 Expression parsing defects

| TC-ID | Test name (spec) | Steps | Expected result | Defect | Pass criteria |
|-------|------------------|-------|-----------------|--------|---------------|
| TC-027 | missing closing parenthesis shows Error | Clear → enter `(2+3` → `=` | Display shows `Error` | DEF-08 | Exact text `Error` |
| TC-028 | stray closing parenthesis shows Error | Clear → enter `2+3)` → `=` | Display shows `Error` | DEF-09 | Exact text `Error` |
| TC-029 | cos applied to 5+2 uses full expression or rejects | Enter `5+2` → press `cos` | Result ≈ cos(7), not cos(5) | DEF-15 | Close to `Math.cos(7)`; not close to `Math.cos(5)` |

**Notes**

- TC-027: DEF-08 — app may show `NaN`.
- TC-028: DEF-09 — app may return partial numeric result.
- TC-029: DEF-15 — `parseFloat('5+2')` uses only `5`.

---

## 7. Defect cross-reference

Full reproduction steps and expected vs actual: [DEFECTS.md](DEFECTS.md).

| Defect ID | Description | Test cases |
|-----------|-------------|------------|
| DEF-01 | Button `3` appends `0` | TC-024; PEMDAS-049 – 051 |
| DEF-02 | Button `−` appends `/` | TC-003, TC-025; PEMDAS with `−` |
| DEF-03 | `÷` and `−` both append `/` | TC-026 |
| DEF-04 | Division operands reversed | TC-004, TC-005; PEMDAS with `÷` |
| DEF-05 | Division by zero shows `0` | TC-006 |
| DEF-06 | Parentheses + trailing operator broken | PEMDAS-028 – 048, PEMDAS-050 |
| DEF-07 | Parser skips token after `)` | PEMDAS-028 – 048 (via DEF-06) |
| DEF-08 | Missing `)` shows `NaN` | TC-027 |
| DEF-09 | Stray `)` not rejected | TC-028 |
| DEF-10 | Empty `=` shows `undefined` | TC-010 |
| DEF-11 | Invalid syntax inconsistent | Not automated |
| DEF-12 | `sin` hardcoded to `1` | TC-020 |
| DEF-13 | sin/cos/tan on empty → `Error` | TC-015, TC-016, TC-017 |
| DEF-14 | √ on empty → `Error` | TC-018 |
| DEF-15 | Scientific ops use `parseFloat` prefix only | TC-029 |
| DEF-16 | Radians not documented | Not automated |
| DEF-17 | √ edge cases inconsistent | TC-019, TC-018 |
| DEF-18 | `log(0)` → `-Infinity` not `Error` | TC-023 |
| DEF-19 | Stuck on `Error` after scientific | Not automated |
| DEF-20 | Grid layout uneven | Manual / visual only |
| DEF-21 | Display disabled | Manual / a11y only |
| DEF-22 | No `data-testid` in DOM | N/A (POM uses roles) |

---

## 8. Expected baseline (Chromium, current app)

As of the initial automation run against the hosted calculator:

| Result | Count | Representative tests |
|--------|------:|----------------------|
| **Pass** | ~12 | Basic ops without ÷/−; PEMDAS using only `+` and `×` (e.g. PEMDAS-001, 002, 009, 010, 023, 024); some scientific smoke |
| **Fail** | ~65 | PEMDAS with ÷, −, or `()`; DEF-tagged UI/parsing tests |

Re-run after app fixes; update this section when the baseline changes.

---

## 9. Execution

```bash
# All configured projects
npm test

# Chromium only (faster local run)
npm run test:chromium

# Headed mode
npm run test:headed

# HTML report
npm run report
```

See [README.md](../README.md) for environment variables (`BASE_URL`, `PROJECTS`, `HEADLESS`, corporate CA setup).

---

## 10. Traceability

| Artifact | Location |
|----------|----------|
| Defect register | [DEFECTS.md](DEFECTS.md) |
| Automated tests | [`../src/tests/calculator.spec.ts`](../src/tests/calculator.spec.ts) |
| PEMDAS case matrix | [`../src/tests/pemdas.cases.ts`](../src/tests/pemdas.cases.ts) |
| Assertions helpers | [`../src/utils/assertions.ts`](../src/utils/assertions.ts) |
| Page Object | [`../src/pages/CalculatorPage.ts`](../src/pages/CalculatorPage.ts) |
| Playwright config | [`../playwright.config.ts`](../playwright.config.ts) |
