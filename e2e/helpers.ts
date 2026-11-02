import { expect, type Locator, type Page } from '@playwright/test';

// Shared navigation for the specs. Everything goes through the UI the way a
// person would use it, so later layouts only need to keep these working.

export type ColorScheme = 'light' | 'dark';
export type Part = 'Lead' | 'Follow' | 'Both';

export interface Viewport {
  width: number;
  height: number;
}

// Common phone widths, smallest to largest.
export const PHONES: Viewport[] = [
  { width: 320, height: 568 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

// Windows past the phone breakpoint, widest first: a large and a small
// laptop, and a tablet in landscape and portrait.
export const DESKTOPS: Viewport[] = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 834, height: 1194 },
];

export const SCHEMES: ColorScheme[] = ['light', 'dark'];

// The figure the visual specs are built around.
export const FIGURE = { dance: 'Waltz', name: 'Back Lock' };

// Waits for something real instead of a timeout: fonts decoded and the
// layout settled (two frames with no change).
export const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
};

// Opens the app and waits until the figure data has loaded and, when a
// scheme is given, the theme has followed the emulated color scheme.
export const openApp = async (page: Page, scheme?: ColorScheme) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Figures', level: 1 })).toBeVisible();
  await expect(page.locator('.fl-row').first()).toBeVisible();
  if (scheme) await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
  // Screenshots must not catch a half-finished transition.
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  await settle(page);
};

export const filterByDance = async (page: Page, dance: string) => {
  // Only the filter buttons are toggles; a breadcrumb may carry the same name.
  const button = page.locator('button[aria-pressed]').and(page.getByRole('button', { name: dance, exact: true }));
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
};

export const searchFor = async (page: Page, query: string) => {
  await page.getByRole('searchbox').fill(query);
};

export const figureRow = (page: Page, name: string): Locator =>
  page.locator('.fl-row').filter({ has: page.locator('.fl-name').getByText(name, { exact: true }) });

export const openFigure = async (page: Page, name: string) => {
  await figureRow(page, name).click();
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
  await settle(page);
};

export const setPart = async (page: Page, part: Part) => {
  const sideBySide = page.getByRole('button', { name: 'Side by side' });
  if (part === 'Both') {
    await sideBySide.click();
    await expect(sideBySide).toHaveAttribute('aria-pressed', 'true');
  } else {
    await page.getByRole('group', { name: 'Part' }).getByRole('button', { name: part }).click();
    await expect(sideBySide).toHaveAttribute('aria-pressed', 'false');
  }
  await settle(page);
};

export const openAbout = async (page: Page) => {
  const toggle = page.getByRole('button', { name: 'About this figure' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await settle(page);
};

export const openPractice = async (page: Page) => {
  await page.getByRole('button', { name: 'Practice' }).click();
  await expect(page.getByRole('button', { name: 'Back to steps' })).toBeVisible();
  await expect(page.getByRole('main')).toHaveAccessibleName(/step 1/i);
  await settle(page);
};

// The slide-over has reached its resting place when the panel stops moving.
const slideOverRests = async (page: Page, dialog: Locator) => {
  await expect(dialog).toBeVisible();
  const panelRight = () =>
    dialog.locator('.slide-page-panel').evaluate((el) => window.innerWidth - el.getBoundingClientRect().right);
  await expect.poll(panelRight).toBe(0);
  await settle(page);
};

export const openSettings = async (page: Page) => {
  await page.getByRole('button', { name: 'Menu' }).click();
  await slideOverRests(page, page.getByRole('dialog', { name: 'Settings' }));
};

// The shortcuts dialog, opened with the key a desktop reader would press.
export const openShortcuts = async (page: Page) => {
  await page.keyboard.press('?');
  await slideOverRests(page, page.getByRole('dialog', { name: 'Keyboard shortcuts' }));
};
