import { useCallback, memo } from 'react';
import { User, Bot, Loader2, AlertCircle, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message, isStreaming = false }) => {
  const { theme, isLight } = useTheme();
  const isUser = message.role === 'user';

  const handleCopy = useCallback(async () => {
    try {
      if (message.content) {
        await navigator.clipboard.writeText(message.content);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [message.content]);

  const formattedTime = new Date(message.timestamp ?? Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`w-full mb-10 animate-fade-in transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isUser ? '' : 'bg-transparent'}`}>
      <div className={`max-w-4xl mx-auto flex gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl ${isUser
          ? isLight
            ? 'bg-teal-600 text-white shadow-teal-500/20'
            : 'bg-slate-700 text-slate-100 border border-slate-600 shadow-black/20'
          : isLight
            ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30'
            : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-600 text-white shadow-indigo-500/30'
          }`}>
          {isUser ? (
            <User className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6" />
              {isStreaming && <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 shadow-sm"></span>
              </span>}
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className={`flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>

          {/* Author Name */}
          <div className={`text-xs font-bold uppercase tracking-widest mb-2 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isUser
            ? isLight ? 'text-teal-600/70 text-right' : 'text-slate-500 text-right'
            : isLight ? 'text-teal-600/70' : 'text-slate-500'
            }`}>
            {isUser ? 'You' : 'Pocket Lawyer AI'}
          </div>

          {/* Message Bubble */}
          <div className={`group relative p-6 rounded-[2rem] transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-md border ${isUser
            ? isLight
              ? 'bg-white text-slate-900 border-slate-300 rounded-tr-none shadow-sm shadow-slate-200/50'
              : 'bg-slate-900/90 text-slate-100 border-slate-800 rounded-tr-none shadow-black/40'
            : isLight
              ? 'bg-slate-100/50 text-slate-800 border-slate-200/80 rounded-tl-none'
              : 'bg-slate-900/40 backdrop-blur-sm text-slate-300 border border-slate-800/60 rounded-tl-none'
            }`}>
            <div className={`prose prose-base max-w-none leading-relaxed tracking-normal transition-colors duration-300 ${isLight ? 'prose-slate' : 'prose-invert'
              }`}>
              <div className="font-sans break-words text-[16px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Status / Meta */}
          {!isUser && message.status === 'failed' && (
            <div className={`mt-2 text-xs flex items-center gap-2 p-2 rounded transition-colors duration-300 ${isLight ? 'text-red-600 bg-red-50' : 'text-red-400 bg-red-900/20'
              }`}>
              <AlertCircle size={12} /> Response generation failed
            </div>
          )}

          {/* Action Row */}
          <div className={`flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] font-mono transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight ? 'text-slate-400' : 'text-slate-600'
              }`}>{formattedTime}</span>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all duration-500 ${isLight
                ? 'text-slate-400 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-100'
                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800 border border-transparent hover:border-slate-700'
                }`}
              title="Copy"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.isStreaming === nextProps.isStreaming
  );
});
