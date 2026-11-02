import { expect, test, type Page } from '@playwright/test';
import { FIGURE, filterByDance, openApp, openFigure, openSettings, setPart } from './helpers';

// The reference chart in the figure pane: a real table with a column per
// Settings field, and the layout switches around it. Behavior, not pixels.
test.use({ viewport: { width: 1280, height: 800 } });

const chartHeaders = (page: Page) => page.locator('.sc-table thead th').allTextContents();
const strip = (page: Page) => page.getByRole('group', { name: 'Rhythm, go to a step' }).getByRole('button');

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
});

test('is a table with a Lead and a Follow row for each step', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Steps' });
  await expect(table.locator('tbody')).toHaveCount(5);
  await expect(table.getByRole('row')).toHaveCount(1 + 5 * 2);
  await expect(table.getByRole('columnheader', { name: 'Feet' })).toBeVisible();
});

test('columns follow the Settings field toggles', async ({ page }) => {
  expect(await chartHeaders(page)).toEqual(['#', 'Count', 'Part', 'Feet', 'Rise and fall', 'Footwork']);
  await openSettings(page);
  await page.getByRole('button', { name: /^Standard/ }).click();
  await page.getByRole('checkbox', { name: /^Footwork/ }).click();
  await page.getByRole('checkbox', { name: /^Alignment/ }).click();
  expect(await chartHeaders(page)).toEqual(['#', 'Count', 'Part', 'Feet', 'Alignment', 'Rise and fall']);
});

test('one part is one row a step, with the partner feet underneath', async ({ page }) => {
  await setPart(page, 'Follow');
  const table = page.getByRole('table', { name: 'Steps' });
  await expect(table.getByRole('row')).toHaveCount(1 + 5);
  expect(await chartHeaders(page)).not.toContain('Part');
  await expect(table.locator('.sc-partner-lead').first()).toBeVisible();
});

test('a click on the rhythm strip makes that step current', async ({ page }) => {
  await expect(page.locator('.sc-step-current')).toHaveAttribute('data-n', '1');
  await strip(page).nth(3).click();
  await expect(page.locator('.sc-step-current')).toHaveAttribute('data-n', '4');
});

test('switching Lead, Follow and Both keeps the reader in place', async ({ page }) => {
  // A short window, so there is room to scroll in every part.
  await page.setViewportSize({ width: 1280, height: 520 });
  await openFigure(page, 'Basic Weave');
  await strip(page).nth(3).click();
  const step = page.locator('tbody[data-n="4"]');
  await expect(page.locator('.sc-step-current')).toHaveAttribute('data-n', '4');
  const top = async () => (await step.boundingBox())?.y ?? Number.NaN;
  // Let the jump land before measuring.
  await expect.poll(top).toBeLessThan(400);
  await page.waitForTimeout(300);
  const before = await top();
  for (const part of ['Follow', 'Lead', 'Both'] as const) {
    await setPart(page, part);
    expect(Math.abs((await top()) - before)).toBeLessThanOrEqual(2);
    await expect(page.locator('.sc-step-current')).toHaveAttribute('data-n', '4');
  }
});

test('the About content is open beside the chart from 1280px and folds below', async ({ page }) => {
  await expect(page.getByRole('complementary')).toBeVisible();
  await expect(page.getByRole('button', { name: 'About this figure' })).toBeHidden();
  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(page.getByRole('complementary')).toBeHidden();
  await expect(page.getByRole('button', { name: 'About this figure' })).toBeVisible();
});

test('below a 640px pane the mobile step list takes over', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.locator('.sc-table')).toBeHidden();
  await expect(page.locator('.fig-steps')).toBeVisible();
});
