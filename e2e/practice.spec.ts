import { expect, test, type Page } from '@playwright/test';
import { FIGURE, filterByDance, openApp, openFigure, openSettings, openShortcuts, settle, turnOnPractice } from './helpers';

// Show Practice: off on a wide window until Settings turns it on, then a
// button and the P key open Practice over the whole window.

test.use({ viewport: { width: 1280, height: 800 } });

const practiceButton = (page: Page) => page.getByRole('button', { name: 'Practice' });
const backToSteps = (page: Page) => page.getByRole('button', { name: 'Back to steps' });
const showPracticeSwitch = (page: Page) =>
  page.getByRole('dialog', { name: 'Settings' }).getByRole('switch', { name: 'Show Practice' });
const figureTitle = (page: Page) => page.getByRole('heading', { name: FIGURE.name, level: 1 });
const hash = (page: Page) => page.evaluate(() => window.location.hash);

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await filterByDance(page, FIGURE.dance);
  await openFigure(page, FIGURE.name);
});

test.describe('the setting', () => {
  test('is off until Settings turns it on, and stays on after a reload', async ({ page }) => {
    await expect(practiceButton(page)).toHaveCount(0);
    await openSettings(page);
    await expect(showPracticeSwitch(page)).toHaveAttribute('aria-checked', 'false');
    await page.keyboard.press('Escape');

    await turnOnPractice(page);
    await expect(practiceButton(page)).toBeVisible();

    await page.reload();
    await expect(practiceButton(page)).toBeVisible();
    await openSettings(page);
    await expect(showPracticeSwitch(page)).toHaveAttribute('aria-checked', 'true');
  });

  test('turning it off takes the button away', async ({ page }) => {
    await turnOnPractice(page);
    await openSettings(page);
    await showPracticeSwitch(page).click();
    await page.keyboard.press('Escape');
    await expect(practiceButton(page)).toHaveCount(0);
  });

  test('the P key and the shortcut listing follow it', async ({ page }) => {
    await openShortcuts(page);
    await expect(page.getByText('Practice the open figure')).toHaveCount(0);
    await page.keyboard.press('Escape');

    await turnOnPractice(page);
    await openShortcuts(page);
    await expect(page.getByText('Practice the open figure')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeHidden();

    await page.keyboard.press('p');
    await expect(backToSteps(page)).toBeVisible();
    expect(await hash(page)).toBe('#/waltz/back-lock/practice');
  });

  test('a phone has no switch: Practice is always there', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(practiceButton(page)).toBeVisible();
    await openSettings(page);
    await expect(showPracticeSwitch(page)).toHaveCount(0);
  });
});

test.describe('Practice on a wide window', () => {
  test.beforeEach(async ({ page }) => {
    await turnOnPractice(page);
    await practiceButton(page).click();
    await expect(backToSteps(page)).toBeVisible();
    await settle(page);
  });

  test('covers both panes, in a column no wider than 640px', async ({ page }) => {
    // The panes are still there under it, out of reach.
    await expect(page.locator('.ds-list')).toHaveAttribute('inert', '');
    await expect(page.locator('.ds-detail')).toHaveAttribute('inert', '');
    await expect(page.getByRole('main', { name: /step 1/i })).toBeVisible();
    expect(await page.locator('.dp').boundingBox()).toEqual({ x: 0, y: 0, width: 1280, height: 800 });
    expect(await page.locator('.pr-foot-row').boundingBox()).toMatchObject({ x: 320, width: 640 });
  });

  test('Esc returns to the figure', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(figureTitle(page)).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
    expect(await hash(page)).toBe('#/waltz/back-lock');
  });

  test('Back returns to the figure and Forward to Practice', async ({ page }) => {
    await page.goBack();
    await expect(figureTitle(page)).toBeVisible();
    await page.goForward();
    await expect(backToSteps(page)).toBeVisible();
  });

  test('its own Back button returns too', async ({ page }) => {
    await backToSteps(page).click();
    await expect(figureTitle(page)).toBeVisible();
  });

  test('the keys for the list and the steps wait until it is closed', async ({ page }) => {
    await page.keyboard.press(']');
    await page.keyboard.press('j');
    await expect(backToSteps(page)).toBeVisible();
    expect(await hash(page)).toBe('#/waltz/back-lock/practice');
  });
});
