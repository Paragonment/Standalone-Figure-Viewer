import { expect, test, type Page } from '@playwright/test';
import { FIGURE, figureRow, settle } from './helpers';

// The figure pane keeps its bar pinned, a restored step scrolls only as much
// as it must, and the list follows the open figure.
test.use({ viewport: { width: 1440, height: 900 } });

const LONG_FIGURE = '#/cha-cha-cha/turkish-towel';

const openLink = async (page: Page, hash: string) => {
  await page.goto(`/${hash}`);
  await expect(page.locator('.ds')).toBeVisible();
  await expect(page.locator('.fig-title')).toBeVisible();
  await settle(page);
};

const top = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => el.getBoundingClientRect().top);
const bottom = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => el.getBoundingClientRect().bottom);

test('a step that is already in view does not scroll the pane', async ({ page }) => {
  await openLink(page, '#/waltz/back-lock?part=follow&step=3');
  await expect(page.locator('.sc-step-current')).toHaveAttribute('data-n', '3');
  expect(await page.locator('.fig-scroll').evaluate((el) => el.scrollTop)).toBe(0);
  for (const name of ['Copy link', 'Menu']) {
    await expect(page.getByRole('button', { name })).toBeInViewport();
  }
  await expect(page.locator('.fig-title')).toBeInViewport({ ratio: 1 });
});

test('a step below the fold scrolls just enough to show above the pane edge', async ({ page }) => {
  await openLink(page, `${LONG_FIGURE}?step=25`);
  await expect(page.locator('.sc-step-current')).toHaveAttribute('data-n', '25');
  const box = await page.locator('.sc-step-current').boundingBox();
  const barBottom = await bottom(page, '.fig-bar');
  const paneBottom = await bottom(page, '.fig-scroll');
  expect(box!.y).toBeGreaterThanOrEqual(barBottom - 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(paneBottom + 1);
  // Brought in from below, not pulled up to the frozen block. (The fonts
  // arriving move rows a little, so near the bottom edge is as exact as it gets.)
  expect(box!.y).toBeGreaterThan((barBottom + paneBottom) / 2);
});

test('the bar stays pinned and shows the figure name once the title is gone', async ({ page }) => {
  await openLink(page, LONG_FIGURE);
  const barTitle = page.locator('.db .ui-topbar-title');
  await expect(barTitle).toHaveCSS('opacity', '0');

  await page.locator('.fig-scroll').evaluate((el) => {
    el.scrollTop = 500;
  });
  await expect(barTitle).toHaveCSS('opacity', '1');
  await expect(barTitle).toHaveText('Turkish Towel');

  expect(await top(page, '.db')).toBe(await top(page, '.fig-scroll'));
  // The frozen block sticks directly under it, overlapping its last pixel so
  // the two never draw a double rule.
  expect(await top(page, '.fig-bar')).toBe((await bottom(page, '.db')) - 1);
  await expect(page.locator('.db')).not.toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');

  // Settings is still reachable from far down the figure.
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
});

test('the pinned bar is above the frozen block and the chart', async ({ page }) => {
  await openLink(page, LONG_FIGURE);
  await page.locator('.fig-scroll').evaluate((el) => {
    el.scrollTop = 500;
  });
  const onTop = await page.locator('.db').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return document.elementFromPoint(r.left + 4, r.bottom - 1)?.closest('.db') !== null;
  });
  expect(onTop).toBe(true);
});

test('a deep link scrolls the list to the open figure', async ({ page }) => {
  await openLink(page, '#/waltz/whisk-when-lead-turns-1-8');
  const row = figureRow(page, 'Whisk When Lead Turns 1/8');
  await expect(row).toHaveAttribute('aria-current', 'true');
  const scroller = (await page.locator('.home-scroll').boundingBox())!;
  const box = (await row.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(scroller.y);
  expect(box.y + box.height).toBeLessThanOrEqual(scroller.y + scroller.height);
});

test('clicking a row that is only partly in view does not move the list', async ({ page }) => {
  await openLink(page, '#/waltz/back-lock');
  const scroller = page.locator('.home-scroll');
  // Scroll so a row far down the list is cut by the bottom edge, 20px of it showing.
  const point = await scroller.evaluate((el) => {
    const view = el.getBoundingClientRect();
    const row = el.querySelectorAll<HTMLElement>('.fl-row')[20];
    el.scrollTop += row.getBoundingClientRect().top - (view.bottom - 20);
    return { x: row.getBoundingClientRect().left + 40, y: view.bottom - 6 };
  });
  const before = await scroller.evaluate((el) => el.scrollTop);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('.fig-title')).not.toHaveText(FIGURE.name);
  expect(await scroller.evaluate((el) => el.scrollTop)).toBe(before);
});
