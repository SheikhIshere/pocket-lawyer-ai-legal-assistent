import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  AlertCircle, ArrowRight, ChevronDown, Clock, FileText,
  Grid, List, Loader2, MessageSquare, Search, X
} from 'lucide-react';

interface SessionRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DocumentsPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const data = await api.assistantService.getSessions();
        if (!cancelled) {
          setSessions((data || []).map((session: any) => ({
            id: String(session.id),
            title: session.title || 'Untitled session',
            created_at: session.created_at,
            updated_at: session.updated_at,
          })));
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error?.message || 'Could not load your sessions.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSessions();
    return () => { cancelled = true; };
  }, []);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = query
      ? sessions.filter((session) => session.title.toLowerCase().includes(query))
      : sessions;

    return [...rows].sort((a, b) => {
      const aValue = sortBy === 'name' ? a.title.toLowerCase() : new Date(a.updated_at).getTime();
      const bValue = sortBy === 'name' ? b.title.toLowerCase() : new Date(b.updated_at).getTime();
      return sortOrder === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });
  }, [sessions, searchQuery, sortBy, sortOrder]);

  const lastActivity = sessions.length > 0 ? formatDate(sessions[0].updated_at) : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chat Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your legal consultation sessions, in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Chat Sessions', value: sessions.length, icon: MessageSquare },
            { label: 'Last Activity', value: lastActivity, icon: Clock },
            { label: 'Search Results', value: filteredSessions.length, icon: Search },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                  className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="date">Sort by date</option>
                  <option value="name">Sort by name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
              </button>

              <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-16 text-center">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your sessions...</p>
          </div>
        ) : loadError ? (
          <div role="alert" className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/30 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Could not load sessions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              Try again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-16 text-center">
            <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <FileText className="w-12 h-12 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No Chat Sessions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start a consultation and your sessions will appear here.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <MessageSquare className="w-5 h-5" />
              Start Chat Session
            </Link>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-16 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Sessions Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No sessions match "{searchQuery}". Try a different search.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <X className="w-4 h-4" />
              Clear Search
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'}
          >
            {filteredSessions.map((session) => (
              <Link
                key={session.id}
                to="/chat"
                state={{ sessionId: session.id }}
                className="group bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {session.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-auto">
                  Updated {formatDate(session.updated_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentsPage;
