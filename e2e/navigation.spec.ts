import { expect, test } from '@playwright/test';
import { FIGURE, figureRow, filterByDance, openApp, openFigure, searchFor } from './helpers';

// Behavior that does not depend on pixels. Phone sized, since that is the
// layout under test today.
test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test('searching "lock" lists name matches before note mentions', async ({ page }) => {
  await searchFor(page, 'lock');
  const headings = page.locator('.fl-heading');
  await expect(headings.first()).toContainText('Names');
  await expect(headings.nth(1)).toContainText('Mentioned in notes');
  const firstSection = page.locator('.fl-section').first();
  await expect(firstSection.locator('.fl-name').first()).toContainText(/lock/i);
  await expect(firstSection.locator('.fl-name mark').first()).toHaveText(/lock/i);
});

test('picking Waltz groups the list by level', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  const headings = page.locator('.fl-heading > span:first-child');
  await expect(headings.first()).toHaveText('Pre-Bronze');
  const levels = await headings.allTextContents();
  expect(levels.length).toBeGreaterThan(1);
  expect(new Set(levels).size).toBe(levels.length);
  await expect(figureRow(page, FIGURE.name)).toBeVisible();
});

test('browser Back from a figure returns to the list, filters intact', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Figures', level: 1 })).toBeVisible();
  await expect(figureRow(page, FIGURE.name)).toBeVisible();
  await expect(page.getByRole('button', { name: FIGURE.dance, exact: true })).toHaveAttribute('aria-pressed', 'true');
});
