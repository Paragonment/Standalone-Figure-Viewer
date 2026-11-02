import { readFileSync } from 'node:fs';
import Papa from 'papaparse';
import { describe, expect, it } from 'vitest';
import type { FigureGroup } from '../types';
import {
  figureRoute,
  formatRoute,
  homeRoute,
  linkTo,
  matchSlugs,
  parseRoute,
  resolveRoute,
  slugify,
  unslug,
  type Route,
} from './route';

const figure = (dance: string, name: string): FigureGroup => ({
  style: 'Standard',
  dance,
  name,
  level: 'Bronze',
  steps: [],
  generalNotes: '',
  startingPosition: '',
  endingPosition: '',
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Back Lock')).toBe('back-lock');
    expect(slugify('Pre-Bronze')).toBe('pre-bronze');
    expect(slugify('Cha Cha')).toBe('cha-cha');
  });

  it('turns fractions into digits joined by a hyphen', () => {
    expect(slugify('Whisk When Lead Turns 1/4')).toBe('whisk-when-lead-turns-1-4');
  });

  it('drops parentheses, commas and apostrophes', () => {
    expect(slugify('Reverse Turn (Incorporating Feather Finish)')).toBe('reverse-turn-incorporating-feather-finish');
    expect(slugify('Open Reverse Turn, Follow in Line')).toBe('open-reverse-turn-follow-in-line');
    expect(slugify("Separation with Lady's Caping Walks")).toBe('separation-with-ladys-caping-walks');
  });

  it('spells out an ampersand and folds accents', () => {
    expect(slugify('Cross & Turn')).toBe('cross-and-turn');
    expect(slugify('Café')).toBe('cafe');
  });
});

describe('slugs of the real data', () => {
  const figures = new Map<string, string>();
  for (const file of ['standard.csv', 'latin.csv']) {
    const text = readFileSync(new URL(`../../public/${file}`, import.meta.url), 'utf8');
    for (const row of Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true }).data) {
      figures.set(`${row['Dance']} - ${row['Figure Name']}`, `${slugify(row['Dance'])}/${slugify(row['Figure Name'])}`);
    }
  }

  it('has every figure', () => {
    expect(figures.size).toBeGreaterThan(300);
  });

  it('gives every figure a distinct, non-empty address', () => {
    const slugs = [...figures.values()];
    expect(slugs.every((s) => /^[a-z0-9-]+\/[a-z0-9-]+$/.test(s))).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('survives a round trip through the hash', () => {
    for (const [, slug] of figures) {
      const [dance, name] = slug.split('/');
      const route: Route = { screen: 'figure', dance, figure: name };
      expect(parseRoute(formatRoute(route))).toEqual(route);
    }
  });
});

