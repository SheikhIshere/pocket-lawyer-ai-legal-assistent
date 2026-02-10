import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatSession } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  user: any;
  isSending?: boolean;
}

export const ChatSidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onCloseMobile,
  user,
  isSending = false
}) => {
  const { theme, isLight } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showSessionMenu, setShowSessionMenu] = useState<string | null>(null);

  // Close session menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.session-menu-container')) {
        setShowSessionMenu(null);
      }
    };

    if (showSessionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSessionMenu]);

  // Filter sessions based on search
  const filteredSessions = sessions.filter(session =>
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `Chat ${session.id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
    setShowSessionMenu(null);
  };

  const saveRename = () => {
    if (editingSessionId && editingTitle.trim() && onRenameSession) {
      onRenameSession(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleDelete = (sessionId: string) => {
    if (onDeleteSession && window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(sessionId);
      setShowSessionMenu(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 border-r shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isLight
          ? 'bg-white text-slate-900 border-slate-100 shadow-slate-200/20'
          : 'bg-slate-900 text-slate-100 border-slate-800 shadow-black/40'}
      `}>
        <div className="flex flex-col h-full">
          {/* User Profile Section (Material-Style Header) */}
          <div className={`p-4 lg:p-6 border-b transition-all duration-300 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${isLight
                ? 'bg-gradient-to-br from-teal-600 to-emerald-700 shadow-teal-500/20'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
                }`}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-50'}`}>{user?.name}</div>
                <div className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isLight ? 'text-teal-600/70' : 'text-slate-500'}`}>{user?.plan || 'Free'} Member</div>
              </div>
            </div>

            <button
              onClick={() => {
                onNewSession();
                onCloseMobile();
              }}
              className={`w-full h-12 flex items-center justify-center gap-2 rounded-2xl outline-none transition-all active:scale-95 group font-bold shadow-md ${isLight
                ? 'bg-teal-600 text-white shadow-teal-500/20 hover:bg-teal-700'
                : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700'
                }`}
            >
              <Plus size={20} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className={`p-4 border-b border-transparent`}>
            <div className="relative group">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${isLight ? 'text-slate-400 group-focus-within:text-teal-600' : 'text-slate-500 group-focus-within:text-indigo-400'}`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all ${isLight
                  ? 'bg-slate-50 border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-4 focus:ring-teal-500/5'
                  : 'bg-slate-950/50 border border-slate-800 focus:bg-slate-950 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5'
                  }`}
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <div className={`text-[10px] font-bold px-4 pt-4 mb-4 uppercase tracking-[0.25em] ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
              Recent Activity
            </div>

            {filteredSessions.length === 0 ? (
              <div className={`px-4 py-12 text-sm text-center italic ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                {searchQuery ? 'No matches found.' : 'Your history is ready for new insights.'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="px-2">
                    {editingSessionId === session.id ? (
                      <div className="p-1 px-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename();
                            if (e.key === 'Escape') cancelRename();
                          }}
                          onBlur={saveRename}
                          className={`w-full px-3 py-2 border rounded-xl text-sm outline-none font-medium ${isLight
                            ? 'bg-white border-teal-500/30 text-slate-900'
                            : 'bg-slate-800 border-indigo-500/30 text-white'
                            }`}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          if (isSending) return; // Prevent session switching during message sending
                          onSelectSession(session.id);
                          onCloseMobile();
                        }}
                        className={`group relative w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer border-2 ${currentSessionId === session.id
                            ? isLight
                              ? 'bg-teal-50 border-teal-100 text-teal-900'
                              : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-100'
                            : isSending
                              ? 'opacity-50 cursor-not-allowed border-transparent text-slate-400 dark:text-slate-600'
                              : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                          }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${currentSessionId === session.id
                          ? isLight ? 'bg-teal-600 text-white' : 'bg-indigo-600 text-white'
                          : isLight ? 'bg-slate-100 text-slate-400 group-hover:bg-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                        }`}>
                          <MessageSquare size={16} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate font-bold ${currentSessionId === session.id ? (isLight ? 'text-teal-950' : 'text-white') : ''}`}>
                            {session.title || `Chat ${session.id.slice(0, 8)}`}
                          </div>
                          <div className={`text-[10px] mt-0.5 font-medium transition-opacity ${currentSessionId === session.id ? 'opacity-100' : 'opacity-60'}`}>
                            {session.created_at && formatDate(session.created_at)}
                          </div>
                        </div>

                        <div className="session-menu-container relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSessionMenu(showSessionMenu === session.id ? null : session.id);
                            }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-white/10 text-slate-500'}`}
                          >
                            <MoreVertical size={14} />
                          </button>

                          {showSessionMenu === session.id && (
                            <div className={`absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-2xl z-50 border overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300 ${isLight
                              ? 'bg-white border-slate-100 shadow-slate-200/60'
                              : 'bg-slate-900 border-slate-800 shadow-black'
                              }`}>
                              <button
                                onClick={() => handleRename(session.id, session.title || `Chat ${session.id.slice(0, 8)}`)}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-teal-600' : 'text-slate-300 hover:bg-white/5 hover:text-indigo-400'}`}
                              >
                                <Edit3 size={14} /> Rename
                              </button>
                              <button
                                onClick={() => handleDelete(session.id)}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-[0.4em] text-center ${isLight ? 'text-slate-300' : 'text-slate-700'}`}>
              Pocket Lawyer AI • v2.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
