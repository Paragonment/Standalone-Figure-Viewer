export type ColumnGroup = 'lead' | 'follow' | 'common';

// Figure Name is a structural column DanceTable always renders regardless of
// visibleColumns, so it's never offered as a toggle.
export const ALWAYS_VISIBLE_COLUMNS = ['Figure Name'];

export const getColumnGroup = (header: string): ColumnGroup => {
  if (header.startsWith('Lead ')) return 'lead';
  if (header.startsWith('Follow ')) return 'follow';
  return 'common';
};
