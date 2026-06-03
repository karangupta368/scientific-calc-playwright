# Enterprise-Grade Playwright Automation Framework

**RBI Hub Scientific Calculator — E2E Test Suite**

[![Playwright Tests](https://github.com/karangupta368/scientific-calc-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/karangupta368/scientific-calc-playwright/actions/workflows/playwright.yml)

Production-ready end-to-end automation framework built with **Playwright** and **TypeScript** for the [RBI Hub Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html). The suite validates calculator behavior through the UI, documents application defects (DEF-01–DEF-22), and runs automatically in **GitHub Actions** on every push and pull request.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Page Object Model (POM)** | `CalculatorPage` encapsulates locators and reusable actions (`pressNumber`, `evaluate`, `pressScientific`, etc.) |
| **Cross-browser testing** | Chromium, Firefox, and WebKit via Playwright projects |
| **TypeScript safety** | Strict typing across specs, page objects, config, and test data |
| **Sanity & regression tags** | `@sanity` (20 tests) for fast smoke + critical defect monitors; `@regression` (77 tests) for full coverage |
| **PEMDAS / BODMAS matrix** | 51 data-driven precedence cases in `pemdas.cases.ts` |
| **HTML reporting** | Rich Playwright HTML report with traces, screenshots, and videos on failure |
| **CI/CD pipeline** | GitHub Actions workflow with artifact upload for downloadable reports |
| **Defect register** | Living documentation of 22 application bugs with repro steps ([docs/DEFECTS.md](docs/DEFECTS.md)) |

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

> **Corporate network?** If browser install fails with SSL errors, see [Troubleshooting](#troubleshooting) below.

---

## Running Tests

### Headless (default — CI mode)

```bash
npm test
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
| `npm run test:chromium` | Chromium only |
| `npm run test:sanity` | Sanity suite — 20 tests (`@sanity`) |
| `npm run test:sanity:chromium` | Sanity on Chromium only |
| `npm run test:regression` | Full regression — 77 tests (`@regression`) |
| `npm run test:debug` | Playwright debug mode |
| `npm run report` | Open the latest HTML report locally |

---

## CI/CD Pipeline

The workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs automatically on:

- **Push** to `main` or `master`
- **Pull requests** targeting `main` or `master`
- **Manual trigger** via **Actions → Playwright Tests → Run workflow**

### Pipeline steps

1. Checkout code on `ubuntu-latest`
2. Set up Node.js LTS with npm cache
3. Install dependencies (`npm ci`)
4. Install Playwright browsers with system deps (`npx playwright install --with-deps`)
5. Execute the full test suite (`npx playwright test`)
6. Upload the HTML report as a build artifact (retained **3 days**)

### Download the HTML test report

1. Open the **Actions** tab in GitHub
2. Select a **Playwright Tests** workflow run
3. Scroll to **Artifacts**
4. Download **`playwright-report`**
5. Unzip and open `index.html` in a browser

> Tests assert **correct** calculator behavior. Failures on the current hosted app are **expected** and document known defects until the application is fixed.

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
    calculator.spec.ts               # E2E specs
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
| `PROJECTS` | `chromium,firefox,webkit` | Browser projects to run |
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

### `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` (corporate SSL / Zscaler)

```bash
npm run setup:ca
export NODE_EXTRA_CA_CERTS="$(pwd)/certs/corporate-root.pem"
npx playwright install
```

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
