import { expect, test, type Page } from '@playwright/test';
import { FIGURE, figureRow, filterByDance, openApp, openFigure, openShortcuts, settle } from './helpers';

// Keyboard shortcuts of the two-pane layout: each group, then the guards.
test.use({ viewport: { width: 1280, height: 800 } });

const title = (page: Page) => page.locator('.fig-title');
const currentStep = (page: Page) => page.locator('.sc-step-current');
const search = (page: Page) => page.getByRole('searchbox');
const announcer = (page: Page) => page.locator('.ds > [aria-live="polite"]');
const hash = (page: Page) => page.evaluate(() => window.location.hash);
const part = (page: Page, name: 'Lead' | 'Follow') =>
  page.getByRole('group', { name: 'Part' }).getByRole('button', { name });
const sideBySide = (page: Page) => page.getByRole('button', { name: 'Side by side' });

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await filterByDance(page, FIGURE.dance);
});

test.describe('find', () => {
  test('/ focuses the search, Esc clears it, then Esc returns to the list', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(search(page)).toBeFocused();
    // The key itself is not typed into the field.
    await expect(search(page)).toHaveValue('');
    await page.keyboard.type('lock');
    await expect(search(page)).toHaveValue('lock');

    await page.keyboard.press('Escape');
    await expect(search(page)).toHaveValue('');
    await expect(search(page)).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('.fl-row').first()).toBeFocused();
  });
});

