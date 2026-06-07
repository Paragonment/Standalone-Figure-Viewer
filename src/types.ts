export interface DanceStep {
  Dance: string;
  "Figure Name": string;
  Level: string;
  Step: string;
  "Lead Feet Positions": string;
  "Lead Alignment": string;
  "Lead Amount of Turn": string;
  "Lead Rise and Fall": string;
  "Lead Footwork": string;
  "Lead CBM": string;
  "Lead Sway": string;
  "Follow Feet Positions": string;
  "Follow Alignment": string;
  "Follow Amount of Turn": string;
  "Follow Rise and Fall": string;
  "Follow Footwork": string;
  "Follow CBM": string;
  "Follow Sway": string;
  "General Notes": string;
}

export interface FigureGroup {
  dance: string;
  name: string;
  level: string;
  steps: DanceStep[];
  generalNotes: string;
}
