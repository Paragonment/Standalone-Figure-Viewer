// The two technique books chart different attributes per step (Standard
// has Rise and Fall, CBM and Sway; Latin has Timing, Beat Value and
// Action), so a row is any set of CSV columns plus the four every style
// shares. A column a style doesn't chart is simply absent from its rows.
export type DanceStep = Record<string, string> & {
  Dance: string;
  "Figure Name": string;
  Level: string;
  Step: string;
};

export type DanceStyle = 'Standard' | 'Latin';

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
