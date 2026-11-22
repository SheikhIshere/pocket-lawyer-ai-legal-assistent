/**
 * B1 outline panel (230px). Derived from the old ChatSidebar's thread list,
 * plus the document contents (question / answer / thinking / sources).
 */
import { useMemo, useState } from 'react';
import {
  BookOpen,
  FileText,
  MessageCircleQuestion,
  MessagesSquare,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ChatSession } from '../../types';

interface StudioOutlineProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  title: string;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  isSending?: boolean;
  contents: {
    question: boolean;
    answer: boolean;
    thinking: boolean;
    sources: number;
  };
  onJump: (target: 'question' | 'answer' | 'thinking' | 'sources') => void;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function StudioOutline({
  sessions,
  currentSessionId,
  title,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onCloseMobile,
  isSending = false,
  contents,
  onJump,
}: StudioOutlineProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => sessions.filter((session) =>
      (session.title || '').toLowerCase().includes(query.toLowerCase()),
    ),
    [sessions, query],
  );

  const jump = (target: 'question' | 'answer' | 'thinking' | 'sources') => {
    onJump(target);
    onCloseMobile();
  };

  const rowClass =
    'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-[280px] transform flex-col border-r border-border bg-card
        transition-transform duration-300 lg:relative lg:z-0 lg:w-[230px] lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Contents</div>
            <div className="mt-0.5 max-w-[190px] truncate text-[13px] font-semibold text-foreground">{title}</div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close outline"
          >
            ×
          </button>
        </div>

        <div className="border-b border-border p-3 md:hidden">
          <button
            type="button"
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            + New chat
          </button>
        </div>

        <div className="space-y-0.5 border-b border-border p-2">
          <button
            type="button"
            onClick={() => jump('question')}
            className={rowClass}
            disabled={!contents.question}
          >
            <MessageCircleQuestion size={13} />
            <span className="flex-1">Question</span>
            <span className="text-[9px] uppercase tracking-wider">you</span>
          </button>
          <button
            type="button"
            onClick={() => jump('answer')}
            className={rowClass}
            disabled={!contents.answer}
          >
            <FileText size={13} />
            <span className="flex-1">Answer</span>
            <span className="text-[9px] uppercase tracking-wider">brief</span>
          </button>
          <button
            type="button"
            onClick={() => jump('thinking')}
            className={rowClass}
            disabled={!contents.thinking}
          >
            <Sparkles size={13} />
            <span className="flex-1">Thinking</span>
            <span className="text-[9px] uppercase tracking-wider">trace</span>
          </button>
          <button
            type="button"
            onClick={() => jump('sources')}
            className={rowClass}
            disabled={!contents.sources}
          >
            <BookOpen size={13} />
            <span className="flex-1">Sources</span>
            <span className="text-[9px] uppercase tracking-wider">{contents.sources}</span>
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search threads..."
              className="w-full rounded-lg border border-border bg-background/60 py-2 pl-8 pr-2 text-[11px] outline-none transition-colors placeholder:text-muted-foreground focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="px-2 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Recent
          </div>
          {filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-[11px] italic text-muted-foreground">
              {query ? 'No matches.' : 'No threads yet.'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-indigo-500/10 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60'
                  } ${isSending ? 'opacity-60' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isSending) return;
                      onSelectSession(session.id);
                      onCloseMobile();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessagesSquare size={13} className="shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11.5px] font-medium">
                        {session.title || 'Untitled thread'}
                      </span>
                      <span className="block text-[9px] text-muted-foreground">
                        {formatDate(session.created_at)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this chat?')) onDeleteSession(session.id);
                    }}
                    className="rounded p-1 text-muted-foreground/70 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    title="Delete thread"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
