# Enterprise-Grade Playwright Automation Framework

**RBI Hub Scientific Calculator — E2E Test Suite**

[![Playwright Tests](https://github.com/karangupta368/scientific-calc-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/karangupta368/scientific-calc-playwright/actions/workflows/playwright.yml)

Production-ready end-to-end automation framework built with **Playwright** and **TypeScript** for the [RBI Hub Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html). The suite validates calculator behavior through the UI, documents application defects (DEF-01–DEF-22), and runs automatically in **GitHub Actions** on every push and pull request.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Page Object Model (POM)** | `CalculatorPage` encapsulates locators and reusable actions (`pressNumber`, `evaluate`, `pressScientific`, etc.) |
| **Cross-browser testing** | **CI:** Chromium only (fast, stable gate). **Local:** Chromium, Firefox, and WebKit via `PROJECTS` |
| **TypeScript safety** | Strict typing across specs, page objects, config, and test data |
| **Sanity & regression tags** | `@sanity` (20 tests) for fast smoke + critical defect monitors; `@regression` (77 tests) for full coverage |
| **PEMDAS / BODMAS matrix** | 51 data-driven precedence cases in `pemdas.cases.ts` |
| **HTML reporting** | Rich Playwright HTML report with traces, screenshots, and videos on failure |
| **CI/CD pipeline** | GitHub Actions with **Green CI Gate** (`test.fail()`), executive step summary, and artifact upload |
| **Defect register** | Living documentation of 22 application bugs with repro steps ([docs/DEFECTS.md](docs/DEFECTS.md)) |
| **Test governance** | Jira-style expected-failure annotations in `known-defects.ts` — pipeline stays green, defects stay visible |

---

## Tech Stack

| Technology | Role |
|------------|------|
| [Playwright](https://playwright.dev/) | Browser automation & assertions |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe test code |
| [Node.js](https://nodejs.org/) (LTS) | Runtime & package management |
| [GitHub Actions](https://github.com/features/actions) | Continuous integration |
| [dotenv](https://github.com/motdotla/dotenv) | Environment configuration |

---

## Prerequisites

- **Node.js** — LTS version (v20+ recommended)
- **npm** — included with Node.js
- **Git** — to clone the repository

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/karangupta368/scientific-calc-playwright.git
cd scientific-calc-playwright

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Optional: copy environment template
cp .env.example .env
```

---

## Running Tests

### Headless (default — CI mode)

```bash
npm test                 # all browsers configured in PROJECTS (default: chromium, firefox, webkit)
npm run test:chromium    # Chromium only (matches CI)
npm run test:ci          # alias for CI — Chromium only
```

### Headed (visible browser)

```bash
npm run test:headed
```

### Interactive UI mode

```bash
npm run test:ui
```

### Targeted runs

| Command | Description |
|---------|-------------|
| `npm run test:ci` | **CI parity** — full suite on Chromium only |
| `npm run test:chromium` | Chromium only |
| `npm run test:sanity` | Sanity suite — 20 tests (`@sanity`), all configured browsers |
| `npm run test:sanity:chromium` | Sanity on Chromium only |
| `npm run test:regression` | Full regression — 77 tests (`@regression`) |
| `npm run test:debug` | Playwright debug mode |
| `npm run report` | Open the latest HTML report locally |

---

## 📊 CI/CD & Test Governance Strategy

### Why the pipeline is not left red for known bugs

A Lead SDET treats CI as a **quality gate**, not a raw defect dump. When every run fails because of **already-triaged application bugs**, teams experience **alert fatigue**: engineers ignore red builds, merge with broken trust, and real regressions hide in the noise.

This framework implements a **Green CI Gate**:

1. **Tests still assert correct behavior** — specifications do not change to match broken app logic.
2. **Known failures are annotated** with Playwright `test.fail(true, 'JIRA-CALC-XXX: …')` via `markExpectedApplicationDefect()` in [`src/tests/known-defects.ts`](src/tests/known-defects.ts).
3. **CI stays green** when the app fails as documented; **CI turns red** when a known defect is fixed (unexpected pass) or a **new** regression appears.
4. **Defects remain visible** in HTML reports, annotations, and the GitHub Actions **Executive Test Dashboard** (`$GITHUB_STEP_SUMMARY`).

This mirrors production SDET practice: separate **signal** (new breakage) from **noise** (accepted known defects under management).

### How `test.fail()` works here

```typescript
import { markExpectedApplicationDefect } from './known-defects';

test('division by zero shows Error or Infinity', async () => {
  markExpectedApplicationDefect('DEF-05'); // JIRA-CALC-105: …
  await calculator.evaluate('8/0');
  // assertion still validates correct behavior
});
```

| Outcome | CI result | Meaning |
|---------|-----------|---------|
| Test fails (app still buggy) | ✅ Pass | Expected failure — defect still present |
| Test passes (app fixed) | ❌ Fail | Unexpected pass — remove annotation & close ticket |
| Unannotated test fails | ❌ Fail | New regression — investigate immediately |

### Defect Triage Dashboard

| Test | Expected behavior | Actual behavior (app) | Code treatment |
|------|-------------------|----------------------|----------------|
| `pressing 3 shows 3 in the display` | Display `3` | Display `0` | `test.fail('JIRA-CALC-101')` |
| `subtraction: 10 − 3 = 7` | `7` | `10/3` (minus → `/`) | `test.fail('JIRA-CALC-102')` |
| `pressing minus after 5 shows 5-` | Display `5-` | Display `5/` | `test.fail('JIRA-CALC-102')` |
| `division: 8 ÷ 2 = 4` | `4` | `2` (operands reversed) | `test.fail('JIRA-CALC-104')` |
| `division: 12 ÷ 4 = 3` | `3` | Reversed evaluation | `test.fail('JIRA-CALC-104')` |
| `division by zero: 8 ÷ 0` | `Error` or `Infinity` | `0` | `test.fail('JIRA-CALC-105')` |
| `equals on empty display` | `0` or `Error` | `undefined` | `test.fail('JIRA-CALC-110')` |
| `divide and minus buttons produce different expressions` | `-` vs `/` | Both append `/` | `test.fail('JIRA-CALC-103')` |
| `missing closing parenthesis shows Error` | `Error` | `NaN` | `test.fail('JIRA-CALC-108')` |
| `stray closing parenthesis shows Error` | `Error` | Partial numeric result | `test.fail('JIRA-CALC-109')` |
| `cos applied to 5+2` | `cos(7)` | `cos(5)` (`parseFloat` prefix) | `test.fail('JIRA-CALC-115')` |
| `sin(90) ≈ Math.sin(90)` | Correct trig value | Hardcoded `1` | `test.fail('JIRA-CALC-112')` |
| `sin/cos/tan on empty display` | No `Error` | `Error` | `test.fail('JIRA-CALC-113')` |
| `square root on empty display` | No `Error` | `Error` | `test.fail('JIRA-CALC-114')` |
| `log(0) shows Error` | `Error` | `-Infinity` | `test.fail('JIRA-CALC-118')` |
| PEMDAS cases with `defects[]` (38 tests) | Correct precedence result | Parser / operator bugs | `test.fail()` per linked DEF-* ticket |

Full defect register: [docs/DEFECTS.md](docs/DEFECTS.md)

---

## CI/CD Pipeline

The workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs automatically on:

- **Push** to `main` or `master`
- **Pull requests** targeting `main` or `master`
- **Manual trigger** via **Actions → Playwright Tests → Run workflow**

**Browser scope:** CI runs **Chromium only** (`PROJECTS=chromium`) for a fast, stable quality gate. Cross-browser coverage (Firefox, WebKit) is available locally via `PROJECTS` — see [Configuration](#configuration).

### Pipeline steps

1. Checkout code on `ubuntu-latest`
2. Set up Node.js LTS with npm cache
3. Install dependencies (`npm ci`)
4. Install **Chromium** with system deps (`npx playwright install --with-deps chromium`)
5. Execute the full suite on Chromium (`npx playwright test --project=chromium`)
6. Upload the HTML report as a build artifact (retained **3 days**)
7. Publish an **Executive Test Dashboard** to the workflow run summary (`$GITHUB_STEP_SUMMARY`)

### Download the HTML test report

1. Open the **Actions** tab in GitHub
2. Select a **Playwright Tests** workflow run
3. Scroll to **Artifacts**
4. Download **`playwright-report`**
5. Unzip and open `index.html` in a browser

> The suite uses a **Green CI Gate**: known application defects are marked with `test.fail()` so CI stays green while assertions continue to document correct behavior. See [CI/CD & Test Governance Strategy](#-cicd--test-governance-strategy).

---

## Project Structure

```
.github/workflows/playwright.yml   # CI pipeline
docs/
  DEFECTS.md                         # Defect register (DEF-01–DEF-22)
  TEST_PLAN.md                       # Test cases & traceability
src/
  config/env.ts                      # Environment & browser project config
  pages/CalculatorPage.ts            # Page Object Model
  tests/
    calculator.spec.ts               # E2E specs (Green CI Gate annotations)
    known-defects.ts                 # Jira-style DEF-* → test.fail() registry
    pemdas.cases.ts                  # PEMDAS test matrix (51 cases)
    tags.ts                          # @sanity / @regression constants
  utils/assertions.ts                # Display assertion helpers
playwright.config.ts
```

---

## Configuration

Environment variables (see [.env.example](.env.example)):

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | RBI Hub calculator URL | Application under test |
| `HEADLESS` | `true` | Headless browser mode |
| `PROJECTS` | `chromium,firefox,webkit` (local default) | Browser projects to run; **CI sets `chromium` only** |
| `WORKERS` | Playwright default | Parallel worker count |
| `TIMEOUT` | `30000` | Test timeout (ms) |

---

## Test Strategy

| Tag | Tests | Purpose |
|-----|------:|---------|
| `@sanity` | 20 | 14 smoke paths + 6 critical defect monitors (DEF-01, 02, 04, 05, 06) |
| `@regression` | 77 | Full functional coverage |

Detailed test cases: [docs/TEST_PLAN.md](docs/TEST_PLAN.md)  
Application defects: [docs/DEFECTS.md](docs/DEFECTS.md)

---

## Troubleshooting

### Frozen WebKit on macOS 14

WebKit on macOS 14 uses a frozen build. Use `PROJECTS=chromium,firefox npm test` locally, or upgrade to macOS 15+.

### Report not found

Reports are written to `playwright-report/`. Open with:

```bash
npm run report
```

---

## Author

Built as a portfolio-grade QA automation framework demonstrating enterprise patterns: POM, typed test data, tagged test suites, defect-driven testing, and CI/CD integration.

**Application under test:** [RBI Hub Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html)
