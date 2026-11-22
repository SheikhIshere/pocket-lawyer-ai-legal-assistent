/**
 * B1 document message. Derived from the old MessageBubble (same data contract),
 * with the thinking trace moved above the answer, no bubble for the assistant,
 * a citation strip, and a streaming reveal for the latest answer.
 */
import { memo, useCallback, useEffect, useState } from 'react';
import { Bot, Check, Copy, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { ChainOfThought } from './ChainOfThought';
import { StreamingAnswer } from '../assistant-ui/streaming-answer';

interface StudioMessageProps {
  message: Message;
  animate?: boolean;
  onAnimationDone?: () => void;
  anchor?: { root?: string; thinking?: string; sources?: string };
}

function plainForReveal(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const StudioMessage = memo(function StudioMessage({
  message,
  animate = false,
  onAnimationDone,
  anchor,
}: StudioMessageProps) {
  const isUser = message.role === 'user';
  const text = (isUser ? message.content : message.response || message.content) || '';
  const [revealed, setRevealed] = useState(!animate);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!animate) setRevealed(true);
  }, [animate]);

  const fallbackCopy = useCallback((value: string) => {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    try {
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, value.length);
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }, []);

  const handleCopy = useCallback(async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = fallbackCopy(text);
    if (!ok) {
      console.error('Failed to copy answer');
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [fallbackCopy, text]);

  const handleRevealDone = useCallback(() => {
    setRevealed(true);
    onAnimationDone?.();
  }, [onAnimationDone]);

  const time = new Date(message.timestamp ?? Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <article id={anchor?.root} className="mb-9">
        <div className="ml-auto max-w-[85%] text-right">
          <div className="mb-1.5 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <User size={11} />
            You
          </div>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">{text}</p>
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground">{time}</div>
        </div>
      </article>
    );
  }

  return (
    <article id={anchor?.root} className="mb-10 border-b border-border/60 pb-8 last:border-0">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-600 text-white">
          <Bot size={12} />
        </span>
        Pocket Lawyer AI
      </div>

      {message.trace && message.trace.length > 0 && (
        <div id={anchor?.thinking} className="mb-4">
          <ChainOfThought records={message.trace} defaultOpen={false} />
        </div>
      )}

      {message.status === 'failed' && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {message.error || 'Response generation failed'}
        </p>
      )}

      {animate && !revealed ? (
        <StreamingAnswer text={plainForReveal(text)} onDone={handleRevealDone} />
      ) : (
        <div className="prose prose-base max-w-none text-[15px] leading-7 text-foreground dark:prose-invert prose-headings:font-semibold prose-p:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-teal-700 dark:prose-a:text-teal-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}

      {message.sources && message.sources.length > 0 && (!animate || revealed) && (
        <div id={anchor?.sources} className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Sources
          </span>
          {message.sources.map((source, index) => {
            const label = source.citation || `S${index + 1}`;
            const title = source.document_title || 'Legal source';
            const detail = source.section_label || '';
            const href = source.source_url && /^(https?:\/\/|\/)/i.test(source.source_url)
              ? source.source_url
              : undefined;
            const content = (
              <>
                <span className="font-mono text-[10px] text-teal-700 dark:text-teal-400">[{label}]</span>
                <span className="max-w-[220px] truncate font-medium">{title}</span>
                {detail && <span className="max-w-[160px] truncate text-muted-foreground">{detail}</span>}
              </>
            );
            return href ? (
              <a
                key={source.id || index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-teal-500/50 hover:text-teal-300"
              >
                {content}
              </a>
            ) : (
              <span
                key={source.id || index}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-foreground"
              >
                {content}
              </span>
            );
          })}
        </div>
      )}

      {(!animate || revealed) && <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span>{time}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md p-1.5 transition-colors hover:bg-muted hover:text-foreground"
          title={copied ? 'Copied' : 'Copy answer'}
          aria-label={copied ? 'Copied' : 'Copy answer'}
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
        </button>
      </div>}
    </article>
  );
}, (previous, next) => (
  previous.message.id === next.message.id &&
  previous.message.response === next.message.response &&
  previous.message.content === next.message.content &&
  previous.message.status === next.message.status &&
  previous.animate === next.animate &&
  JSON.stringify(previous.anchor) === JSON.stringify(next.anchor) &&
  JSON.stringify(previous.message.sources) === JSON.stringify(next.message.sources) &&
  JSON.stringify(previous.message.trace) === JSON.stringify(next.message.trace)
));
