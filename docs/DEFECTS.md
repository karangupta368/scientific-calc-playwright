# Defect register — DEF-01 through DEF-22

| Field | Value |
|-------|--------|
| **Application** | [RBI Hub Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html) |
| **Related docs** | [README](../README.md) · [TEST_PLAN](TEST_PLAN.md) |
| **Automation** | [`../src/tests/calculator.spec.ts`](../src/tests/calculator.spec.ts) |

**Severity:** Critical = broken core math/UI · Major = wrong results or blocked flows · Minor = UX/consistency

Tests assert **correct** behavior; failures document these defects until the application is fixed.

---

## UI / button wiring

### DEF-01 — Button `3` appends `0` (Critical)

| | |
|---|---|
| **Reproduction** | 1. Open calculator · 2. Press `3` |
| **Expected** | Display shows `3` |
| **Actual** | Display shows `0` (`onclick="append('0')"` on the `3` button) |
| **Impact** | Digit 3 cannot be entered; any expression containing `3` is wrong |
| **Automation** | `pressing 3 shows 3 in the display`; PEMDAS-049 – 051 |

### DEF-02 — Button `−` appends `/` instead of `-` (Critical)

| | |
|---|---|
| **Reproduction** | 1. Press `5` · 2. Press `−` |
| **Expected** | Display shows `5-` |
| **Actual** | Display shows `5/` (same as division) |
| **Impact** | Subtraction cannot be entered via UI |
| **Automation** | `subtraction: 10 − 3 = 7`; `pressing minus after 5 shows 5- in the display`; all PEMDAS cases using `−` |

### DEF-03 — `÷` and `−` both append `/` (Major)

| | |
|---|---|
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
| **Reproduction** | 1. Enter `8` → `÷` → `2` → `=` |
| **Expected** | `4` (8 ÷ 2) |
| **Actual** | `0.25` (evaluates as 2 ÷ 8) |
| **Impact** | Every division result is wrong |
| **Automation** | `division: 8 ÷ 2 = 4`; `division: 12 ÷ 4 = 3`; PEMDAS cases with `÷` |

### DEF-05 — Division by zero shows `0` (Critical)

| | |
|---|---|
| **Reproduction** | 1. Enter `8` → `÷` → `0` → `=` |
| **Expected** | `Error` or `Infinity` |
| **Actual** | `0` (due to DEF-04: treated as `0 ÷ 8`) |
| **Impact** | Silent wrong answer instead of error handling |
| **Automation** | `division by zero: 8 ÷ 0 shows Error or Infinity` |

### DEF-06 — Parentheses + trailing operator not evaluated (Critical)

| | |
|---|---|
| **Reproduction** | 1. Enter `(2+3)*4` → `=` |
| **Expected** | `20` |
| **Actual** | `5` or `2` (only inner group evaluated; trailing `*4` ignored) |
| **Root cause** | Parser advances index by 2 after `)`, skipping the next operator (see DEF-07) |
| **Automation** | PEMDAS-028 – 048, PEMDAS-050 |

### DEF-07 — Parser skips token after `)` (Major)

| | |
|---|---|
| **Reproduction** | Same as DEF-06; inspect `evaluateExpression` — on `)`, index += 2 |
| **Expected** | Consume single `)` then continue with `*` or `/` |
| **Actual** | Next operator/operand after `)` is skipped |
| **Impact** | Structural cause of DEF-06 |
| **Automation** | Covered indirectly via DEF-06 / PEMDAS-028 – 048 |

### DEF-08 — Missing `)` shows `NaN` (Major)

| | |
|---|---|
| **Reproduction** | 1. Enter `(2+3` → `=` |
| **Expected** | `Error` |
| **Actual** | `NaN` |
| **Automation** | `missing closing parenthesis shows Error` |

### DEF-09 — Stray `)` not rejected (Major)

| | |
|---|---|
| **Reproduction** | 1. Enter `2+3)` → `=` |
| **Expected** | `Error` |
| **Actual** | `5` (partial parse) |
| **Automation** | `stray closing parenthesis shows Error` |

### DEF-10 — Empty `=` shows `undefined` (Minor)

| | |
|---|---|
| **Reproduction** | 1. Clear display · 2. Press `=` with nothing entered |
| **Expected** | `0` or `Error` or empty |
| **Actual** | Literal string `undefined` in display |
| **Automation** | `equals on empty display shows 0 or Error, not undefined` |

### DEF-11 — Invalid syntax handling inconsistent (Minor)

| | |
|---|---|
| **Reproduction** | 1. Enter `++` or `*5` → `=` |
| **Expected** | `Error` |
| **Actual** | `Error` or `NaN` depending on input |
| **Automation** | Not individually automated |

---

## Scientific functions

### DEF-12 — `sin` always returns `1` (Major)

| | |
|---|---|
| **Reproduction** | 1. Enter `90` · 2. Press `sin` |
| **Expected** | ≈ `0.894` (`Math.sin(90)` radians) |
| **Actual** | `1` (hardcoded; does not use input) |
| **Automation** | `sin(90) ≈ Math.sin(90 radians)` |

