import { expect, test, type Page } from '@playwright/test';
import { DESKTOPS, FIGURE, SCHEMES, filterByDance, openApp, openFigure, openSettings, settle } from './helpers';

// Visual baselines for the two-pane layout at each desktop width, in both
// color schemes. Update on purpose with `npm run test:e2e:update`.

const shot = (page: Page, name: string, width: number, scheme: string) =>
  expect(page).toHaveScreenshot(`${name}-${width}-${scheme}.png`);

for (const viewport of DESKTOPS) {
  for (const scheme of SCHEMES) {
    test.describe(`${viewport.width}px ${scheme}`, () => {
      test.use({ viewport, colorScheme: scheme });
      const { width } = viewport;

      test.beforeEach(async ({ page }) => {
        await openApp(page, scheme);
      });

      test('nothing selected', async ({ page }) => {
        await shot(page, 'desktop-empty', width, scheme);
      });

      test('Waltz, Back Lock open', async ({ page }) => {
        await filterByDance(page, FIGURE.dance);
        await openFigure(page, FIGURE.name);
        await shot(page, 'desktop-figure', width, scheme);
      });

      test('settings open', async ({ page }) => {
        await filterByDance(page, FIGURE.dance);
        await openFigure(page, FIGURE.name);
        await openSettings(page);
        await shot(page, 'desktop-settings', width, scheme);
      });

      test('settings, Standard steps page', async ({ page }) => {
        await openSettings(page);
        await page.getByRole('button', { name: /^Standard/ }).click();
        await expect(page.getByRole('heading', { name: 'Standard', level: 2 })).toBeVisible();
        await settle(page);
        await shot(page, 'desktop-settings-standard', width, scheme);
      });

      test('no horizontal scroll', async ({ page }) => {
        await filterByDance(page, FIGURE.dance);
        await openFigure(page, FIGURE.name);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
      });
    });
  }
}