test.describe('figures', () => {
  test('the arrows open the next and previous figure and focus follows the row', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await figureRow(page, FIGURE.name).focus();
    await page.keyboard.press('ArrowDown');
    await expect(title(page)).toHaveText('Back Whisk');
    await expect(figureRow(page, 'Back Whisk')).toHaveAttribute('aria-current', 'true');
    await expect(figureRow(page, 'Back Whisk')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(title(page)).toHaveText(FIGURE.name);
    await expect(figureRow(page, FIGURE.name)).toBeFocused();
  });

  test('the arrows do nothing when focus is not on the list', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await page.getByRole('button', { name: 'Copy link' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(title(page)).toHaveText(FIGURE.name);
  });

  test('from nothing open, the first arrow opens a figure and Back returns to nothing', async ({ page }) => {
    await page.keyboard.press('/');
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowDown');
    await expect(title(page)).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    // Stepping through the list is one stop in history.
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Pick a figure' })).toBeVisible();
  });

  test('[ and ] step through the list from anywhere, and the choice is announced', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await page.keyboard.press(']');
    await expect(title(page)).toHaveText('Back Whisk');
    await expect(announcer(page)).toHaveText('Back Whisk, Waltz, Bronze');
    await page.keyboard.press('[');
    await expect(title(page)).toHaveText(FIGURE.name);
    await expect(announcer(page)).toHaveText('Back Lock, Waltz, Bronze');
    expect(await hash(page)).toBe('#/waltz/back-lock');
  });

  test('choosing a figure by key does not take focus from where it is', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    const filter = page.locator('button[aria-pressed]').and(page.getByRole('button', { name: 'Tango', exact: true }));
    await filter.focus();
    await page.keyboard.press(']');
    await expect(title(page)).toHaveText('Back Whisk');
    await expect(filter).toBeFocused();
  });

  test('the list scrolls to a figure reached by the keyboard, and stops at its ends', async ({ page }) => {
    await page.keyboard.press('/');
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowDown');
    const first = await title(page).textContent();
    await page.keyboard.press('ArrowUp');
    await expect(title(page)).toHaveText(first!);
    for (let i = 0; i < 40; i += 1) await page.keyboard.press(']');
    const selected = page.locator('.fl-row[aria-current="true"]');
    const scroller = (await page.locator('.home-scroll').boundingBox())!;
    const box = (await selected.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(scroller.y + scroller.height + 1);
    expect(box.y).toBeGreaterThanOrEqual(scroller.y);
  });

  test('Enter moves focus to the open figure', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await page.keyboard.press('Enter');
    await expect(title(page)).toBeFocused();
  });

  test('Enter on the focused open row moves to the figure rather than pressing the row', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await figureRow(page, FIGURE.name).focus();
    await page.keyboard.press('Enter');
    await expect(title(page)).toBeFocused();
  });

  test('Enter still presses a button that has focus', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('button', { name: 'Bronze' }).focus();
    await page.keyboard.press('Enter');
    await expect(title(page)).not.toBeFocused();
    await expect(page.getByRole('button', { name: 'Bronze', exact: true }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

test.describe('steps', () => {
  test.beforeEach(async ({ page }) => {
    await openFigure(page, FIGURE.name);
  });

  test('j and k move to the next and previous step', async ({ page }) => {
    await expect(currentStep(page)).toHaveAttribute('data-n', '1');
    await page.keyboard.press('j');
    await expect(currentStep(page)).toHaveAttribute('data-n', '2');
    await page.keyboard.press('j');
    await expect(currentStep(page)).toHaveAttribute('data-n', '3');
    await page.keyboard.press('k');
    await expect(currentStep(page)).toHaveAttribute('data-n', '2');
  });

  test('the first and last step are the ends', async ({ page }) => {
    await page.keyboard.press('k');
    await expect(currentStep(page)).toHaveAttribute('data-n', '1');
    await page.keyboard.press('5');
    await expect(currentStep(page)).toHaveAttribute('data-n', '5');
    await page.keyboard.press('j');
    await expect(currentStep(page)).toHaveAttribute('data-n', '5');
  });

  test('a digit goes to that step, and one past the last is ignored', async ({ page }) => {
    await page.keyboard.press('4');
    await expect(currentStep(page)).toHaveAttribute('data-n', '4');
    await page.keyboard.press('9');
    await expect(currentStep(page)).toHaveAttribute('data-n', '4');
    await page.keyboard.press('2');
    await expect(currentStep(page)).toHaveAttribute('data-n', '2');
  });
});

test.describe('part', () => {
  test.beforeEach(async ({ page }) => {
    await openFigure(page, FIGURE.name);
  });

  test('l, f and b pick Lead, Follow and both side by side', async ({ page }) => {
    await page.keyboard.press('f');
    await expect(part(page, 'Follow')).toHaveAttribute('aria-pressed', 'true');
    await expect(sideBySide(page)).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('l');
    await expect(part(page, 'Lead')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('b');
    await expect(sideBySide(page)).toHaveAttribute('aria-pressed', 'true');
  });

  test('a part picked by key is kept, as when clicked', async ({ page }) => {
    await page.keyboard.press('f');
    await expect(part(page, 'Follow')).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(title(page)).toBeVisible();
    await expect(part(page, 'Follow')).toHaveAttribute('aria-pressed', 'true');
  });

  test('the step in view stays put across a part change', async ({ page }) => {
    await page.keyboard.press('3');
    await expect(currentStep(page)).toHaveAttribute('data-n', '3');
    await page.keyboard.press('f');
    await expect(currentStep(page)).toHaveAttribute('data-n', '3');
  });
});

test.describe('general', () => {
  test('? opens the shortcuts dialog and Esc closes it', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await openShortcuts(page);
    const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
    for (const group of ['Find', 'Figures', 'Steps', 'Part', 'General']) {
      await expect(dialog.getByRole('heading', { name: group })).toBeVisible();
    }
    // Practice is not on offer, so it is not listed.
    await expect(dialog.getByText('Practice the open figure')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test(', opens Settings, whose Keyboard shortcuts row opens the dialog above it', async ({ page }) => {
    await page.keyboard.press(',');
    const settings = page.getByRole('dialog', { name: 'Settings' });
    await expect(settings).toBeVisible();
    await settings.getByRole('button', { name: /Keyboard shortcuts/ }).click();
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeHidden();
    await expect(settings).toBeVisible();
  });

  test('p does nothing while Practice is off', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await page.keyboard.press('p');
    expect(await hash(page)).toBe('#/waltz/back-lock');
  });
});

test.describe('guards', () => {
  test('letters typed into the search are text, not shortcuts', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await search(page).click();
    await page.keyboard.type('jkflb?,3/');
    await expect(search(page)).toHaveValue('jkflb?,3/');
    await expect(currentStep(page)).toHaveAttribute('data-n', '1');
    await expect(sideBySide(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('a key with Ctrl, Meta or Alt held is left alone', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    for (const modifier of ['Control', 'Meta', 'Alt']) {
      await page.keyboard.press(`${modifier}+j`);
      await page.keyboard.press(`${modifier}+/`);
    }
    await expect(currentStep(page)).toHaveAttribute('data-n', '1');
    await expect(search(page)).not.toBeFocused();
  });

  test('nothing fires while Settings is open', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await page.keyboard.press(',');
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await page.keyboard.press('j');
    await page.keyboard.press('/');
    await page.keyboard.press(']');
    await page.keyboard.press('?');
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeHidden();
    await settle(page);
    await expect(currentStep(page)).toHaveAttribute('data-n', '1');
    await expect(title(page)).toHaveText(FIGURE.name);
    await expect(search(page)).not.toBeFocused();
  });

  test('nothing fires while the shortcuts dialog is open', async ({ page }) => {
    await openFigure(page, FIGURE.name);
    await openShortcuts(page);
    await page.keyboard.press('j');
    await page.keyboard.press('f');
    await page.keyboard.press('/');
    await page.keyboard.press(',');
    await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(currentStep(page)).toHaveAttribute('data-n', '1');
    await expect(sideBySide(page)).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the keys do nothing and Settings has no shortcuts row', async ({ page }) => {
    await page.keyboard.press('?');
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Menu' }).first().click();
    const settings = page.getByRole('dialog', { name: 'Settings' });
    await expect(settings).toBeVisible();
    await expect(settings.getByRole('button', { name: /Keyboard shortcuts/ })).toHaveCount(0);
  });
});
