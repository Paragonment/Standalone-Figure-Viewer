import { expect, test, type Page } from '@playwright/test';
import { PHONES, settle } from './helpers';

// The line under a figure's name (dance, level, steps, bars) is the About
// content's sub-header: under the "About" heading beside the chart, and in
// the always-visible head of the About band elsewhere. Never in the header.

const FIGURE = '#/foxtrot/change-of-direction';
const LINE = /Foxtrot\s*Bronze\s*3 steps, 1½ bars/;

const open = async (page: Page) => {
  await page.goto(`/${FIGURE}`);
  await expect(page.locator('.fig-title')).toBeVisible();
  await settle(page);
  await expect(page.locator('.fig-header > .fig-meta')).toHaveCount(0);
};

test.describe('beside the chart', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('sits right under the About heading', async ({ page }) => {
    await open(page);
    const aside = page.locator('.about-aside');
    await expect(aside.locator('.fig-meta')).toHaveText(LINE);
    const order = await aside.evaluate((el) =>
      [...el.children].slice(0, 2).map((child) => child.className.split(' ')[0]),
    );
    expect(order).toEqual(['about-aside-title', 'fig-meta']);
    await expect(page.locator('.about-band .fig-meta')).toBeHidden();
  });
});

const NARROW = [{ width: 1024, height: 768 }, { width: 834, height: 1194 }, ...PHONES];
for (const viewport of NARROW) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });

    test('stays in view with the About band closed', async ({ page }) => {
      await open(page);
      await expect(page.getByRole('button', { name: 'About this figure' })).toHaveAttribute('aria-expanded', 'false');
      const meta = page.locator('.about-band .fig-meta');
      await expect(meta).toBeVisible();
      await expect(meta).toHaveText(LINE);
      await expect(page.locator('.about-aside')).toBeHidden();
    });
  });
}
