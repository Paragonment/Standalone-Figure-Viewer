import { describe, expect, it } from 'vitest';
import Papa from 'papaparse';
import standardCsv from '../../public/standard.csv?raw';
import latinCsv from '../../public/latin.csv?raw';
import type { DanceStep, FigureGroup } from '../types';
import { groupFigures } from './figureGroups';
import { linkFigures } from './figureLinks';

const fig = (name: string, dance = 'Waltz'): FigureGroup => ({
  style: 'Standard',
  dance,
  name,
  level: 'Bronze',
  steps: [],
  generalNotes: '',
  startingPosition: '',
  endingPosition: '',
});

const waltz = [
  'Natural Turn',
  'Natural Spin Turn',
  'Natural Turn with Hesitation',
  'Reverse Turn',
  'Back Lock',
  'Progressive Chasse to Right',
  'Closed Impetus',
  'Whisk',
  'Left Whisk',
  'Outside Spin',
].map((name) => fig(name));

// "[[name]]" marks a link, the rest is plain.
const marked = (text: string, figures = waltz, self?: FigureGroup) =>
  linkFigures(text, figures, self)
    .map((s) => (s.figure ? `[[${s.text}]]` : s.text))
    .join('');

describe('linkFigures', () => {
  it('links a name and leaves the rest of the sentence', () => {
    expect(marked('Precede: Bronze - Natural Turn, 4-6 Natural Turn after Back Lock.')).toBe(
      'Precede: Bronze - [[Natural Turn]], 4-6 [[Natural Turn]] after [[Back Lock]].',
    );
  });

  it('keeps "4-6" and the level prefixes as text', () => {
    const segments = linkFigures('Silver, Gold - 4-6 Reverse Turn', waltz);
    expect(segments.map((s) => s.text)).toEqual(['Silver, Gold - 4-6 ', 'Reverse Turn']);
    expect(segments[1].figure?.name).toBe('Reverse Turn');
  });

  it('prefers the longest name', () => {
    expect(marked('Natural Spin Turn, Natural Turn with Hesitation or Natural Turn')).toBe(
      '[[Natural Spin Turn]], [[Natural Turn with Hesitation]] or [[Natural Turn]]',
    );
    expect(marked('Left Whisk or Whisk')).toBe('[[Left Whisk]] or [[Whisk]]');
  });

  it('points each link at the right figure', () => {
    const names = linkFigures('Natural Spin Turn then Natural Turn', waltz)
      .filter((s) => s.figure)
      .map((s) => s.figure?.name);
    expect(names).toEqual(['Natural Spin Turn', 'Natural Turn']);
  });

  it('needs whole words and the right case', () => {
    expect(marked('Whiskey, Backlock, Back Locks, natural turn, Reverse Turns')).toBe(
      'Whiskey, Backlock, Back Locks, natural turn, Reverse Turns',
    );
    expect(marked('(Back Lock)/Whisk;Closed Impetus.')).toBe('([[Back Lock]])/[[Whisk]];[[Closed Impetus]].');
  });

  it('never links a figure to itself', () => {
    expect(marked('Natural Turn after Back Lock', waltz, waltz[0])).toBe('Natural Turn after [[Back Lock]]');
  });

  it('reads the books\' "to R" as "to Right", both ways', () => {
    expect(marked('after Back Lock or Progressive Chasse to R')).toBe('after [[Back Lock]] or [[Progressive Chasse to R]]');
    expect(marked('Progressive Chasse to Right')).toBe('[[Progressive Chasse to Right]]');
    expect(marked('Progressive Chasse to Rotate')).toBe('Progressive Chasse to Rotate');
    expect(marked('then Spot Turn to Left', [fig('Spot Turn to L', 'Rumba')])).toBe('then [[Spot Turn to Left]]');
  });

  it('reads a name without its parenthesis', () => {
    const foxtrot = [fig('Reverse Turn (Incorporating Feather Finish)', 'Foxtrot')];
    expect(marked('Follow: Reverse Turn', foxtrot)).toBe('Follow: [[Reverse Turn]]');
  });

  it('does not guess between two figures that share a short form', () => {
    const quickstep = [fig('Tipple Chasse to Right (At Corner)'), fig('Tipple Chasse to Right (Along Side of Room)')];
    expect(marked('after Tipple Chasse to Right', quickstep)).toBe('after Tipple Chasse to Right');
    expect(marked('Tipple Chasse to Right (At Corner)', quickstep)).toBe('[[Tipple Chasse to Right (At Corner)]]');
  });

  it('leaves a position that shares a figure\'s name alone', () => {
    const rumba = [fig('Fan', 'Rumba'), fig('Hockey Stick', 'Rumba')];
    expect(marked('ends in Fan Position, then Fan or Hockey Stick', rumba)).toBe(
      'ends in Fan Position, then [[Fan]] or [[Hockey Stick]]',
    );
  });

  it('returns the text whole when there is nothing to link', () => {
    expect(linkFigures('', waltz)).toEqual([]);
    expect(linkFigures('Any figure', waltz)).toEqual([{ text: 'Any figure' }]);
    expect(linkFigures('Back Lock', [])).toEqual([{ text: 'Back Lock' }]);
  });
});

