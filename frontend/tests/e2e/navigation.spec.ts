import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('desktop dropdown navigates to features section', async ({ page }) => {
  // Open features dropdown and click a feature that targets the features section
  await page.click('button:has-text("Features")');
  await page.click('a:has-text("Team Collaboration")');
  await expect(page).toHaveURL(/#features/);
});

test('plans dropdown Compare All Plans navigates to pricing', async ({ page }) => {
  await page.click('button:has-text("Plans")');
  await page.click('a:has-text("Compare All Plans")');
  await expect(page).toHaveURL(/#pricing/);
});