describe('parseRoute and formatRoute', () => {
  it('reads an empty hash as the list', () => {
    expect(parseRoute('')).toEqual(homeRoute());
    expect(parseRoute('#')).toEqual(homeRoute());
    expect(parseRoute('#/')).toEqual(homeRoute());
    expect(formatRoute(homeRoute())).toBe('#/');
  });

  it('carries filters and the search on the list', () => {
    const route = homeRoute(['Waltz', 'Cha Cha'], ['Pre-Bronze'], 'back lock');
    expect(formatRoute(route)).toBe('#/?dance=waltz,cha-cha&level=pre-bronze&q=back+lock');
    expect(parseRoute(formatRoute(route))).toEqual(route);
  });

  it('keeps awkward search text intact', () => {
    const route = homeRoute([], [], 'a&b=c #1/4?');
    expect(parseRoute(formatRoute(route))).toEqual(route);
  });

  it('reads and writes a figure with its part and step', () => {
    const route = figureRoute({ dance: 'Waltz', name: 'Back Lock' }, { part: 'follow', step: 3 });
    expect(formatRoute(route)).toBe('#/waltz/back-lock?part=follow&step=3');
    expect(parseRoute('#/waltz/back-lock?part=follow&step=3')).toEqual(route);
  });

  it('leaves the first step and a missing part out', () => {
    expect(formatRoute(figureRoute({ dance: 'Waltz', name: 'Back Lock' }, { step: 1 }))).toBe('#/waltz/back-lock');
    expect(parseRoute('#/waltz/back-lock?step=1')).toEqual(figureRoute({ dance: 'Waltz', name: 'Back Lock' }));
  });

  it('reads practice, with a part and without a step', () => {
    expect(parseRoute('#/waltz/back-lock/practice?part=both&step=4')).toEqual({
      screen: 'practice',
      dance: 'waltz',
      figure: 'back-lock',
      part: 'both',
    });
    expect(formatRoute({ screen: 'practice', dance: 'waltz', figure: 'back-lock', part: 'lead' })).toBe(
      '#/waltz/back-lock/practice?part=lead',
    );
  });

  it('ignores a part or step it does not understand', () => {
    expect(parseRoute('#/waltz/back-lock?part=middle&step=abc')).toEqual({
      screen: 'figure',
      dance: 'waltz',
      figure: 'back-lock',
    });
    expect(parseRoute('#/waltz/back-lock?step=2.5')).not.toHaveProperty('step');
    expect(parseRoute('#/waltz/back-lock?step=-3')).not.toHaveProperty('step');
  });

  it('is forgiving about case and escapes', () => {
    expect(parseRoute('#/Waltz/Back%20Lock')).toEqual(figureRoute({ dance: 'Waltz', name: 'Back Lock' }));
    expect(parseRoute('#/waltz/%E0%A4%A')).toMatchObject({ screen: 'figure', dance: 'waltz' });
  });

  it('makes a list of an address that is not a figure', () => {
    expect(parseRoute('#/nowhere')).toEqual({ ...homeRoute(), missing: 'nowhere' });
    expect(parseRoute('#/waltz/back-lock/steps')).toEqual({ ...homeRoute(), missing: 'steps' });
    expect(parseRoute('#/a/b/practice/d')).toEqual({ ...homeRoute(), missing: 'd' });
  });
});

describe('matchSlugs', () => {
  it('maps slugs back to names in the order asked, dropping strangers', () => {
    expect(matchSlugs(['cha-cha', 'nope', 'waltz'], ['Waltz', 'Tango', 'Cha Cha'])).toEqual(['Cha Cha', 'Waltz']);
  });
});

describe('resolveRoute', () => {
  const figures = [figure('Waltz', 'Back Lock'), figure('Quickstep', 'Back Lock')];

  it('finds a figure by dance and name', () => {
    const route = figureRoute(figures[1]);
    expect(resolveRoute(figures, route)).toEqual({ figure: figures[1], screen: 'figure', missing: null });
    expect(resolveRoute(figures, { ...route, screen: 'practice' }).screen).toBe('practice');
  });

  it('falls back to the list, naming what was not found', () => {
    expect(resolveRoute(figures, parseRoute('#/waltz/no-such-figure'))).toEqual({
      figure: null,
      screen: 'home',
      missing: 'no such figure',
    });
    expect(resolveRoute(figures, parseRoute('#/polka/back-lock')).figure).toBeNull();
    expect(resolveRoute(figures, parseRoute('#/nowhere')).missing).toBe('nowhere');
  });

  it('has nothing missing on a plain list', () => {
    expect(resolveRoute(figures, homeRoute())).toEqual({ figure: null, screen: 'home', missing: null });
  });
});

describe('linkTo', () => {
  it('swaps the hash of the current address', () => {
    expect(linkTo('https://x.github.io/app/?a=1#/old', figureRoute({ dance: 'Waltz', name: 'Back Lock' }))).toBe(
      'https://x.github.io/app/?a=1#/waltz/back-lock',
    );
  });
});

describe('unslug', () => {
  it('turns hyphens into spaces', () => {
    expect(unslug('back-lock')).toBe('back lock');
  });
});