### DEF-13 — sin / cos / tan on empty display → `Error` (Major)

| | |
|---|---|
| **Reproduction** | 1. Clear display · 2. Press `sin` (or `cos` / `tan`) without entering a number |
| **Expected** | `0`, empty, or a clear prompt — not `Error` |
| **Actual** | `Error` (`parseFloat('')` is NaN) |
| **Automation** | `sin` / `cos` / `tan on empty display does not show Error` |

### DEF-14 — √ on empty display → `Error` (Major)

| | |
|---|---|
| **Reproduction** | 1. Clear display · 2. Press `√` |
| **Expected** | Graceful handling (e.g. `0` or message) |
| **Actual** | `Error` |
| **Automation** | `square root on empty display does not show Error` |

### DEF-15 — Scientific ops use `parseFloat` prefix only (Major)

| | |
|---|---|
| **Reproduction** | 1. Enter `5+2` · 2. Press `cos` |
| **Expected** | cos(7) ≈ `0.754`, or `Error` if expression not allowed |
| **Actual** | cos(5) ≈ `0.284` (`parseFloat('5+2')` === `5`) |
| **Automation** | `cos applied to 5+2 uses full expression or rejects` |

### DEF-16 — Radians vs degrees not indicated (Minor)

| | |
|---|---|
| **Reproduction** | 1. Enter `90` · 2. Press `cos` |
| **Expected** | UI indicates radians vs degrees |
| **Actual** | Uses radians with no label; users may expect degrees (`0` vs `-0.448`) |
| **Automation** | Not individually automated |

### DEF-17 — Square root edge cases inconsistent (Minor)

| | |
|---|---|
| **Reproduction** | 1. `√` on `9` → **works** (`3`) · 2. `√` on empty → `Error` · 3. `√` on `-1` (if enterable) → `NaN` not `Error` |
| **Expected** | Consistent `Error` for invalid inputs |
| **Actual** | Mixed `Error` / `NaN` / correct result |
| **Automation** | `square root: √9 = 3`; empty √ tests |

### DEF-18 — `log(0)` → `-Infinity` (Minor)

| | |
|---|---|
| **Reproduction** | 1. Enter `0` · 2. Press `log` |
| **Expected** | `Error` |
| **Actual** | `-Infinity` |
| **Automation** | `log(0) shows Error` |

### DEF-19 — Scientific function after `Error` state (Minor)

| | |
|---|---|
| **Reproduction** | 1. Cause `Error` on display · 2. Press `cos` |
| **Expected** | Clear message or recover after `C` |
| **Actual** | Display stays `Error` |
| **Automation** | Not individually automated |

---

## Layout / accessibility

### DEF-20 — Uneven button grid (Minor)

| | |
|---|---|
| **Reproduction** | Open calculator and inspect keypad layout |
| **Expected** | Consistent 4-column grid |
| **Actual** | Row with `0`, `.`, `=` has 3 buttons; scientific row has 5 buttons |
| **Automation** | Manual / visual only |

### DEF-21 — Display not keyboard-accessible (Minor)

| | |
|---|---|
| **Reproduction** | Try typing into the display field |
| **Expected** | Keyboard entry or proper ARIA for screen readers |
| **Actual** | `#display` is `disabled`; button-only input |
| **Automation** | Manual / a11y audit only |

### DEF-22 — No `data-testid` attributes (Minor)

| | |
|---|---|
| **Reproduction** | Inspect DOM |
| **Expected** | Optional test hooks for automation |
| **Actual** | Only `id="display"` and button text; framework uses `getByRole` / `#display` |
| **Impact** | Test maintenance relies on visible labels |
| **Automation** | N/A (framework workaround in place) |

---

## Defect summary

| ID | Severity | One-line summary |
|----|----------|------------------|
| DEF-01 | Critical | `3` key appends `0` |
| DEF-02 | Critical | `−` key appends `/` |
| DEF-03 | Major | `÷` and `−` duplicate `/` |
| DEF-04 | Critical | Division operands reversed |
| DEF-05 | Critical | Div by zero → `0` |
| DEF-06 | Critical | `(a+b)*c` wrong after `)` |
| DEF-07 | Major | Parser skips token after `)` |
| DEF-08 | Major | Missing `)` → `NaN` |
| DEF-09 | Major | Stray `)` → partial result |
| DEF-10 | Minor | Empty `=` → `undefined` |
| DEF-11 | Minor | Invalid syntax inconsistent |
| DEF-12 | Major | `sin` always `1` |
| DEF-13 | Major | sin/cos/tan empty → `Error` |
| DEF-14 | Major | √ empty → `Error` |
| DEF-15 | Major | `parseFloat` on expressions |
| DEF-16 | Minor | Radians not documented |
| DEF-17 | Minor | √ edge cases inconsistent |
| DEF-18 | Minor | `log(0)` → `-Infinity` |
| DEF-19 | Minor | Stuck on `Error` |
| DEF-20 | Minor | Grid layout uneven |
| DEF-21 | Minor | Display disabled |
| DEF-22 | Minor | No test IDs in DOM |
