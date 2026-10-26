import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { DanceStep } from '../types';

export const useDanceData = () => {
  const [data, setData] = useState<DanceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Resolve against the app's base path, not the domain root: GitHub
        // Pages serves the app from /Standalone-Figure-Viewer/, where
        // "/data.csv" is a 404.
        const response = await fetch(`${import.meta.env.BASE_URL}data.csv`);
        // Without this, an error page would be parsed as CSV and render as
        // an empty table instead of an error.
        if (!response.ok) {
          throw new Error(`data.csv request failed (${response.status} ${response.statusText})`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as DanceStep[]);
            setLoading(false);
          },
          error: (err: Error) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
