// Checks the shipped transitions CSVs against the figure CSVs, so an edit
// that breaks a link fails here instead of quietly dropping it in the app.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import { describe, expect, it } from 'vitest';
import { DANCE_STYLES } from './danceStyles';
import { readTransitionRows } from './transitions';

// Figures the books name in their lists that have no chart of their own here.
const UNCHARTED: Record<string, string[]> = {
  Waltz: ['Wing', 'Cross Hesitation', 'Open Telemark', 'Open Impetus'],
  Foxtrot: ['Feather Finish', 'Feather Ending', 'Heel Pull', 'Open Telemark', 'Outside Swivel'],
  Tango: ['Walk on LF', 'Walk on RF', 'Walk back on LF', 'Closed Finish', 'Reverse Promenade Link'],
  Samba: ['Samba Walks in RSP', 'Samba Walks in Shadow'],
  Rumba: ['Switch Turn'],
  'Paso Doble': ['Elevations'],
};

const STEPS = /^\d+(-\d+)?$/;
const LEVELS = ['', 'Bronze', 'Silver', 'Gold'];

const read = (file: string) => {
  const parsed = Papa.parse<Record<string, string>>(readFileSync(resolve('public', file), 'utf8'), { header: true, skipEmptyLines: true });
  expect(parsed.errors).toEqual([]);
  return parsed;
};

describe.each(DANCE_STYLES)('$label transitions', ({ dataFile, transitionsFile }) => {
  const figures = read(dataFile).data;
  const charted = new Set(figures.map((r) => `${r.Dance}|${r['Figure Name']}`));
  const parsed = read(transitionsFile);
  const records = readTransitionRows(parsed.data, parsed.meta.fields ?? [], transitionsFile);

  it('has rows', () => {
    expect(records.length).toBeGreaterThan(0);
  });

  it.each(records.map((r, i) => [i + 2, r] as const))('row %i is a valid link', (_row, { dance, figure, link }) => {
    expect(charted.has(`${dance}|${figure}`), `${figure} is a charted ${dance} figure`).toBe(true);
    expect(LEVELS).toContain(link.level);
    if (link.steps) expect(link.steps).toMatch(STEPS);
    if (link.linkedSteps) expect(link.linkedSteps).toMatch(STEPS);
    if (link.sameAs) {
      expect(charted.has(`${dance}|${link.sameAs}`), `As for ${link.sameAs}`).toBe(true);
      expect(link.linkedFigure + link.linkedSteps + link.steps + link.details).toBe('');
    } else {
      expect(link.linkedFigure || link.details, 'names a figure or says what it is').not.toBe('');
    }
    if (link.linkedFigure) {
      const known = charted.has(`${dance}|${link.linkedFigure}`) || (UNCHARTED[dance] ?? []).includes(link.linkedFigure);
      expect(known, `${link.linkedFigure} is charted or a known uncharted ${dance} figure`).toBe(true);
    }
    if (link.linkedSteps) expect(link.linkedFigure).not.toBe('');
  });

  it('leaves no Precede or Follow lists in General Notes', () => {
    const listed = figures.filter((r) => /(?:^|[.;]\s)(?:Precedes?|Follows?)(?:\s[^:.]{0,40})?:\s+(?!\d+\/\d+)/.test(r['General Notes'] ?? ''));
    expect(listed.map((r) => `${r.Dance}|${r['Figure Name']}`)).toEqual([]);
  });
});
