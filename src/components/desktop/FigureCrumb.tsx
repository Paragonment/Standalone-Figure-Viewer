import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { RowChevronIcon } from '../ui/Icons';
import './FigureCrumb.css';

interface FigureCrumbProps {
  figure: FigureGroup;
  filters: ReturnType<typeof useDanceFilters>;
}

// "Waltz > Bronze": where the figure sits, each part a shortcut that sets
// the list's filters to it.
export default function FigureCrumb({ figure, filters }: FigureCrumbProps) {
  const { setSelectedDances, setSelectedLevels } = filters;

  const showDance = () => {
    setSelectedDances([figure.dance]);
    setSelectedLevels([]);
  };
  const showLevel = () => {
    setSelectedDances([figure.dance]);
    setSelectedLevels([figure.level]);
  };

  return (
    <nav className="fc" aria-label="Breadcrumb">
      <button type="button" className="fv-act" onClick={showDance}>
        {figure.dance}
      </button>
      <RowChevronIcon size={14} className="fc-sep" />
      <button type="button" className="fv-act" onClick={showLevel}>
        {figure.level}
      </button>
    </nav>
  );
}
