import { useEffect, useRef, useState } from 'react';

// How long the answer stays in place of the action.
const ANSWER_MS = 2000;

type Answer = 'copied' | 'failed' | null;

const TEXT: Record<Exclude<Answer, null>, string> = {
  copied: 'Copied',
  failed: 'Could not copy',
};

const ANNOUNCEMENT: Record<Exclude<Answer, null>, string> = {
  copied: 'Link copied',
  failed: 'Could not copy the link',
};

// "Copy link": puts the address `getUrl` makes on the clipboard and says so in
// place for a moment, to the eye and to a screen reader.
export default function CopyLink({ getUrl }: { getUrl(): string }) {
  const [answer, setAnswer] = useState<Answer>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let next: Answer = 'copied';
    try {
      await navigator.clipboard.writeText(getUrl());
    } catch {
      // No clipboard here (an insecure page) or permission was refused.
      next = 'failed';
    }
    setAnswer(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAnswer(null), ANSWER_MS);
  };

  return (
    <>
      <button type="button" className="fv-act" onClick={copy}>
        {answer ? TEXT[answer] : 'Copy link'}
      </button>
      <span role="status" className="fv-sr-only">
        {answer && ANNOUNCEMENT[answer]}
      </span>
    </>
  );
}
