import { useMemo } from 'react';
import type { FigureGroup } from '../types';
import { groupFigures } from '../utils/figureGroups';
import type { DanceDataset } from './useDanceData';

export const useFigureGroups = (datasets: DanceDataset[]): FigureGroup[] =>
  useMemo(() => groupFigures(datasets), [datasets]);
