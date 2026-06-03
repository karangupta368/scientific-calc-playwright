# Defect register — DEF-01 through DEF-22

| Field | Value |
|-------|--------|
| **Application** | [RBI Hub Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html) |
| **Related docs** | [README](../README.md) · [TEST_PLAN](TEST_PLAN.md) |
| **Automation** | [`../src/tests/calculator.spec.ts`](../src/tests/calculator.spec.ts) |
| **Governance registry** | [`../src/tests/known-defects.ts`](../src/tests/known-defects.ts) |

**Severity:** Critical = broken core math/UI · Major = wrong results or blocked flows · Minor = UX/consistency

Tests assert **correct** behavior; failures document these defects until the application is fixed.

**Green CI Gate:** Fourteen defects (DEF-01 – DEF-06, DEF-08 – DEF-10, DEF-12 – DEF-15, DEF-18) are registered in `known-defects.ts` with Jira-style ticket IDs. Automated tests call `markExpectedApplicationDefect('DEF-XX')`, which applies Playwright `test.fail(true, 'JIRA-CALC-XXX: …')` so CI stays green while known bugs remain visible. When the app is fixed, remove the annotation and close the ticket — an unexpected pass fails CI.

**Automation tags:** Governed defect tests are tagged **`@regression`**. **Critical** defects (DEF-01, DEF-02, DEF-04, DEF-05, DEF-06) are also in the **`@sanity`** subset as defect monitors. See [TEST_PLAN.md — Test tags](TEST_PLAN.md#5-test-tags-sanity--regression).

---

## Jira ticket mapping (governed defects)

Source of truth: [`known-defects.ts`](../src/tests/known-defects.ts)

| DEF ID | Jira ticket | Summary |
|--------|-------------|---------|
| DEF-01 | **JIRA-CALC-101** | Button `3` appends `0` instead of `3` |
| DEF-02 | **JIRA-CALC-102** | Minus button appends `/` instead of `-` |
| DEF-03 | **JIRA-CALC-103** | Divide and minus buttons both append `/` |
| DEF-04 | **JIRA-CALC-104** | Division operands evaluated in reverse order |
| DEF-05 | **JIRA-CALC-105** | Division by zero returns `0` instead of Error/Infinity |
| DEF-06 | **JIRA-CALC-106** | Parser skips operator after closing parenthesis |
| DEF-08 | **JIRA-CALC-108** | Missing `)` shows `NaN` instead of Error |
| DEF-09 | **JIRA-CALC-109** | Stray `)` accepted; partial numeric result returned |
| DEF-10 | **JIRA-CALC-110** | Empty equals displays literal `undefined` |
| DEF-12 | **JIRA-CALC-112** | `sin()` hardcoded to `1` regardless of input |
| DEF-13 | **JIRA-CALC-113** | sin/cos/tan on empty display show Error |
| DEF-14 | **JIRA-CALC-114** | Square root on empty display shows Error |
| DEF-15 | **JIRA-CALC-115** | Scientific ops use `parseFloat` prefix only (`cos(5+2)` → `cos(5)`) |
| DEF-18 | **JIRA-CALC-118** | `log(0)` returns `-Infinity` instead of Error |

Defects **not** in `known-defects.ts` (DEF-07, DEF-11, DEF-16 – DEF-22) are documented below for traceability but have no `test.fail()` annotation — either covered indirectly or manual-only.

---

## UI / button wiring

### DEF-01 — Button `3` appends `0` (Critical)

| | |
|---|---|
| **Jira** | **JIRA-CALC-101** — Button `3` appends `0` instead of `3` |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-01')` |
| **Reproduction** | 1. Open calculator · 2. Press `3` |
| **Expected** | Display shows `3` |
| **Actual** | Display shows `0` (`onclick="append('0')"` on the `3` button) |
| **Impact** | Digit 3 cannot be entered; any expression containing `3` is wrong |
| **Automation** | `pressing 3 shows 3 in the display`; PEMDAS-049 – 051 |

### DEF-02 — Button `−` appends `/` instead of `-` (Critical)

| | |
|---|---|
| **Jira** | **JIRA-CALC-102** — Minus button appends `/` instead of `-` |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-02')` |
| **Reproduction** | 1. Press `5` · 2. Press `−` |
| **Expected** | Display shows `5-` |
| **Actual** | Display shows `5/` (same as division) |
| **Impact** | Subtraction cannot be entered via UI |
| **Automation** | `subtraction: 10 − 3 = 7`; `pressing minus after 5 shows 5- in the display`; PEMDAS cases containing `-` |

### DEF-03 — `÷` and `−` both append `/` (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-103** — Divide and minus buttons both append `/` |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-03')` |
| **Reproduction** | 1. Press `8` → `÷` → note display · 2. Press `C` · 3. Press `8` → `−` → note display |
| **Expected** | Different characters (`8/` vs `8-`) |
| **Actual** | Both show `8/` |
| **Impact** | Two buttons, one operator; misleading UX |
| **Automation** | `divide and minus buttons produce different expressions` |

---

## Expression evaluator

### DEF-04 — Division operands reversed (Critical)

| | |
|---|---|
| **Jira** | **JIRA-CALC-104** — Division operands evaluated in reverse order |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-04')` |
| **Reproduction** | 1. Enter `8` → `÷` → `2` → `=` |
| **Expected** | `4` (8 ÷ 2) |
| **Actual** | `0.25` (evaluates as 2 ÷ 8) |
| **Impact** | Every division result is wrong |
| **Automation** | `division: 8 ÷ 2 = 4`; `division: 12 ÷ 4 = 3`; PEMDAS cases containing `/` |

### DEF-05 — Division by zero shows `0` (Critical)

| | |
|---|---|
| **Jira** | **JIRA-CALC-105** — Division by zero returns `0` instead of Error/Infinity |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-05')` |
| **Reproduction** | 1. Enter `8` → `÷` → `0` → `=` |
| **Expected** | `Error` or `Infinity` |
| **Actual** | `0` (due to DEF-04: treated as `0 ÷ 8`) |
| **Impact** | Silent wrong answer instead of error handling |
| **Automation** | `division by zero: 8 ÷ 0 shows Error or Infinity` |

### DEF-06 — Parentheses + trailing operator not evaluated (Critical)

| | |
|---|---|
| **Jira** | **JIRA-CALC-106** — Parser skips operator after closing parenthesis |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-06')` (via PEMDAS `defects[]`) |
| **Reproduction** | 1. Enter `(2+3)*4` → `=` |
| **Expected** | `20` |
| **Actual** | `5` or `2` (only inner group evaluated; trailing `*4` ignored) |
| **Root cause** | Parser advances index by 2 after `)`, skipping the next operator (see DEF-07) |
| **Scope** | Applies when an operator immediately follows `)` (e.g. `(2+2)*4`). Expressions like `2*(4+2)` are **not** affected. |
| **Automation** | PEMDAS-028 – 032, PEMDAS-043 – 045, PEMDAS-050; PEMDAS-049 – 051 (with DEF-01) |

### DEF-07 — Parser skips token after `)` (Major)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`; root-cause note for DEF-06) |
| **Green CI Gate** | Not annotated — covered indirectly via DEF-06 |
| **Reproduction** | Same as DEF-06; inspect `evaluateExpression` — on `)`, index += 2 |
| **Expected** | Consume single `)` then continue with `*` or `/` |
| **Actual** | Next operator/operand after `)` is skipped |
| **Impact** | Structural cause of DEF-06 |
| **Automation** | Covered indirectly via DEF-06 / PEMDAS cases above |

### DEF-08 — Missing `)` shows `NaN` (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-108** — Missing `)` shows `NaN` instead of Error |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-08')` |
| **Reproduction** | 1. Enter `(2+3` → `=` |
| **Expected** | `Error` |
| **Actual** | `NaN` |
| **Automation** | `missing closing parenthesis shows Error` |

### DEF-09 — Stray `)` not rejected (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-109** — Stray `)` accepted; partial numeric result returned |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-09')` |
| **Reproduction** | 1. Enter `2+3)` → `=` |
| **Expected** | `Error` |
| **Actual** | `5` (partial parse) |
| **Automation** | `stray closing parenthesis shows Error` |

### DEF-10 — Empty `=` shows `undefined` (Minor)

| | |
|---|---|
| **Jira** | **JIRA-CALC-110** — Empty equals displays literal `undefined` |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-10')` |
| **Reproduction** | 1. Clear display · 2. Press `=` with nothing entered |
| **Expected** | `0` or `Error` or empty |
| **Actual** | Literal string `undefined` in display |
| **Automation** | `equals on empty display shows 0 or Error, not undefined` |

### DEF-11 — Invalid syntax handling inconsistent (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated |
| **Reproduction** | 1. Enter `++` or `*5` → `=` |
| **Expected** | `Error` |
| **Actual** | `Error` or `NaN` depending on input |
| **Automation** | Not individually automated |

---

## Scientific functions

### DEF-12 — `sin` always returns `1` (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-112** — `sin()` hardcoded to `1` regardless of input |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-12')` |
| **Reproduction** | 1. Enter `90` · 2. Press `sin` |
| **Expected** | ≈ `0.894` (`Math.sin(90)` radians) |
| **Actual** | `1` (hardcoded; does not use input) |
| **Automation** | `sin(90) ≈ Math.sin(90 radians)` |

### DEF-13 — sin / cos / tan on empty display → `Error` (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-113** — sin/cos/tan on empty display show Error |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-13')` |
| **Reproduction** | 1. Clear display · 2. Press `sin` (or `cos` / `tan`) without entering a number |
| **Expected** | `0`, empty, or a clear prompt — not `Error` |
| **Actual** | `Error` (`parseFloat('')` is NaN) |
| **Automation** | `sin` / `cos` / `tan on empty display does not show Error` |

### DEF-14 — √ on empty display → `Error` (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-114** — Square root on empty display shows Error |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-14')` |
| **Reproduction** | 1. Clear display · 2. Press `√` |
| **Expected** | Graceful handling (e.g. `0` or message) |
| **Actual** | `Error` |
| **Automation** | `square root on empty display does not show Error` |

### DEF-15 — Scientific ops use `parseFloat` prefix only (Major)

| | |
|---|---|
| **Jira** | **JIRA-CALC-115** — Scientific ops use `parseFloat` prefix only (`cos(5+2)` → `cos(5)`) |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-15')` |
| **Reproduction** | 1. Enter `5+2` · 2. Press `cos` |
| **Expected** | cos(7) ≈ `0.754`, or `Error` if expression not allowed |
| **Actual** | cos(5) ≈ `0.284` (`parseFloat('5+2')` === `5`) |
| **Automation** | `cos applied to 5+2 uses full expression or rejects` |

### DEF-16 — Radians vs degrees not indicated (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated |
| **Reproduction** | 1. Enter `90` · 2. Press `cos` |
| **Expected** | UI indicates radians vs degrees |
| **Actual** | Uses radians with no label; users may expect degrees (`0` vs `-0.448`) |
| **Automation** | Not individually automated |

### DEF-17 — Square root edge cases inconsistent (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated |
| **Reproduction** | 1. `√` on `9` → **works** (`3`) · 2. `√` on empty → `Error` · 3. `√` on `-1` (if enterable) → `NaN` not `Error` |
| **Expected** | Consistent `Error` for invalid inputs |
| **Actual** | Mixed `Error` / `NaN` / correct result |
| **Automation** | `square root: √9 = 3`; empty √ covered by DEF-14 |

### DEF-18 — `log(0)` → `-Infinity` (Minor)

| | |
|---|---|
| **Jira** | **JIRA-CALC-118** — `log(0)` returns `-Infinity` instead of Error |
| **Green CI Gate** | `markExpectedApplicationDefect('DEF-18')` |
| **Reproduction** | 1. Enter `0` · 2. Press `log` |
| **Expected** | `Error` |
| **Actual** | `-Infinity` |
| **Automation** | `log(0) shows Error` |

### DEF-19 — Scientific function after `Error` state (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated |
| **Reproduction** | 1. Cause `Error` on display · 2. Press `cos` |
| **Expected** | Clear message or recover after `C` |
| **Actual** | Display stays `Error` |
| **Automation** | Not individually automated |

---

## Layout / accessibility

### DEF-20 — Uneven button grid (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated — manual / visual only |
| **Reproduction** | Open calculator and inspect keypad layout |
| **Expected** | Consistent 4-column grid |
| **Actual** | Row with `0`, `.`, `=` has 3 buttons; scientific row has 5 buttons |
| **Automation** | Manual / visual only |

### DEF-21 — Display not keyboard-accessible (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated — manual / a11y audit only |
| **Reproduction** | Try typing into the display field |
| **Expected** | Keyboard entry or proper ARIA for screen readers |
| **Actual** | `#display` is `disabled`; button-only input |
| **Automation** | Manual / a11y audit only |

### DEF-22 — No `data-testid` attributes (Minor)

| | |
|---|---|
| **Jira** | — (not in `known-defects.ts`) |
| **Green CI Gate** | Not annotated |
| **Reproduction** | Inspect DOM |
| **Expected** | Optional test hooks for automation |
| **Actual** | Only `id="display"` and button text; framework uses `getByRole` / `#display` |
| **Impact** | Test maintenance relies on visible labels |
| **Automation** | N/A (framework workaround in place) |

---

## Defect summary

| ID | Jira | Severity | Green CI Gate | One-line summary |
|----|------|----------|---------------|------------------|
| DEF-01 | JIRA-CALC-101 | Critical | ✅ | `3` key appends `0` |
| DEF-02 | JIRA-CALC-102 | Critical | ✅ | `−` key appends `/` |
| DEF-03 | JIRA-CALC-103 | Major | ✅ | `÷` and `−` duplicate `/` |
| DEF-04 | JIRA-CALC-104 | Critical | ✅ | Division operands reversed |
| DEF-05 | JIRA-CALC-105 | Critical | ✅ | Div by zero → `0` |
| DEF-06 | JIRA-CALC-106 | Critical | ✅ | Operator after `)` skipped |
| DEF-07 | — | Major | — | Parser skips token after `)` (root cause) |
| DEF-08 | JIRA-CALC-108 | Major | ✅ | Missing `)` → `NaN` |
| DEF-09 | JIRA-CALC-109 | Major | ✅ | Stray `)` → partial result |
| DEF-10 | JIRA-CALC-110 | Minor | ✅ | Empty `=` → `undefined` |
| DEF-11 | — | Minor | — | Invalid syntax inconsistent |
| DEF-12 | JIRA-CALC-112 | Major | ✅ | `sin` always `1` |
| DEF-13 | JIRA-CALC-113 | Major | ✅ | sin/cos/tan empty → `Error` |
| DEF-14 | JIRA-CALC-114 | Major | ✅ | √ empty → `Error` |
| DEF-15 | JIRA-CALC-115 | Major | ✅ | `parseFloat` on expressions |
| DEF-16 | — | Minor | — | Radians not documented |
| DEF-17 | — | Minor | — | √ edge cases inconsistent |
| DEF-18 | JIRA-CALC-118 | Minor | ✅ | `log(0)` → `-Infinity` |
| DEF-19 | — | Minor | — | Stuck on `Error` |
| DEF-20 | — | Minor | — | Grid layout uneven |
| DEF-21 | — | Minor | — | Display disabled |
| DEF-22 | — | Minor | — | No test IDs in DOM |

**Governed total:** 14 defects in [`known-defects.ts`](../src/tests/known-defects.ts) · **55 automated tests** use `test.fail()` (17 explicit specs + 38 PEMDAS cases with `defects[]`).
