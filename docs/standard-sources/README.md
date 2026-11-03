# Standard figure sources

`public/standard.csv` holds the Standard figures for Waltz, Foxtrot, Quickstep and Tango:
129 figures, 654 steps, with Timing and Beat Value on every step.

## Source

Every chart was transcribed from the scan in the repository root,
[`The Ballroom Technique-1.pdf`](../../The%20Ballroom%20Technique-1.pdf): the ISTD Ballroom
Branch's "The Ballroom Technique", 10th edition (April 1982, reprinted with amendments
July 1994). The book's PDF pages hold the dances as follows (each PDF page is two book pages):

| Dance | PDF pages | Additional figures |
| --- | --- | --- |
| Waltz | 5-23 | Drag Hesitation, Fallaway Whisk (66-69) |
| Foxtrot | 24-38 | |
| Quickstep | 38-50 | Heel Pivot, Zig-Zag Back Lock and Running Finish, Cross Chasse, Change of Direction (66-68) |
| Tango | 50-65 | |

No online copy of the book could be found. The one usable derivative,
[Ballroom Guide](http://dance.djurredeboer.nl), is a community re-chart of a later syllabus.
Ten figures were compared with it. Where it differs (Feather Step, Forward Lock, Tipple
Chasse and Natural Weave each charted one step short; the Lead's Double Reverse Spin given
4 steps; Tango Closed Promenade and Natural Twist Turn details), the scan was checked and
the CSV follows the scan.

## Method

Each slice of the book was transcribed twice, independently, from the page images. The two
copies were compared cell by cell. After normalising punctuation they agreed on almost every
cell. Every remaining difference was settled against the page image.

## Conventions

- **Levels:** the book's Student Teacher, Associate, Licentiate and Fellow sections are
  Pre-Bronze, Bronze, Silver and Gold. A figure is listed at the first level it appears in.
  The Waltz Whisk turning 1/4 is on the Licentiate page, but it is marked "A" (at a corner),
  so it is Bronze.
- **Timing:** Waltz is 3/4, counted 1, 2, 3 and "&", with one beat a step unless the book
  says otherwise. Foxtrot and Quickstep are 4/4, with S = 2 beats and Q = 1. Tango is 2/4,
  with S = 1 beat and Q = 1/2. Where the book gives a Beat Value line, it is used as printed.
  Many figures end part way through a bar, so their length in bars is fractional.
- **Alternatives:** where the book offers a second timing or sway, the first is charted and
  the alternative is given in General Notes.
- **Sway:** S, L, R or Nil per step. Tango charts no sway.
- **CBM:** true, false or Slight.
- **Amount of Turn:** a turn "between 1-2" goes on step 2, matching the book's charted
  dances. Where the Tango charts give one total with no step named, it is in General Notes.
- **Notes:** the book's notes are on step 1. Man and Lady are written as Lead and Follow.
- **Precede and Follow:** the book's lists, graded by level, are in
  `public/standard-transitions.csv`, one link per row (see the main README).

## Figures charted by reference

Where the book refers to another chart instead of printing one, the steps were built from
the chart it names. General Notes say so on each figure:

- **Quickstep Forward Lock and Back Lock** are single "Man or Lady" charts. The partner of
  whoever locks forward dances the Back Lock, so each figure pairs the two charts. The Waltz
  Back Lock and the Quickstep V6 (steps 9-12) are built the same way.
- **Quickstep** Natural Spin Turn, Closed Impetus, Reverse Pivot, Progressive Chasse to
  Right, Double Reverse Spin, Closed Telemark and Natural Turn with Hesitation use the Waltz
  charts with Quickstep timing.
- **Foxtrot** Closed Telemark and Open Impetus use the Waltz charts.
- **Foxtrot Natural Twist Turn** is completed with the Hover Feather the book names. Its
  Natural Weave, Closed Impetus and Open Impetus endings use those figures' charts. Where
  the book prints only feet and alignment (Natural Weave Ending, Lead steps 4-6 and Follow
  steps 5-6), the other cells are left empty rather than guessed.
- **Tango Natural Promenade Turn Following the Fallaway Promenade:** the book prints only
  its alignments. Feet, footwork and CBM are as the Natural Promenade Turn.
- **Double Reverse Spin** (Waltz and Quickstep): the Lead dances 3 steps and the Follow 4.
  The Lead's Toe Pivot on step 3 lasts through the Follow's steps 3 and 4, so the Lead
  cells of step 4 are empty.

Prose-only variations are kept in notes, not given invented rows. These are Tango Outside
Swivel Method 4 (in Method 3), the Oversway and Chase endings, and the Waltz Hover Corte
extra-bar version.

## Changes from the previous data

The previous `standard.csv` had 102 figures and no timing. Besides adding Timing, Beat Value
and 27 figures (among them Quickstep Natural Spin Turn, Closed Impetus, Reverse Pivot and
Double Reverse Spin; the Waltz Whisk variants and Back Lock; Foxtrot Open Impetus and the
Natural Twist Turn endings; Tango Rock Back on LF and Outside Swivel Method 2), the
transcription corrected:

- **Levels:** for example, Quickstep Tipple Chasse (Gold to Bronze); Waltz Basic Weave
  (Silver to Bronze) and Reverse Pivot (Gold to Bronze); Tango Natural Twist Turn (Gold to
  Bronze) and Natural Promenade Turn (Silver to Bronze); Foxtrot Hover Cross and Reverse
  Wave (Gold to Silver) and Natural Weave (Gold to Bronze).
- **Misaligned cells:** rise and fall or amount of turn sat on the wrong step, for example
  "Up. Lower e/o 4" on step 3 of the Quickstep Quarter Turn to Right.
- **Sway:** some cells read Nil where the book prints S, L or R.
- **Truncated cells**, and amount-of-turn cells merged with other text.

## Open questions

These are worth a look against a cleaner copy of the book:

- **Quickstep Hover Corte**, Follow step 2 alignment: an ink blot covers "end" (probably
  "and") in "Facing centre end facing DC against LOD".
- **Quickstep Four Quick Run**, Lead footwork: printed "3 T; 4; T; 5 T; 6; TH" and read as
  4 T, 6 TH.
- **Tango Natural Promenade Turn Following the Fallaway Promenade:** it is charted as
  Silver from the L and F letters beside its title.
