import { createContext } from 'react';
import type { TransitionBook } from '../utils/transitions';

// The loaded figures' Precede and Follow lists, built per figure on first
// use. Provided by ViewerContainer once the data is in.
export const TransitionsContext = createContext<TransitionBook | null>(null);
