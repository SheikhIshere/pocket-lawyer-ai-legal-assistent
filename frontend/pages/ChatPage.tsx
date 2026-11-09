import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Menu, Bot, AlertCircle, Loader2, Settings, MoreVertical, LayoutDashboard, Home, LogOut, Sun, Moon, Plus, Search, Trash2, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChatSession, Message } from '../types';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { useTheme } from '../context/ThemeContext';



const ChatPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, isLight } = useTheme();
  const location = useLocation();

  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [responseStyle, setResponseStyle] = useState<'supportive' | 'casual' | 'deep_thinking'>('supportive');
  const [responseEngine, setResponseEngine] = useState<number>(2);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Close config on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setShowHeaderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle new session trigger from navigation state (e.g., "Start Consultation" button)
  useEffect(() => {
    const state = location.state as { newSession?: boolean; sessionId?: string } | null;
    if (state?.newSession) {
      createNewSession();
    } else if (state?.sessionId) {
      selectSession(state.sessionId);
    }
    if (state?.newSession || state?.sessionId) {
      // Clear the state to prevent re-triggering on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Enhanced polling with better error handling
  const pollForResponse = useCallback(async (requestId: string) => {
    try {
      const result = await api.assistantService.checkStatus(requestId);

      // Update message with the response
      setMessages(prev => prev.map(msg =>
        msg.id === requestId
          ? { ...msg, response: result.response || '', status: 'completed' as const }
          : msg
      ));

      // Auto-refresh session to get complete updated data
      if (currentSessionId) {
        await refreshCurrentSession();
      }

      setPendingRequestId(null);
      setIsSending(false);

    } catch (err) {
      console.error('Polling failed:', err);
      setMessages(prev => prev.map(msg =>
        msg.id === requestId
          ? { ...msg, status: 'failed' as const, error: err instanceof Error ? err.message : 'Failed to get response' }
          : msg
      ));
      setPendingRequestId(null);
      setIsSending(false);
      setError('Failed to get AI response. Please try again.');
    }
  }, [currentSessionId]);

  // Poll for message updates
  useEffect(() => {
    if (pendingRequestId) {
      pollForResponse(pendingRequestId);
    }
  }, [pendingRequestId, pollForResponse]);

  const fetchSessions = async (maintainCurrentSession = true) => {
    try {
      setIsLoading(true);
      const data = await api.assistantService.getSessions();
      setSessions(data);

      if (!currentSessionId && data.length > 0) {
        selectSession(data[0].id);
      } else if (maintainCurrentSession && currentSessionId) {
        // Ensure current session still exists in the list
        const currentSessionExists = data.some(session => session.id === currentSessionId);
        if (!currentSessionExists && data.length > 0) {
          // Current session was deleted, select the first available
          selectSession(data[0].id);
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load sessions', err);
      // Don't show error immediately to avoid annoying user if it's just empty
      setIsLoading(false);
    }
  };

  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
    try {
      const sessionData = await api.assistantService.getSession(sessionId);
      // API now returns adapted messages directly
      setMessages((sessionData.messages as Message[]) || []);
    } catch (err) {
      console.error('Failed to load session details', err);
      setError('Failed to load conversation');
    }
  };

  const createNewSession = async () => {
    setCurrentSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const refreshCurrentSession = async () => {
    if (!currentSessionId) return;
    try {
      const sessionData = await api.assistantService.getSession(currentSessionId);
      // API now returns adapted messages directly
      setMessages((sessionData.messages as Message[]) || []);
    } catch (err) {
      console.error("Silent refresh failed", err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await api.assistantService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete conversation');
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      // Note: Backend doesn't have rename endpoint, so this is a placeholder
      // You would need to add a PATCH endpoint to the backend
      console.log('Rename session:', sessionId, newTitle);
      setError('Session rename not yet implemented');
    } catch (err) {
      console.error('Failed to rename session:', err);
      setError('Failed to rename conversation');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
      setError('File upload not yet implemented');
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setError('Voice recording not yet implemented');
      setTimeout(() => setIsRecording(false), 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMsgContent = inputValue.trim();
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = '56px';
    }
    setIsSending(true);
    setError(null);

    // Add user message immediately
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      content: userMsgContent,
      role: 'user',
      timestamp: Date.now(),
      status: 'completed'
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      console.log('=== STARTING MESSAGE SEND ===');
      console.log('User message:', userMsgContent);
      console.log('Current session ID:', currentSessionId);

      // Send message to API
      const response = await api.assistantService.sendMessage(
        userMsgContent,
        currentSessionId,
        responseEngine,
        responseStyle
      );
      console.log('Message sent successfully:', response);
      console.log('Response type:', typeof response);
      console.log('Response structure:', JSON.stringify(response, null, 2));

      // Handle both direct response and wrapped response
      const responseData = response.data || response;
      console.log('Using response data:', responseData);

      if (!responseData) {
        throw new Error('Invalid response from server');
      }

      // Get the request ID for polling
      const requestId = responseData.id || responseData.request_id;
      console.log('Extracted request ID:', requestId);

      if (!requestId) {
        throw new Error('No request ID received from server');
      }

      // Wait for completion synchronously (like demo)
      console.log('Starting polling for request:', requestId);
      await api.assistantService.pollForCompletion(requestId);
      console.log('Polling completed successfully');

      // Get the session ID for the completed request
      const newSessionId = responseData.session || currentSessionId;
      console.log('Using session ID:', newSessionId);

      // Fetch updated session to get the full response
      const updatedSession = await api.assistantService.getSession(newSessionId);
      console.log('Updated session:', updatedSession);

      // Update messages with the complete response
      const updatedMessages = (updatedSession.messages as Message[]) || [];
      console.log('Setting messages:', updatedMessages);
      setMessages(updatedMessages);

      // Only update session ID after everything is complete
      if (!currentSessionId && responseData.session) {
        console.log('Updating current session to:', responseData.session);
        setCurrentSessionId(responseData.session);
      }

      // Update session list order (since it was just updated)
      await fetchSessions(true);
      console.log('Message flow completed successfully');
      console.log('=== MESSAGE SEND COMPLETED ===');

      setIsSending(false); // Reset sending state

    } catch (err) {
      console.error('Send message error:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Error response:', err?.response);
      console.error('Full error object:', JSON.stringify(err, null, 2));

      if (err.response?.status === 400) {
        const errorMsg = err.response.data?.error || err.response.data?.message || 'Invalid request';
        if (errorMsg.includes('API key')) {
          setError('No active API key found. Please check your settings.');
        } else if (errorMsg.includes('wait for the previous response')) {
          setError('Please wait for the previous response to complete.');
        } else {
          setError(errorMsg);
        }
      } else if (err.response?.status === 401) {
        setError('Authentication expired. Please log in again.');
      } else if (err.response?.status === 429) {
        setError(
          err.response.data?.error ||
          'Daily free limit reached. Try again tomorrow or add your own API key.'
        );
      } else {
        setError('Failed to send message. Please try again.');
      }

      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight
      ? 'bg-slate-50 bg-[radial-gradient(at_top_right,rgba(14,142,130,0.05)_0%,transparent_50%),radial-gradient(at_bottom_left,rgba(59,130,246,0.05)_0%,transparent_50%)] text-slate-900'
      : 'bg-[#020617] bg-[radial-gradient(at_top_right,rgba(30,41,59,0.4)_0%,transparent_50%),radial-gradient(at_bottom_left,rgba(15,23,42,0.4)_0%,transparent_50%)] text-slate-100'
      }`}>
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        user={user}
        isSending={isSending}
      />

      <main className={`flex-1 flex flex-col min-w-0 relative transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight ? 'bg-transparent' : 'bg-transparent'
        }`}>
        <header className={`flex items-center justify-between p-4 border-b backdrop-blur-md z-10 sticky top-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight
          ? 'border-slate-200/60 bg-white/70 shadow-sm shadow-slate-200/20'
          : 'border-slate-800/40 bg-slate-900/50 shadow-lg shadow-black/10'
          }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sessions"
              className="lg:hidden p-2 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl text-teal-600 dark:text-teal-400"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className={`font-bold text-lg flex items-center gap-2 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight ? 'text-slate-900' : 'text-slate-50'
                }`}>
                Chat
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-100' : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700/50'
                  }`}>
                  {responseStyle === 'deep_thinking' ? 'Deep Think' : responseStyle.charAt(0).toUpperCase() + responseStyle.slice(1)}
                </span>
              </h1>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">

            {/* More Menu */}
            <div className="relative" ref={headerMenuRef}>
              <button
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className={`p-2.5 rounded-xl transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight
                  ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-transparent hover:border-slate-700/50'
                  }`}
              >
                <MoreVertical size={20} />
              </button>

              {showHeaderMenu && (
                <div className={`absolute right-0 top-full mt-3 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] border ${isLight
                  ? 'bg-white border-slate-200 shadow-slate-200/60 ring-1 ring-slate-100'
                  : 'bg-slate-900/95 backdrop-blur-xl border-slate-800 ring-1 ring-white/5 shadow-black/60'
                  }`}>
                  <div className="py-1">
                    <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isLight
                      ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}>
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link to="/" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isLight
                      ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}>
                      <Home size={16} />
                      Home Page
                    </Link>
                    <Link to="/settings" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isLight
                      ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}>
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                        setShowHeaderMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-t ${isLight
                        ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-100'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white border-slate-800'
                        }`}
                    >
                      {isLight ? <Moon size={16} /> : <Sun size={16} />}
                      {isLight ? 'Dark Mode' : 'Light Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-500 ${isLight ? 'scrollbar-thin scrollbar-thumb-slate-200' : 'scrollbar-thin scrollbar-thumb-slate-800'
          }`}>
          <div className="flex flex-col min-h-full">
            {messages.length === 0 && !isLoading && (
              <div className={`flex-1 flex flex-col items-center justify-center space-y-8 py-12 animate-in fade-in duration-1000 ${isLight ? 'text-slate-400' : 'text-slate-500'
                }`}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-2xl shadow-xl border transition-colors duration-300 ${isLight
                    ? 'bg-white border-gray-200 shadow-slate-200/50'
                    : 'bg-gray-900 border-gray-800 shadow-blue-900/10'
                    }`}>
                    <Bot size={48} className={isLight ? 'text-teal-600' : 'text-blue-500'} />
                  </div>
                  <h2 className={`text-2xl font-bold bg-clip-text text-transparent transition-colors duration-300 ${isLight
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600'
                    : 'bg-gradient-to-r from-blue-400 to-purple-400'
                    }`}>
                    Hello, {user?.name ? user.name.split(' ')[0] : 'there'}
                  </h2>
                  <p className={`text-sm max-w-sm text-center transition-colors duration-300 ${isLight ? 'text-slate-600' : 'text-gray-500'
                    }`}>
                    I'm your personal AI legal assistant. I can help analyze contracts, answer detailed legal questions, or draft simple agreements.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                  {[
                    { icon: '🚓', label: 'পুলিশের হয়রানি', desc: 'ঘুষ বা হুমকি মোকাবেলা' },
                    { icon: '💍', label: 'মিথ্যা যৌতুক মামলা', desc: 'মিথ্যা মামলা থেকে বাঁচার উপায়' },
                    { icon: '🔫', label: 'অস্ত্র রাখার আইন', desc: 'বাংলাদেশে লাইসেন্স ও শাস্তি' },
                    { icon: '📄', label: 'জিডি করার নিয়ম', desc: 'থানায় সাধারণ ডায়েরি করার গাইড' },
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputValue(prompt.label + " " + prompt.desc);
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className={`flex items-center gap-4 p-4 border rounded-2xl transition-all duration-500 text-left group hover:scale-[1.02] shadow-sm ${isLight
                        ? 'bg-white hover:bg-white border-slate-200 hover:border-teal-400 shadow-slate-100 hover:shadow-teal-100/50'
                        : 'bg-slate-900/40 hover:bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-black/10'
                        }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{prompt.icon}</span>
                      <div>
                        <div className={`text-sm font-medium transition-colors ${isLight ? 'text-slate-700 group-hover:text-teal-600' : 'text-gray-300 group-hover:text-white'}`}>{prompt.label}</div>
                        <div className="text-xs text-gray-500">{prompt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="py-6 space-y-2">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <MessageBubble
                      message={msg}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isSending && (
                <div className="w-full mb-10 animate-fade-in transition-all">
                  <div className="max-w-4xl mx-auto flex gap-4 px-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${isLight
                      ? 'bg-teal-600 text-white shadow-teal-500/20'
                      : 'bg-indigo-600 text-white shadow-indigo-500/20'
                      }`}>
                      <Bot size={20} className="animate-pulse" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex space-x-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isLight ? 'bg-teal-500/40' : 'bg-indigo-500/40'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isLight ? 'bg-teal-500/40' : 'bg-indigo-500/40'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isLight ? 'bg-teal-500/40' : 'bg-indigo-500/40'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="py-4 text-center">
                  <span className={`text-sm flex items-center justify-center gap-2 transition-colors duration-300 ${isLight ? 'text-red-600' : 'text-red-400'
                    }`}>
                    <AlertCircle size={16} /> {error}
                  </span>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>
        </div>

        <div className={`p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-4 lg:p-6 lg:pb-6 border-t transition-all duration-500 ${isLight
          ? 'bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]'
          : 'bg-[#020617]/90 backdrop-blur-xl border-slate-800/40 shadow-[0_-8px_30px_rgb(0,0,0,0.15)]'
          }`}>
          <div className="max-w-4xl mx-auto relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex items-center gap-2 relative w-full px-2 lg:px-0">
              <div className="relative" ref={configRef}>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={`p-3 rounded-2xl outline-none transition-all group relative ${showConfig
                    ? isLight
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25 scale-105'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                    : isLight
                      ? 'bg-slate-50 text-slate-500 hover:text-teal-600 border border-slate-200'
                      : 'bg-slate-900 text-slate-400 hover:text-indigo-400 border border-slate-800'}`}
                  title="AI Settings"
                >
                  <Settings size={20} className={`transition-transform duration-500 ${showConfig ? 'rotate-90' : 'group-hover:rotate-45'}`} />
                </button>

                {showConfig && (
                  <div className={`fixed left-4 right-4 bottom-24 lg:absolute lg:left-0 lg:bottom-full lg:mb-6 w-auto lg:w-[360px] backdrop-blur-2xl border rounded-[2.5rem] shadow-2xl p-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 ${isLight
                    ? 'bg-white/95 border-slate-200 shadow-slate-200/60'
                    : 'bg-slate-900/95 border-slate-800 shadow-black/80'
                    }`}>
                    <div className="relative z-10 space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                          <Bot size={12} className="text-blue-500" /> Persona Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'supportive', icon: '🤝', label: 'Supportive' },
                            { id: 'casual', icon: '☕', label: 'Casual' },
                            { id: 'deep_thinking', icon: '🧠', label: 'Deep' }
                          ].map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setResponseStyle(style.id as any)}
                              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${responseStyle === style.id
                                ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-900/20'
                                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700'
                                }`}
                            >
                              <div className="text-xl">{style.icon}</div>
                              <div className="text-[10px] font-medium">{style.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> AI Engine
                        </label>
                        <select
                          value={responseEngine}
                          onChange={(e) => setResponseEngine(Number(e.target.value))}
                          className={`w-full border rounded-2xl text-xs p-4 outline-none appearance-none cursor-pointer transition-all duration-700 ${isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-white focus:ring-2 focus:ring-teal-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20'
                            }`}
                        >
                          <option value={1}>⚡ Gemini 3 Flash (Fastest)</option>
                          <option value={2}>⚖️ Gemini 2.5 Flash (Balanced)</option>
                          <option value={3}>🌱 Gemini 2.5 Flash Lite (Eco)</option>
                          <option value={4}>🔓 Gemma 2 27B (Open Source)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Text Input & Send Button Unified Unit */}
              <div className={`flex-1 relative flex items-end gap-2 p-2 rounded-[2.25rem] border transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight
                ? 'bg-white border-slate-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] focus-within:border-teal-500/50 focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:shadow-[0_15px_50px_-12px_rgba(0,0,0,0.15)]'
                : 'bg-slate-900/80 border-slate-800/60 backdrop-blur-sm shadow-black/60 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10'
                }`}>
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className={`w-full bg-transparent border-0 focus:ring-0 outline-none text-[15px] p-3 pr-4 resize-none min-h-[44px] scrollbar-hide transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'
                      }`}
                    style={{ maxHeight: '200px' }}
                    disabled={isSending}
                  />

                  <div className="absolute right-0 bottom-2.5 pr-2 flex items-center gap-2 pointer-events-none">
                    <span className={`text-[10px] font-mono transition-all duration-1000 ${isLight ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                      {inputValue.length}/1000
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending}
                  className={`p-3.5 rounded-[1.25rem] outline-none transition-all duration-700 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed group relative active:scale-95 ${isLight
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/40'
                    }`}
                  title={isSending ? 'Sending...' : 'Send (Enter)'}
                >
                  {isSending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  )}
                </button>
              </div>
            </div>

            <p className={`text-center text-xs leading-relaxed mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              PocketLawyer can make mistakes. Please consult a real lawyer for legal advice.
            </p>

            {/* Error Display */}
            {error && (
              <div className="absolute -top-12 left-0 right-0 bg-red-900/90 text-red-200 text-sm px-3 py-2 rounded-lg border border-red-700 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-300 hover:text-red-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
