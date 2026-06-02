# scientific-calc-playwright

Production-ready Playwright + TypeScript automation framework for the [RBI Hub scientific calculator](https://rbihubcodechallenge.github.io/calculator/index.html).

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cp .env.example .env
npm install
npm run setup:ca          # only if behind Zscaler / corporate SSL proxy
export NODE_EXTRA_CA_CERTS="$(pwd)/certs/corporate-root.pem"
npx playwright install
```

### Troubleshooting: `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`

This usually means **corporate SSL inspection** (e.g. Zscaler). `curl` may work while Node/Playwright fail because Node uses its own CA bundle.

1. Export your corporate root CA:
   ```bash
   npm run setup:ca
   ```
2. Point Node at it, then install browsers:
   ```bash
   export NODE_EXTRA_CA_CERTS="$(pwd)/certs/corporate-root.pem"
   npx playwright install
   ```
3. Add `NODE_EXTRA_CA_CERTS` to your shell profile or uncomment it in `.env` (Playwright inherits it when you run tests from the same shell).

If your CA has a different name, run:
`CA_NAME="Your Corp Root CA" npm run setup:ca`

### Troubleshooting: frozen WebKit on macOS 14

```
You are using a frozen webkit browser which does not receive updates anymore on mac14-arm64...
```

This is a **warning**, not an install failure. On **macOS 14** (you are on 14.8.x), Playwright ships a last-supported WebKit build that no longer receives Safari updates. Tests can still run, but Safari coverage is outdated.

**Options:**

| Approach | Action |
|----------|--------|
| Ignore | Safe for local dev; install completed successfully |
| Skip WebKit locally | `npm run install:browsers:core` and `PROJECTS=chromium,firefox npm test` |
| Up-to-date WebKit | Upgrade the Mac to **macOS 15+**, then `npx playwright install webkit` |
| CI | Run full `chromium,firefox,webkit` on Linux/macOS 15 runners |

## Configuration

Environment variables (see [.env.example](.env.example)):

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://rbihubcodechallenge.github.io/calculator/` | App base URL |
| `HEADLESS` | `true` | Headless browser mode |
| `WORKERS` | (Playwright default) | Parallel worker count |
| `TIMEOUT` | `30000` | Test timeout (ms) |
| `PROJECTS` | `chromium,firefox,webkit` | Browser projects to run |

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (Chromium, Firefox, WebKit) |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:debug` | Debug mode |
| `npm run test:chromium` | Chromium only |
| `npm run report` | Open HTML report |

Reports are written to `reports/html`. Failure artifacts (screenshots, videos) go to `test-results/`.

## Project structure

```
src/
  config/env.ts      # dotenv-backed configuration
  pages/             # Page Object Model (upcoming)
  tests/             # Spec files (upcoming)
  utils/             # Shared helpers (upcoming)
playwright.config.ts
```

## Test strategy

Tests assert **correct** calculator behavior and serve as living defect reports against known app bugs (DEF-01–DEF-22). Failures are expected until the application is fixed.
