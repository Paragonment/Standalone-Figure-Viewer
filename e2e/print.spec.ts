import { expect, test, type Page } from '@playwright/test';
import { FIGURE, filterByDance, openApp, openFigure, settle } from './helpers';

// What printing gives: the figure as a reference sheet, or the contents page
// as an index, with nothing that is only there to operate the app. The page
// is shown with print media, which is what the print preview lays out.

const computed = (page: Page, selector: string, property: string) =>
  page.locator(selector).first().evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

const print = async (page: Page) => {
  await page.emulateMedia({ media: 'print' });
  await settle(page);
};

const stepsTable = (page: Page) => page.getByRole('table', { name: 'Steps' });

// What a reader would not want on paper.
const expectNoChrome = async (page: Page) => {
  await expect(page.getByRole('searchbox')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Copy link' })).toBeHidden();
  await expect(page.getByRole('group', { name: 'Part' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Side by side' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'About this figure' })).toBeHidden();
  await expect(page.locator('.ui-strip')).toBeHidden();
};

// Nothing pinned, and no scroller shorter than what it holds.
const expectOpenPage = async (page: Page) => {
  expect(await computed(page, '.fig-bar', 'position')).toBe('static');
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.app, .fig-scroll, .ds-detail')].filter(
      (el) => el.scrollHeight > el.clientHeight + 1 || getComputedStyle(el).overflowY !== 'visible',
    ).length,
  );
  expect(clipped).toBe(0);
};

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`a figure on a desktop, ${scheme}`, () => {
    test.use({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });

    test.beforeEach(async ({ page }) => {
      await openApp(page, scheme);
      await filterByDance(page, FIGURE.dance);
      await openFigure(page, FIGURE.name);
      await print(page);
    });

    test('is the title, meta line, chart and About notes alone', async ({ page }) => {
      await expect(page.getByRole('heading', { name: FIGURE.name, level: 1 })).toBeVisible();
      await expect(page.locator('.fig-meta')).toContainText('Waltz');
      await expect(stepsTable(page)).toBeVisible();
      await expect(stepsTable(page).getByRole('row')).toHaveCount(1 + 5 * 2);
      await expect(page.getByRole('heading', { name: 'About', level: 2 })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Figure list' })).toBeHidden();
      await expectNoChrome(page);
      await expectOpenPage(page);
    });

    test('is black on white, whatever the theme', async ({ page }) => {
      expect(await computed(page, 'body', 'background-color')).toBe('rgb(255, 255, 255)');
      expect(await computed(page, '.fig-title', 'color')).toBe('rgb(0, 0, 0)');
    });

    test('keeps a step whole and repeats the heading on each page', async ({ page }) => {
      expect(await computed(page, '.sc-table tbody', 'break-inside')).toBe('avoid');
      expect(await computed(page, '.sc-table thead', 'display')).toBe('table-header-group');
    });

    test('prints a related figure as plain text', async ({ page }) => {
      const link = page.locator('.about-link').first();
      await expect(link).toBeVisible();
      expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
    });
  });
}

test.describe('the other part and a phone', () => {
  test('one part prints its row per step, with the partner named in words', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/waltz/back-lock?part=follow');
    await expect(stepsTable(page)).toBeAttached();
    await print(page);
    await expect(stepsTable(page).getByRole('row')).toHaveCount(1 + 5);
    await expect(stepsTable(page).getByText('Lead:').first()).toBeVisible();
  });

  test('a phone prints the same sheet, not the step list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/waltz/back-lock?part=both');
    await expect(page.getByRole('heading', { name: FIGURE.name, level: 1 })).toBeVisible();
    await print(page);
    await expect(stepsTable(page)).toBeVisible();
    await expect(page.locator('.fig-steps')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'About', level: 2 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Figures' })).toBeHidden();
    await expectNoChrome(page);
    await expectOpenPage(page);
  });
});

test.describe('the contents page', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('prints the index alone, its names as plain text', async ({ page }) => {
    await openApp(page);
    await print(page);
    await expect(page.getByRole('heading', { name: 'Pick a figure' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Standard', level: 3 })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Figure list' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    expect(await computed(page, '.ix-names a', 'text-decoration-line')).toBe('none');
    expect(await computed(page, '.fi-body', 'overflow-y')).toBe('visible');
  });
});
