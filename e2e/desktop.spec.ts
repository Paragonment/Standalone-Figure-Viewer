import { expect, test } from '@playwright/test';
import { FIGURE, figureRow, filterByDance, openApp, openFigure, openSettings } from './helpers';

// Behavior of the two-pane layout that does not depend on pixels.
test.use({ viewport: { width: 1280, height: 800 } });

const NEIGHBOR = 'Natural Turn';

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test('nothing is open at first', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Pick a figure' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practice' })).toHaveCount(0);
});

test('clicking a row opens the figure in the right pane and marks it selected', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
  await expect(figureRow(page, FIGURE.name)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[aria-current="true"]')).toHaveCount(1);
  // The list is still there beside it.
  await expect(page.getByRole('searchbox')).toBeVisible();
});

test('both parts show until the reader picks one, and the pick sticks', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
  const sideBySide = page.getByRole('button', { name: 'Side by side' });
  await expect(sideBySide).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Part' }).getByRole('button', { name: 'Follow' }).click();
  await expect(sideBySide).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.getByRole('heading', { name: FIGURE.name, level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Side by side' })).toHaveAttribute('aria-pressed', 'false');
});

test('the list keeps its scroll position while figures open', async ({ page }) => {
  const scroller = page.locator('.home-scroll');
  await scroller.evaluate((el) => {
    el.scrollTop = 600;
  });
  const before = await scroller.evaluate((el) => el.scrollTop);
  expect(before).toBeGreaterThan(0);
  // A real click on whichever row is under the pointer, so nothing scrolls it into view.
  await page.mouse.click(190, 500);
  await expect(page.locator('.fig-title')).toBeVisible();
  expect(await scroller.evaluate((el) => el.scrollTop)).toBe(before);
});

test('browser Back steps from one figure to the previous one, then to nothing', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
  await openFigure(page, NEIGHBOR);
  await page.goBack();
  await expect(page.getByRole('heading', { name: FIGURE.name, level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Pick a figure' })).toBeVisible();
});

test('the breadcrumb sets the dance and level filters', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
  await page.getByRole('button', { name: 'Tango', exact: true }).click();
  const crumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await crumb.getByRole('button', { name: FIGURE.dance }).click();
  await expect(page.getByRole('button', { name: FIGURE.dance, exact: true }).first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Tango', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await crumb.getByRole('button', { name: 'Bronze' }).click();
  await expect(page.getByRole('button', { name: 'Bronze', exact: true }).first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('settings opens as a 360px column at the right edge', async ({ page }) => {
  await openSettings(page);
  const box = await page.locator('.slide-page-panel').first().boundingBox();
  expect(box?.width).toBe(360);
});

test('resizing to a phone keeps the open figure', async ({ page }) => {
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: FIGURE.name, level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practice' })).toBeVisible();
  // The saved part is untouched by the resize: Lead on a phone.
  await expect(page.getByRole('button', { name: 'Side by side' })).toHaveAttribute('aria-pressed', 'false');
});
