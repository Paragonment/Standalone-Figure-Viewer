import type { FigureGroup } from '../../types';
import { useFigureScroll } from '../../hooks/useFigureScroll';
import { figureKey } from '../../utils/figureKey';
import TopBar from '../ui/TopBar';
import PracticeButton from '../ui/PracticeButton';
import FigureBody from './FigureBody';

export interface FigureScreenProps {
  figure: FigureGroup;
  onBack(): void;
  onPractice(): void;
}

// The mobile screen of an open figure: the top bar over the figure body.
function FigureView({ figure, onBack, onPractice }: FigureScreenProps) {
  const scroll = useFigureScroll();

  return (
    <>
      <TopBar
        backLabel="Figures"
        onBack={onBack}
        title={figure.name}
        titleVisible={scroll.scrolled}
        showBackLabel={!scroll.scrolled}
        ruleVisible={scroll.scrolled}
        styleHint={figure.style}
        action={<PracticeButton onClick={onPractice} />}
      />
      <FigureBody figure={figure} scroll={scroll} />
    </>
  );
}

// Keyed by figure so scroll position and the About band start fresh.
export default function FigureScreen(props: FigureScreenProps) {
  const { figure } = props;
  return <FigureView key={figureKey(figure)} {...props} />;
}
