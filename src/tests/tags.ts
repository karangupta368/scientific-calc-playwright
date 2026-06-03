/** Playwright test tags for smoke vs full regression runs. */
export const TAG = {
  sanity: '@sanity',
  regression: '@regression',
} as const;

export const SANITY_AND_REGRESSION: string[] = [TAG.sanity, TAG.regression];
export const REGRESSION_ONLY: string[] = [TAG.regression];
