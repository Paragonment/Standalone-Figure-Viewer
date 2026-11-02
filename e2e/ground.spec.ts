import { expect, test, type Page } from '@playwright/test';
import { DESKTOPS, PHONES, SCHEMES, settle } from './helpers';

// A figure shorter than its window leaves the figure pane part empty. What
// shows there must be the Floor (the content ground), never the Mirror the
// chrome and header sit on.

const SHORT_FIGURE = '#/foxtrot/change-of-direction';

// The ground painted at a point: the first background that is not clear on
// the way up from the element under it.
const groundAt = (page: Page, xRatio: number, fromBottom: number) =>
  page.evaluate(
    ([ratio, inset]) => {
      const pane = document.querySelector('.fig-scroll')!.getBoundingClientRect();
      let el: Element | null = document.elementFromPoint(pane.left + pane.width * ratio, pane.bottom - inset);
      while (el) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        el = el.parentElement;
      }
      return 'none';
    },
    [xRatio, fromBottom],
  );

const floor = (page: Page) => page.locator('.fig-bar').evaluate((el) => getComputedStyle(el).backgroundColor);

for (const viewport of [...DESKTOPS, PHONES[3]]) {
  for (const scheme of SCHEMES) {
    test.describe(`${viewport.width}x${viewport.height} ${scheme}`, () => {
      test.use({ viewport, colorScheme: scheme });

      test('a short figure shows the Floor to the bottom of the pane', async ({ page }) => {
        await page.goto(`/${SHORT_FIGURE}`);
        await expect(page.locator('.fig-title')).toBeVisible();
        await settle(page);
        // The figure is short: on a wide window its pane has nothing to scroll.
        // (The phone's step list always fills the screen, so it may scroll.)
        if (viewport.width > 768) {
          const overflow = await page.locator('.fig-scroll').evaluate((el) => el.scrollHeight - el.clientHeight);
          expect(overflow).toBe(0);
        }
        const expected = await floor(page);
        expect(await groundAt(page, 0.25, 2)).toBe(expected);
        expect(await groundAt(page, 0.9, 2)).toBe(expected);
      });
    });
  }
}
