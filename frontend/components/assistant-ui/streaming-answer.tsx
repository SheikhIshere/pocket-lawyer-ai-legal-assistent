/**
 * Copied from the element library: Beautiful UI "Streaming Text" (#527).
 * The reveal loop is the original component's logic; the action row, source
 * strip and follow-ups were deleted because this app already owns those.
 *
 * Source: tools/App/tools/element_library (element 527)
 */
import { useEffect, useMemo, useRef, useState } from 'react';

interface StreamingAnswerProps {
  text: string;
  onDone?: () => void;
}

const WORD_MS = 55;
const MAX_REVEAL_MS = 1800;

export function StreamingAnswer({ text, onDone }: StreamingAnswerProps) {
  const tokens = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const reduceMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
  }, [text]);

  useEffect(() => {
    if (reduceMotion) {
      setCount(tokens.length);
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    if (count >= tokens.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    const step = Math.max(8, Math.min(WORD_MS, MAX_REVEAL_MS / Math.max(tokens.length, 1)));
    const timer = setTimeout(() => setCount((current) => current + 1), step);
    return () => clearTimeout(timer);
  }, [count, tokens.length, reduceMotion]);

  const done = count >= tokens.length;

  return (
    <p className="text-[15px] leading-7 tracking-normal text-foreground">
      {tokens.slice(0, count).map((word, index) => {
        const fresh = !done && index >= count - 2;
        return (
          <span
            key={`${index}-${word}`}
            className={`transition-colors duration-700 ${fresh ? 'text-indigo-400' : 'text-foreground'}`}
          >
            {word}{' '}
          </span>
        );
      })}
      {!done && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse rounded-full bg-indigo-400"
        />
      )}
    </p>
  );
}
