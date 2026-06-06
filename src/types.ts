export interface DanceStep {
  Dance: string;
  "Figure Name": string;
  Step: string;
  "Man Feet Positions": string;
  "Man Alignment": string;
  "Man Amount of Turn": string;
  "Man Rise and Fall": string;
  "Man Footwork": string;
  "Man CBM": string;
  "Man Sway": string;
  "Lady Feet Positions": string;
  "Lady Alignment": string;
  "Lady Amount of Turn": string;
  "Lady Rise and Fall": string;
  "Lady Footwork": string;
  "Lady CBM": string;
  "Lady Sway": string;
  "General Notes": string;
}

export interface FigureGroup {
  dance: string;
  name: string;
  steps: DanceStep[];
  generalNotes: string;
}
