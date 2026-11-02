import { expect, test, type Page } from '@playwright/test';
import { FIGURE, filterByDance, openApp, searchFor, settle } from './helpers';

// The contents page in the right pane and the list's dance headings: what
// they list, what a click does, and that the phone is left alone.
test.use({ viewport: { width: 1280, height: 800 } });

const contents = (page: Page) => page.locator('.fi');
const filterButton = (page: Page, name: string) =>
  page.locator('button[aria-pressed]').and(page.getByRole('button', { name, exact: true }));

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe('contents page', () => {
  test('is a table per style, dances across and levels down, with every figure a link', async ({ page }) => {
    const standard = contents(page).getByRole('region', { name: 'Standard' });
    const latin = contents(page).getByRole('region', { name: 'Latin' });
    await expect(standard.getByRole('columnheader')).toHaveText([/^Waltz\s*36$/, /^Tango\s*31$/, /^Foxtrot\s*29$/, /^Quickstep\s*33$/]);
    await expect(latin.getByRole('columnheader')).toHaveCount(5);
    await expect(standard.getByRole('rowheader')).toHaveText(['Pre-Bronze', 'Bronze', 'Silver', 'Gold']);
    // All of them, not the first few.
    expect(await contents(page).getByRole('link').count()).toBe(337);
    await expect(contents(page).getByText('337 figures across 9 dances')).toBeVisible();
  });

  test('a name opens its figure, and Back returns to the contents', async ({ page }) => {
    // Quickstep has a Back Lock too; the address tells them apart.
    const link = contents(page).getByRole('link', { name: FIGURE.name, exact: true }).and(page.locator('[href="#/waltz/back-lock"]'));
    await link.click();
    await expect(page.getByRole('heading', { name: FIGURE.name, level: 1 })).toBeVisible();
    expect(new URL(page.url()).hash).toBe('#/waltz/back-lock');
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Pick a figure' })).toBeVisible();
  });

  test('narrows to the picked dance and level', async ({ page }) => {
    await filterByDance(page, 'Tango');
    await expect(contents(page).getByRole('region', { name: 'Latin' })).toHaveCount(0);
    await expect(contents(page).getByRole('columnheader')).toHaveText([/^Tango\s*31$/]);
    await filterButton(page, 'Gold').click();
    await expect(contents(page).getByRole('rowheader')).toHaveText(['Gold']);
    await expect(contents(page).getByText(/figures? across 1 dance\./)).toBeVisible();
  });

  test('a dance heading sets the dance filter, a level heading the level filter', async ({ page }) => {
    await contents(page).getByRole('button', { name: /^Rumba/ }).click();
    await expect(filterButton(page, 'Rumba')).toHaveAttribute('aria-pressed', 'true');
    await expect(filterButton(page, 'Waltz')).toHaveAttribute('aria-pressed', 'false');
    await expect(contents(page).getByRole('columnheader')).toHaveText([/^Rumba\s*\d+$/]);

    await contents(page).getByRole('button', { name: 'Silver' }).click();
    await expect(filterButton(page, 'Silver')).toHaveAttribute('aria-pressed', 'true');
    await expect(contents(page).getByRole('rowheader')).toHaveText(['Silver']);
    await expect(page.locator('.fl-group-head')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Silver', level: 2 })).toBeVisible();
  });

  test('keeps the bad-link notice', async ({ page }) => {
    await page.goto('/#/waltz/no-such-figure');
    await expect(page.getByRole('status').filter({ hasText: 'No figure called' })).toBeVisible();
    await expect(contents(page).getByRole('link').first()).toBeVisible();
  });
});

test.describe('list grouped by dance', () => {
  const heads = (page: Page) => page.locator('.fl-group-head > span:first-child');

  test('shows a heading for each dance, in the dances order, with its levels beneath', async ({ page }) => {
    await expect(heads(page)).toHaveText([
      'Waltz',
      'Tango',
      'Foxtrot',
      'Quickstep',
      'Cha Cha Cha',
      'Samba',
      'Rumba',
      'Paso Doble',
      'Jive',
    ]);
    const waltz = page.locator('.fl-group').first();
    await expect(waltz.getByRole('heading', { level: 3 }).first()).toHaveText(/^Pre-Bronze\s*\d+$/);
    // Dance and level are said by the headings, so a row carries neither.
    await expect(waltz.locator('.fl-sub')).toHaveCount(0);
  });

  test('a dance heading sticks under the count bar while its figures scroll', async ({ page }) => {
    const scroller = page.locator('.home-scroll');
    await scroller.evaluate((el) => {
      el.scrollTop = 600;
    });
    await settle(page);
    const barBottom = await page.locator('.hb').evaluate((el) => el.getBoundingClientRect().bottom);
    const stuck = await page.locator('.fl-group-head').evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().top).filter((top) => top >= 0 && top < 400),
    );
    // Whichever dance is under the bar has its heading right there.
    expect(Math.min(...stuck)).toBeGreaterThanOrEqual(barBottom - 2);
    expect(Math.min(...stuck)).toBeLessThanOrEqual(barBottom + 1);
  });

  test('one dance goes back to level headings alone, and a search to plain matches', async ({ page }) => {
    await filterByDance(page, 'Waltz');
    await expect(page.locator('.fl-group-head')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /^Pre-Bronze/, level: 2 })).toBeVisible();
    await filterButton(page, 'Waltz').click();
    await expect(heads(page)).toHaveCount(9);
    await searchFor(page, 'natural');
    await expect(page.locator('.fl-group-head')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /^Names/ })).toBeVisible();
  });

  test('selecting a figure scrolls its row clear of both stuck headings', async ({ page }) => {
    await page.goto('/#/jive/chicken-walks');
    await expect(page.locator('.fig-title')).toBeVisible();
    await settle(page);
    const row = page.locator('.fl-row[aria-current="true"]');
    await expect(row).toBeVisible();
    const rowTop = await row.evaluate((el) => el.getBoundingClientRect().top);
    const headBottom = await page.locator('.fl-group-head').evaluateAll((els) =>
      Math.max(...els.map((el) => el.getBoundingClientRect().bottom)),
    );
    expect(rowTop).toBeGreaterThanOrEqual(headBottom - 1);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the list stays one run of figures, with no dance headings', async ({ page }) => {
    await expect(page.locator('.fl-group-head')).toHaveCount(0);
    await expect(page.locator('.fl-sub').first()).toBeVisible();
  });
});
