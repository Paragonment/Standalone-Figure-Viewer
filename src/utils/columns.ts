export type ColumnGroup = 'lead' | 'follow' | 'common';

// Figure Name is a structural column DanceTable always renders regardless of
// visibleColumns, so it's never offered as a toggle.
export const ALWAYS_VISIBLE_COLUMNS = ['Figure Name'];

export const getColumnGroup = (header: string): ColumnGroup => {
  if (header.startsWith('Lead ')) return 'lead';
  if (header.startsWith('Follow ')) return 'follow';
  return 'common';
};

const SHORT_HEADER_LABELS: Record<string, string> = {
  'Lead Feet Positions': 'Feet',
  'Follow Feet Positions': 'Feet',
  'Lead Alignment': 'Align',
  'Follow Alignment': 'Align',
  'Lead Amount of Turn': 'Turn',
  'Follow Amount of Turn': 'Turn',
  'Lead Rise and Fall': 'Rise/Fall',
  'Follow Rise and Fall': 'Rise/Fall',
  'Lead Footwork': 'Footwork',
  'Follow Footwork': 'Footwork',
  'Lead CBM': 'CBM',
  'Follow CBM': 'CBM',
  'Lead Sway': 'Sway',
  'Follow Sway': 'Sway',
  'Lead Action': 'Action',
  'Follow Action': 'Action',
  'Timing': 'Count',
  'Beat Value': 'Beat',
  'General Notes': 'Notes',
};

export const getShortHeader = (header: string): string => SHORT_HEADER_LABELS[header] ?? header;
