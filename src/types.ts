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

export interface FigureGroup {
  style: DanceStyle;
  dance: string;
  name: string;
  level: string;
  steps: DanceStep[];
  generalNotes: string;
  startingPosition: string;
  endingPosition: string;
}
