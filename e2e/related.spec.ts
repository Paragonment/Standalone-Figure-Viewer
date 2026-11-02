import { expect, test, type Page } from '@playwright/test';
import { settle } from './helpers';

// Related figures: a figure's notes name the figures of its dance that come
// before and after it, and each name is a link. The same on a phone (About
// band, closed until opened) and on a wide desktop (About aside, open).

const FROM = '#/waltz/closed-change-natural-to-reverse';

const LAYOUTS = [
  { name: 'phone', viewport: { width: 390, height: 844 }, currentStep: '.fig-step-current', band: true },
  { name: 'laptop', viewport: { width: 1440, height: 900 }, currentStep: '.sc-step-current', band: false },
];

const open = async (page: Page, hash: string, band: boolean) => {
  await page.goto(`/${hash}`);
  await expect(page.locator('.fig-title')).toBeVisible();
  if (band) {
    const toggle = page.getByRole('button', { name: 'About this figure' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  await settle(page);
};

for (const layout of LAYOUTS) {
  test.describe(layout.name, () => {
    test.use({ viewport: layout.viewport });

    test('a related figure is a real link that opens it, and Back returns to where you were', async ({ page }) => {
      await open(page, `${FROM}?step=2`, layout.band);
      await expect(page.locator(layout.currentStep)).toHaveAttribute('data-n', '2');

      const link = page.locator('.about-link', { hasText: /^Natural Turn$/ }).first();
      await expect(link).toHaveAttribute('href', '#/waltz/natural-turn');
      await link.click();
      await expect(page.getByRole('heading', { name: 'Natural Turn', level: 1 })).toBeVisible();
      await expect(page).toHaveTitle('Natural Turn, Waltz - Figure Viewer');

      await page.goBack();
      await expect(page.getByRole('heading', { name: 'Closed Change Natural to Reverse', level: 1 })).toBeVisible();
      await expect(page.locator(layout.currentStep)).toHaveAttribute('data-n', '2');
    });

    test('a figure does not link to itself, and levels head what precedes and follows', async ({ page }) => {
      await open(page, '#/waltz/natural-turn', layout.band);
      await expect(page.locator('.about-link[href="#/waltz/natural-turn"]')).toHaveCount(0);
      await expect(page.locator('.about-link').first()).toBeVisible();

      await open(page, FROM, layout.band);
      await expect(page.locator('.about-levels', { hasText: 'Bronze' }).first()).toBeVisible();
    });
  });
}
