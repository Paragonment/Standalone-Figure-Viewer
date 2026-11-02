import { expect, test, type Page } from '@playwright/test';
import { DESKTOPS, FIGURE, SCHEMES, filterByDance, openApp, openFigure, openSettings, openShortcuts, settle, turnOnPractice } from './helpers';

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

      test('Practice on, Back Lock open', async ({ page }) => {
        await turnOnPractice(page);
        await filterByDance(page, FIGURE.dance);
        await openFigure(page, FIGURE.name);
        await shot(page, 'desktop-figure-practice-on', width, scheme);
      });

      test('Practice open', async ({ page }) => {
        await turnOnPractice(page);
        await filterByDance(page, FIGURE.dance);
        await openFigure(page, FIGURE.name);
        await page.getByRole('button', { name: 'Practice' }).click();
        await expect(page.getByRole('main', { name: /step 1/i })).toBeVisible();
        await settle(page);
        await shot(page, 'desktop-practice', width, scheme);
      });

      test('settings, Standard steps page', async ({ page }) => {
        await openSettings(page);
        await page.getByRole('button', { name: /^Standard/ }).click();
        await expect(page.getByRole('heading', { name: 'Standard', level: 2 })).toBeVisible();
        await settle(page);
        await shot(page, 'desktop-settings-standard', width, scheme);
      });

      // One width is enough for the dialog.
      if (width === 1440) {
        test('keyboard shortcuts open', async ({ page }) => {
          await filterByDance(page, FIGURE.dance);
          await openFigure(page, FIGURE.name);
          await openShortcuts(page);
          await shot(page, 'desktop-shortcuts', width, scheme);
        });
      }

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

// The tightest chart: every Standard field in Both mode at 1024px. Nothing
// may spill out sideways, neither the page nor the chart's own scroller.
const ALL_STANDARD_FIELDS = ['Feet Positions', 'Alignment', 'Amount of Turn', 'Rise and Fall', 'Footwork', 'CBM', 'Sway'];

for (const scheme of SCHEMES) {
  test.describe(`1024px ${scheme}, all Standard fields`, () => {
    test.use({ viewport: { width: 1024, height: 768 }, colorScheme: scheme });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript((fields) => {
        localStorage.setItem(
          'fv-settings',
          JSON.stringify({ v: 1, role: 'lead', sideBySide: true, partChosen: true, fields: { Standard: fields } }),
        );
      }, ALL_STANDARD_FIELDS);
      await openApp(page, scheme);
      await filterByDance(page, FIGURE.dance);
      await openFigure(page, FIGURE.name);
    });

    test('chart', async ({ page }) => {
      await shot(page, 'desktop-chart-all-fields', 1024, scheme);
    });

    test('no horizontal scroll', async ({ page }) => {
      const overflow = await page.evaluate(() => {
        const chart = document.querySelector('.sc');
        return [
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
          chart ? chart.scrollWidth - chart.clientWidth : -1,
        ];
      });
      expect(overflow).toEqual([0, 0]);
    });
  });
}