describe('the books\' notes', () => {
  const parse = (csv: string) => Papa.parse<DanceStep>(csv, { header: true, skipEmptyLines: true }).data;
  const figures = groupFigures([
    { style: 'Standard', rows: parse(standardCsv) },
    { style: 'Latin', rows: parse(latinCsv) },
  ]);
  const ofDance = (dance: string) => figures.filter((f) => f.dance === dance);

  it('joins back into the notes, with no self, cross-dance or overlapping link', () => {
    const problems: string[] = [];
    figures.forEach((figure) => {
      const segments = linkFigures(figure.generalNotes, ofDance(figure.dance), figure);
      if (segments.map((s) => s.text).join('') !== figure.generalNotes) problems.push(`${figure.name}: text changed`);
      segments.forEach((s) => {
        if (!s.figure) return;
        if (s.figure.dance !== figure.dance) problems.push(`${figure.name}: links across dances`);
        if (s.figure.name === figure.name) problems.push(`${figure.name}: links to itself`);
        if (s.text === '') problems.push(`${figure.name}: empty link`);
      });
      // Adjacent links would mean two names ran into each other.
      segments.forEach((s, i) => {
        if (s.figure && segments[i + 1]?.figure) problems.push(`${figure.name}: "${s.text}" touches the next link`);
      });
    });
    expect(problems).toEqual([]);
  });

  it('never splits a longer figure name into a shorter one', () => {
    const problems: string[] = [];
    figures.forEach((figure) => {
      const same = ofDance(figure.dance);
      const segments = linkFigures(figure.generalNotes, same, figure);
      segments.forEach((s, i) => {
        if (!s.figure) return;
        // The text right after a link must not continue a longer figure name that started with it.
        const rest = segments
          .slice(i + 1)
          .map((t) => t.text)
          .join('');
        same.forEach((other) => {
          if (other.name.length > s.text.length && other.name.startsWith(s.text) && rest.startsWith(other.name.slice(s.text.length))) {
            if (other.name !== s.figure?.name && other !== figure) problems.push(`${figure.name}: "${s.text}" inside "${other.name}"`);
          }
        });
      });
    });
    expect(problems).toEqual([]);
  });

  it('links the notes of nearly every figure', () => {
    const linked = figures.filter((f) => linkFigures(f.generalNotes, ofDance(f.dance), f).some((s) => s.figure));
    expect(linked.length / figures.length).toBeGreaterThan(0.9);
  });

  it('links the real notes of Closed Change Natural to Reverse', () => {
    const figure = figures.find((f) => f.dance === 'Waltz' && f.name === 'Closed Change Natural to Reverse');
    if (!figure) throw new Error('missing figure');
    const linked = linkFigures(figure.generalNotes, ofDance('Waltz'), figure)
      .filter((s) => s.figure)
      .map((s) => s.text);
    expect(linked).toEqual(expect.arrayContaining(['Natural Turn', 'Back Lock', 'Progressive Chasse to R', 'Outside Spin']));
  });
});
