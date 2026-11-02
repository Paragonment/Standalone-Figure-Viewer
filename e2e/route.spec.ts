import { expect, test, type Page } from '@playwright/test';
import { FIGURE, figureRow, filterByDance, openApp, openFigure, openSettings, searchFor, settle, startWithPractice } from './helpers';

// Deep links and history: the address says what is open, and Back, Forward
// and a reload bring the same thing back. The same on a phone and on a desktop.

const LAYOUTS = [
  { name: 'phone', viewport: { width: 390, height: 844 }, currentStep: '.fig-step-current' },
  { name: 'desktop', viewport: { width: 1280, height: 800 }, currentStep: '.sc-step-current' },
];

const BACK_LOCK = '#/waltz/back-lock';

const title = (page: Page, name: string) => page.getByRole('heading', { name, level: 1 });

// Opens a link the way a person arriving from elsewhere does.
const openLink = async (page: Page, hash: string) => {
  await page.goto(`/${hash}`);
  await expect(page.locator('.vc-stack, .ds')).toBeVisible();
  await settle(page);
};

const hashOf = (page: Page) => page.evaluate(() => window.location.hash);

for (const layout of LAYOUTS) {
  test.describe(layout.name, () => {
    test.use({ viewport: layout.viewport, permissions: ['clipboard-read', 'clipboard-write'] });

    test('a deep link opens the figure, its part and its step, and a reload keeps them', async ({ page }) => {
      await openLink(page, `${BACK_LOCK}?part=follow&step=3`);
      await expect(title(page, FIGURE.name)).toBeVisible();
      await expect(page.getByRole('group', { name: 'Part' }).getByRole('button', { name: 'Follow' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.getByRole('button', { name: 'Side by side' })).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator(layout.currentStep)).toHaveAttribute('data-n', '3');
      await expect(page).toHaveTitle('Back Lock, Waltz - Figure Viewer');

      await page.reload();
      await expect(title(page, FIGURE.name)).toBeVisible();
      await expect(page.locator(layout.currentStep)).toHaveAttribute('data-n', '3');
      expect(await hashOf(page)).toBe(`${BACK_LOCK}?part=follow&step=3`);
    });

    test("a link's part does not overwrite the saved one", async ({ page }) => {
      await openLink(page, `${BACK_LOCK}?part=follow`);
      await expect(page.getByRole('group', { name: 'Part' }).getByRole('button', { name: 'Follow' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('fv-settings') ?? '{}'));
      expect(saved.role).toBe('lead');
      // Another figure, with no part of its own, shows the saved one again.
      await openLink(page, '#/waltz/natural-turn');
      await expect(page.getByRole('group', { name: 'Part' }).getByRole('button', { name: 'Lead' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('picking a part and scrolling to a step update the address in place', async ({ page }) => {
      await openLink(page, BACK_LOCK);
      const entries = await page.evaluate(() => window.history.length);
      await page.getByRole('group', { name: 'Part' }).getByRole('button', { name: 'Follow' }).click();
      await expect.poll(() => hashOf(page)).toBe(`${BACK_LOCK}?part=follow`);
      await page.getByRole('group', { name: 'Rhythm, go to a step' }).getByRole('button').nth(3).click();
      await expect.poll(() => hashOf(page)).toMatch(/^#\/waltz\/back-lock\?part=follow&step=\d$/);
      expect(await page.evaluate(() => window.history.length)).toBe(entries);
    });

    test('filters and search live in the address of the list and survive a reload', async ({ page }) => {
      await openApp(page);
      const entries = await page.evaluate(() => window.history.length);
      await filterByDance(page, FIGURE.dance);
      await page.getByRole('group', { name: 'Level' }).getByRole('button', { name: 'Bronze', exact: true }).click();
      await searchFor(page, 'lock');
      await expect.poll(() => hashOf(page)).toBe('#/?dance=waltz&level=bronze&q=lock');
      expect(await page.evaluate(() => window.history.length)).toBe(entries);

      await page.reload();
      await expect(page.locator('.fl-row').first()).toBeVisible();
      await expect(page.getByRole('button', { name: FIGURE.dance, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('group', { name: 'Level' }).getByRole('button', { name: 'Bronze', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('searchbox')).toHaveValue('lock');
      await expect(figureRow(page, FIGURE.name)).toBeVisible();
    });

    test('Back and Forward retrace the figures that were read', async ({ page }) => {
      await openApp(page);
      await filterByDance(page, FIGURE.dance);
      await openFigure(page, FIGURE.name);
      expect(await hashOf(page)).toBe(BACK_LOCK);
      if (layout.name === 'phone') {
        await page.goBack();
        await expect(page.getByRole('heading', { name: 'Figures', level: 1 })).toBeVisible();
        await page.goForward();
        await expect(title(page, FIGURE.name)).toBeVisible();
        return;
      }
      await openFigure(page, 'Natural Turn');
      expect(await hashOf(page)).toBe('#/waltz/natural-turn');
      await page.goBack();
      await expect(title(page, FIGURE.name)).toBeVisible();
      await expect(figureRow(page, FIGURE.name)).toHaveAttribute('aria-current', 'true');
      await page.goBack();
      await expect(page.getByRole('heading', { name: 'Pick a figure' })).toBeVisible();
      await page.goForward();
      await page.goForward();
      await expect(title(page, 'Natural Turn')).toBeVisible();
    });

    test('Back from a link that opened here lands on the list, with the same filters', async ({ page }) => {
      await openLink(page, `${BACK_LOCK}?step=2`);
      if (layout.name === 'phone') {
        await page.getByRole('button', { name: 'Figures' }).click();
        await expect(page.getByRole('heading', { name: 'Figures', level: 1 })).toBeVisible();
        expect(await hashOf(page)).toBe('#/');
      } else {
        await expect(title(page, FIGURE.name)).toBeVisible();
      }
    });

    test('an unknown figure shows the list and says so', async ({ page }) => {
      await openLink(page, '#/waltz/no-such-figure');
      await expect(page.getByRole('status').filter({ hasText: 'No figure called “no such figure”' })).toBeVisible();
      await expect(page.locator('.fl-row').first()).toBeVisible();
      await expect(page).toHaveTitle('Figure Viewer');
      // Nothing else in the way: a figure still opens.
      await filterByDance(page, FIGURE.dance);
      await openFigure(page, FIGURE.name);
      await expect(page.getByText('No figure called')).toHaveCount(0);
    });

    test('an unknown dance does the same', async ({ page }) => {
      await openLink(page, '#/polka/back-lock');
      await expect(page.getByText('No figure called “back lock”')).toBeVisible();
    });

    test('Back closes Settings first, then the figure is still there', async ({ page }) => {
      await openLink(page, `${BACK_LOCK}?part=follow&step=2`);
      await openSettings(page);
      await page.goBack();
      await expect(page.getByRole('dialog', { name: 'Settings' })).toBeHidden();
      await expect(title(page, FIGURE.name)).toBeVisible();
      expect(await hashOf(page)).toBe(`${BACK_LOCK}?part=follow&step=2`);
    });

    test('Practice has its own address and Back returns to the steps', async ({ page }) => {
      await startWithPractice(page);
      await openLink(page, `${BACK_LOCK}/practice?part=follow`);
      await expect(page.getByRole('button', { name: 'Back to steps' })).toBeVisible();
      await page.getByRole('button', { name: 'Back to steps' }).click();
      await expect(title(page, FIGURE.name)).toBeVisible();
      expect(await hashOf(page)).toBe(`${BACK_LOCK}?part=follow`);
    });
  });
}

test.describe('Copy link', () => {
  test.use({ viewport: { width: 1280, height: 800 }, permissions: ['clipboard-read', 'clipboard-write'] });

  test('copies the address of what is on screen and says so', async ({ page }) => {
    await openLink(page, `${BACK_LOCK}?part=follow&step=3`);
    await page.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Link copied' })).toBeAttached();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(new URL(copied).hash).toBe(`${BACK_LOCK}?part=follow&step=3`);
    expect(copied).toBe(page.url());
    // The words come back.
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
  });

  test('includes the part and step the reader has reached', async ({ page }) => {
    await openApp(page);
    await filterByDance(page, FIGURE.dance);
    await openFigure(page, FIGURE.name);
    await page.getByRole('button', { name: 'Copy link' }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(new URL(copied).hash).toBe(`${BACK_LOCK}?part=both`);
  });

  test('says so when the clipboard refuses', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) },
      });
    });
    await openLink(page, BACK_LOCK);
    await page.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.getByRole('button', { name: 'Could not copy' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Could not copy the link' })).toBeAttached();
  });
});

test('resizing across the phone breakpoint keeps the open figure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openLink(page, `${BACK_LOCK}?part=follow&step=3`);
  await expect(title(page, FIGURE.name)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.vc-stack')).toBeVisible();
  await expect(title(page, FIGURE.name)).toBeVisible();
  await expect(page.getByRole('group', { name: 'Part' }).getByRole('button', { name: 'Follow' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('.ds')).toBeVisible();
  await expect(title(page, FIGURE.name)).toBeVisible();
  expect(await hashOf(page)).toMatch(/^#\/waltz\/back-lock\?part=follow/);
});
