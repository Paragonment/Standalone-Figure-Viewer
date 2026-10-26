import { useEffect, useState } from 'react';

// Matches the @media (max-width: 768px) breakpoint used throughout the CSS,
// so JS-level behavior (what a tap on a figure row does) and layout agree
// on where "mobile" starts.
const QUERY = '(max-width: 768px)';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};
