import React from 'react';
import { MessageSquare, Plus, X, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatSession } from '../../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  user: any;
}

export const ChatSidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  isOpen,
  onCloseMobile,
  user
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-gray-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700">
            <button 
              onClick={() => {
                onNewSession();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm">New chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <div className="text-xs font-semibold text-gray-500 px-3 mb-2 uppercase tracking-wider">
              Recent
            </div>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onCloseMobile();
                }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm mb-1 flex items-center gap-3 transition-colors truncate
                  ${currentSessionId === session.id 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate block flex-1">
                  {session.title || `Chat ${session.id}`}
                </span>
              </button>
            ))}
            
            {sessions.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center italic">
                No history yet.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">Free Plan</div>
              </div>
              <Link to="/settings" className="p-1 hover:bg-gray-700 rounded">
                <Settings className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Pocket Lawyer AI v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
