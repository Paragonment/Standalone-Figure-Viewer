import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { DanceStep, DanceStyle } from '../types';
import { DANCE_STYLES } from '../utils/danceStyles';

export interface DanceDataset {
  style: DanceStyle;
  rows: DanceStep[];
  // In CSV order, so column controls list a style's fields the way its
  // book charts them.
  columns: string[];
}

const loadDataset = async (style: DanceStyle, file: string): Promise<DanceDataset> => {
  // Resolve against the app's base path, not the domain root: GitHub
  // Pages serves the app from /Standalone-Figure-Viewer/, where
  // "/standard.csv" is a 404.
  const response = await fetch(`${import.meta.env.BASE_URL}${file}`);
  // Without this, an error page would be parsed as CSV and render as
  // an empty table instead of an error.
  if (!response.ok) {
    throw new Error(`${file} request failed (${response.status} ${response.statusText})`);
  }
  const csvText = await response.text();
  const results = Papa.parse<DanceStep>(csvText, { header: true, skipEmptyLines: true });
  if (results.errors.length > 0) {
    const first = results.errors[0];
    throw new Error(`${file} row ${first.row}: ${first.message}`);
  }
  return { style, rows: results.data, columns: results.meta.fields ?? [] };
};

export const useDanceData = () => {
  const [datasets, setDatasets] = useState<DanceDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(DANCE_STYLES.map((s) => loadDataset(s.id, s.dataFile)))
      .then(setDatasets)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch data'))
      .finally(() => setLoading(false));
  }, []);

  return { datasets, loading, error };
};
