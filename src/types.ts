// The two technique books chart different attributes per step (Standard
// has Rise and Fall, CBM and Sway; Latin has Action; both chart Timing
// and Beat Value), so a row is any set of CSV columns plus the four every
// style shares. A column a style doesn't chart is simply absent from its
// rows.
export type DanceStep = Record<string, string> & {
  Dance: string;
  "Figure Name": string;
  Level: string;
  Step: string;
};

export type DanceStyle = 'Standard' | 'Latin';

// Which part of the couple the reader dances.
export type Role = 'lead' | 'follow';

// Which way a link points: the linked figure is danced before this one
// ("Preceded By") or after it ("Followed By").
export type Relation = 'Preceded By' | 'Followed By';

// One figure the book lists before or after another, from a style's
// transitions CSV (one row per link).
export interface FigureLink {
  relation: Relation;
  // The first level the book lists the link at; empty when it doesn't grade it.
  level: string;
  // When the link applies, in the book's words ("At corner", "If ended DC").
  condition: string;
  // This figure's own steps the link joins: the steps danced before the
  // follower, or the steps entered from the preceder. Empty for all of them.
  steps: string;
  // The figure linked to, by name. Usually a charted figure of the same
  // dance; empty when the book names a group ("Any Natural figure").
  linkedFigure: string;
  // The linked figure's steps used, e.g. "4-6". Empty for all of them.
  linkedSteps: string;
  // "As for Natural Turn": this list includes that figure's list.
  sameAs: string;
  // The book's wording for this case, read after the linked figure's name,
  // or the whole entry when there is no linked figure.
  details: string;
}

export interface FigureGroup {
  style: DanceStyle;
  dance: string;
  name: string;
  level: string;
  steps: DanceStep[];
  generalNotes: string;
  startingPosition: string;
  endingPosition: string;
  // The figure's own Precede and Follow lists, as charted.
  links: FigureLink[];
}
