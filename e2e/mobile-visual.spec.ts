import { expect, test, type Page } from '@playwright/test';
import {
  FIGURE,
  PHONES,
  SCHEMES,
  filterByDance,
  openAbout,
  openApp,
  openFigure,
  openPractice,
  openSettings,
  setPart,
} from './helpers';

// Visual baselines for the phone layout: every state, at each phone width,
// in both color schemes. Update on purpose with `npm run test:e2e:update`.

const shot = (page: Page, name: string, width: number, scheme: string) =>
  expect(page).toHaveScreenshot(`${name}-${width}-${scheme}.png`);

for (const viewport of PHONES) {
  for (const scheme of SCHEMES) {
    test.describe(`${viewport.width}px ${scheme}`, () => {
      test.use({ viewport, colorScheme: scheme });
      const { width } = viewport;

      test.beforeEach(async ({ page }) => {
        await openApp(page, scheme);
      });

      test('home', async ({ page }) => {
        await shot(page, 'home', width, scheme);
      });

      test('home filtered to Waltz', async ({ page }) => {
        await filterByDance(page, FIGURE.dance);
        await shot(page, 'home-waltz', width, scheme);
      });

      test.describe('figure', () => {
        test.beforeEach(async ({ page }) => {
          await filterByDance(page, FIGURE.dance);
          await openFigure(page, FIGURE.name);
        });

        test('lead', async ({ page }) => {
          await shot(page, 'figure-lead', width, scheme);
        });

        test('follow', async ({ page }) => {
          await setPart(page, 'Follow');
          await shot(page, 'figure-follow', width, scheme);
        });

        test('both', async ({ page }) => {
          await setPart(page, 'Both');
          await shot(page, 'figure-both', width, scheme);
        });

        test('about open', async ({ page }) => {
          await openAbout(page);
          await shot(page, 'figure-about', width, scheme);
        });

        test('practice', async ({ page }) => {
          await openPractice(page);
          await shot(page, 'practice', width, scheme);
        });

        test('settings', async ({ page }) => {
          await openSettings(page);
          await shot(page, 'settings', width, scheme);
        });
      });
    });
  }
}
