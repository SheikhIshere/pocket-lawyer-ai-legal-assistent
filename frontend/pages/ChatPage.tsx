import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  ChevronDown,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  MoreVertical,
  Send,
  Settings,
  Square,
  Sun,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ChatSession, Message, StepRecord } from '../types';
import { fetchFreeModels, FreeModel } from '../lib/freeModels';
import { StudioMessage } from '../components/chat/StudioMessage';
import { StudioOutline } from '../components/chat/StudioOutline';
import { StudioRail } from '../components/chat/StudioRail';
import { ChainOfThought } from '../components/chat/ChainOfThought';

type ModelOption = { id: string; label: string };

const PERSONAS = [
  { id: 'supportive', label: 'Supportive' },
  { id: 'casual', label: 'Casual' },
  { id: 'deep_thinking', label: 'Deep' },
] as const;

const ChatPage = () => {
  const { user } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const location = useLocation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [liveTrace, setLiveTrace] = useState<StepRecord[]>([]);
  const [liveStartedAt, setLiveStartedAt] = useState<number | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [responseStyle, setResponseStyle] = useState<'supportive' | 'casual' | 'deep_thinking'>('supportive');
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [freeModels, setFreeModels] = useState<FreeModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelMode, setModelMode] = useState<'loading' | 'keyed' | 'platform' | 'error'>('loading');
  const [revealMessageId, setRevealMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const docTopRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const stopControllerRef = useRef<AbortController | null>(null);

  const engineLabel =
    modelMode === 'loading'
      ? 'Loading models…'
      : selectedModel
        ? (modelOptions.find((model) => model.id === selectedModel)?.label ||
            freeModels.find((model) => model.id === selectedModel)?.name ||
            selectedModel)
        : modelMode === 'platform'
          ? 'Auto (platform)'
          : modelMode === 'keyed'
            ? 'Auto (Gemini)'
            : 'Auto';
  const currentTitle = sessions.find((session) => session.id === currentSessionId)?.title || 'New chat';
  const displayName = user?.name || user?.full_name || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (headerMenuRef.current && !headerMenuRef.current.contains(target)) setShowHeaderMenu(false);
      if (modelMenuRef.current && !modelMenuRef.current.contains(target)) setModelMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadModels = async () => {
      try {
        const raw = await api.accountService.getApiKeys();
        const keys = Array.isArray(raw) ? raw : (raw?.results || []);
        const working = keys.find((key: any) => key.is_working);
        if (cancelled) return;
        if (!working) {
          setModelMode('platform');
          setModelOptions([]);
          setSelectedModel(null);
          return;
        }
        const models = Array.isArray(working.models) ? working.models : [];
        setModelOptions(models);
        setModelMode('keyed');
        const preferred = models.find((model: ModelOption) => model.id === 'gemini-flash-latest') || models[0];
        setSelectedModel(preferred?.id || null);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load model list', err);
        setModelMode('error');
        setModelOptions([]);
        setSelectedModel(null);
      }
    };
    loadModels();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (modelMode !== 'platform') return;
    let cancelled = false;
    fetchFreeModels().then((models) => {
      if (!cancelled) setFreeModels(models);
    });
    return () => { cancelled = true; };
  }, [modelMode]);

  useEffect(() => {
    const state = location.state as { newSession?: boolean; sessionId?: string } | null;
    if (state?.newSession) createNewSession();
    else if (state?.sessionId) selectSession(state.sessionId);
    if (state?.newSession || state?.sessionId) window.history.replaceState({}, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (isSending) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isSending, liveTrace]);

  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setOutlineOpen(false);
    setRevealMessageId(null);
    try {
      const sessionData = await api.assistantService.getSession(sessionId);
      setMessages((sessionData.messages as Message[]) || []);
      requestAnimationFrame(() => docTopRef.current?.scrollIntoView({ block: 'start' }));
    } catch (err) {
      console.error('Failed to load session details', err);
      setError('Failed to load conversation');
    }
  };

  const fetchSessions = async (maintainCurrentSession = true) => {
    try {
      setIsLoading(true);
      const data = await api.assistantService.getSessions();
      setSessions(data);
      if (!currentSessionId && data.length > 0) {
        selectSession(data[0].id);
      } else if (maintainCurrentSession && currentSessionId) {
        if (!data.some((session) => session.id === currentSessionId) && data.length > 0) {
          selectSession(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setRevealMessageId(null);
    setError(null);
    setOutlineOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await api.assistantService.deleteSession(sessionId);
      setSessions((current) => current.filter((session) => session.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
        setRevealMessageId(null);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to delete session', err);
      setError('Failed to delete conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userContent = inputValue.trim();
    setInputValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setError(null);
    setIsSending(true);
    setLiveTrace([]);
    setLiveStartedAt(Date.now());
    setRevealMessageId(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: userContent,
      role: 'user',
      timestamp: Date.now(),
      status: 'completed',
    };
    setMessages((current) => [...current, userMessage]);
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));

    const controller = new AbortController();
    stopControllerRef.current = controller;

    try {
      const response = await api.assistantService.sendMessage(
        userContent,
        currentSessionId,
        responseStyle,
        selectedModel,
      );
      const responseData = response.data || response;
      const requestId = responseData?.id || responseData?.request_id;
      if (!responseData || !requestId) throw new Error('No request ID received from the server');

      await api.assistantService.pollForCompletion(
        requestId,
        (progress) => setLiveTrace(progress as StepRecord[]),
        controller.signal,
      );

      const newSessionId = responseData.session || currentSessionId;
      const updatedSession = await api.assistantService.getSession(newSessionId);
      const updatedMessages = (updatedSession.messages as Message[]) || [];
      setMessages(updatedMessages);
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));

      if (!currentSessionId && responseData.session) setCurrentSessionId(responseData.session);

      const lastAssistant = [...updatedMessages].reverse().find((message) => message.role === 'assistant');
      if (lastAssistant?.id) setRevealMessageId(lastAssistant.id);

      const refreshedSessions = await api.assistantService.getSessions();
      setSessions(refreshedSessions);
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        setError('Stopped waiting. The request may still finish on the server.');
      } else if (err?.response?.status === 400) {
        const message = err.response.data?.error || err.response.data?.message || 'Invalid request';
        if (message.includes('API key')) setError('No active API key found. Please check your settings.');
        else if (message.includes('wait for the previous response')) setError('Please wait for the previous response to complete.');
        else setError(message);
      } else if (err?.response?.status === 401) {
        setError('Authentication expired. Please log in again.');
      } else if (err?.response?.status === 429) {
        setError(err.response.data?.error || 'Daily free limit reached. Try again tomorrow or add your own API key.');
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
      setLiveTrace([]);
      setLiveStartedAt(null);
      stopControllerRef.current = null;
    }
  };

  const handleStop = () => {
    stopControllerRef.current?.abort();
    setIsSending(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const jumpTo = (target: 'question' | 'answer' | 'thinking' | 'sources') => {
    document.getElementById(`doc-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const lastUserIndex = [...messages].map((message) => message.role).lastIndexOf('user');
  const lastAssistantIndex = [...messages].map((message) => message.role).lastIndexOf('assistant');
  const lastAssistant = lastAssistantIndex >= 0 ? messages[lastAssistantIndex] : null;

  const contents = {
    question: lastUserIndex >= 0,
    answer: Boolean(lastAssistant?.response || lastAssistant?.content),
    thinking: Boolean(lastAssistant?.trace?.length),
    sources: lastAssistant?.sources?.length || 0,
  };

  const emptyState = messages.length === 0 && !isLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <StudioRail
        user={user}
        onNewSession={createNewSession}
        isSending={isSending}
      />
      <StudioOutline
        sessions={sessions}
        currentSessionId={currentSessionId}
        title={currentTitle}
        onNewSession={createNewSession}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        isOpen={outlineOpen}
        onCloseMobile={() => setOutlineOpen(false)}
        isSending={isSending}
        contents={contents}
        onJump={jumpTo}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-6 md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOutlineOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Open outline"
            >
              <Menu size={18} />
            </button>
            <h1 className="min-w-0 truncate text-[15px] font-bold text-foreground">{currentTitle}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative" ref={headerMenuRef}>
              <button
                type="button"
                onClick={() => setShowHeaderMenu((open) => !open)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="More"
              >
                <MoreVertical size={18} />
              </button>
              {showHeaderMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-2xl shadow-black/40">
                  <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <Link to="/" className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Home size={14} /> Home
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Settings size={14} /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                      setShowHeaderMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-border px-3 py-2 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {isLight ? <Moon size={14} /> : <Sun size={14} />}
                    {isLight ? 'Dark mode' : 'Light mode'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="mx-auto w-full max-w-[760px] px-4 py-7 sm:px-6 sm:py-10">
            <div ref={docTopRef} />
            {emptyState && (
              <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl shadow-teal-500/20">
                  <Bot size={22} />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Hello, {displayName.split(' ')[0]}
                </h2>
                <p className="mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
                  Ask a legal question and get a brief with the Act, the section, and the sources beside the claim.
                </p>
                <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    { label: 'পুলিশের হয়রানি', desc: 'ঘুষ বা হুমকি মোকাবেলা' },
                    { label: 'মিথ্যা যৌতুক মামলা', desc: 'মিথ্যা মামলা থেকে বাঁচার উপায়' },
                    { label: 'অস্ত্র রাখার আইন', desc: 'লাইসেন্স ও শাস্তি' },
                    { label: 'জিডি করার নিয়ম', desc: 'থানায় সাধারণ ডায়েরি' },
                  ].map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => {
                        setInputValue(`${prompt.label} ${prompt.desc}`);
                        inputRef.current?.focus();
                      }}
                      className="rounded-xl border border-border bg-card/60 p-3 text-left transition-colors hover:border-teal-500/40 hover:bg-card"
                    >
                      <span className="block text-[12px] font-semibold text-foreground">{prompt.label}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{prompt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const isLastUser = index === lastUserIndex;
                const isLastAssistant = index === lastAssistantIndex;
                return (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <StudioMessage
                      message={message}
                      animate={Boolean(message.id && message.id === revealMessageId)}
                      onAnimationDone={() => setRevealMessageId(null)}
                      anchor={isLastUser
                        ? { root: 'doc-question' }
                        : isLastAssistant
                          ? { root: 'doc-answer', thinking: 'doc-thinking', sources: 'doc-sources' }
                          : undefined}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isSending && (
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-600 text-white">
                    <Bot size={12} />
                  </span>
                  Pocket Lawyer AI
                </div>
                {liveTrace.length > 0 ? (
                  <ChainOfThought records={liveTrace} running startedAt={liveStartedAt} defaultOpen />
                ) : (
                  <div className="flex items-center gap-1.5 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400/60 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400/60 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400/60" />
                    <span className="ml-2 text-[11px] text-muted-foreground">Reading the sources…</span>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-background/85 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6 sm:pb-5">
          <div className="mx-auto w-full max-w-[760px]">
            {error && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
                <AlertCircle size={14} />
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-red-100">×</button>
              </div>
            )}

            <div ref={modelMenuRef} className="relative rounded-[24px] border border-border bg-card p-2 shadow-2xl shadow-black/20 transition-colors focus-within:border-teal-500/40">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  event.target.style.height = 'auto';
                  event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything…"
                aria-label="Message"
                rows={1}
                className="max-h-[180px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-[14px] leading-6 text-foreground outline-none placeholder:text-muted-foreground scrollbar-hide"
                disabled={isSending}
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-0.5">
                <div>
                  <button
                    type="button"
                    onClick={() => setModelMenuOpen((open) => !open)}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-teal-500/50 hover:text-foreground"
                    aria-haspopup="menu"
                    aria-expanded={modelMenuOpen}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="max-w-[120px] truncate">{engineLabel}</span>
                    <ChevronDown size={10} className={`transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
                  </button>


                </div>
                <button
                  type="button"
                  onClick={isSending ? handleStop : handleSendMessage}
                  disabled={!isSending && !inputValue.trim()}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
                    isSending
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-700 shadow-teal-500/20 hover:from-teal-500 hover:to-emerald-600'
                      : 'bg-teal-600 shadow-teal-500/20 hover:bg-teal-500'
                  }`}
                  title={isSending ? 'Stop waiting' : 'Send (Enter)'}
                >
                  {isSending ? <Square size={10} fill="currentColor" /> : <Send size={15} />}
                </button>
              </div>
                  {modelMenuOpen && (
                    <div className="absolute bottom-full left-2 z-50 mb-2 max-h-[calc(100dvh-220px)] w-[268px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-2xl shadow-black/40">
                      <div className="px-2 pb-1 pt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Model
                      </div>
                      {modelMode === 'platform' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedModel(null);
                              setModelMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                              selectedModel === null
                                ? 'bg-teal-500/15 text-foreground'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span className="truncate">Auto (platform)</span>
                            {selectedModel === null && <span className="shrink-0 text-[10px] text-emerald-400">ok</span>}
                          </button>
                          {freeModels.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(model.id);
                                setModelMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                                selectedModel === model.id
                                  ? 'bg-teal-500/15 text-foreground'
                                  : 'text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate">{model.name}</span>
                              {selectedModel === model.id && <span className="shrink-0 text-[10px] text-emerald-400">ok</span>}
                            </button>
                          ))}
                        </>
                      ) : modelMode === 'loading' ? (
                        <div className="px-2.5 py-2 text-[11px] text-muted-foreground">Loading models…</div>
                      ) : modelOptions.length > 0 ? (
                        modelOptions.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setModelMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                              selectedModel === model.id
                                ? 'bg-teal-500/15 text-foreground'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span className="truncate">{model.label}</span>
                            {selectedModel === model.id && <span className="shrink-0 text-[10px] text-emerald-400">ok</span>}
                          </button>
                        ))
                      ) : (
                        <div className="rounded-lg px-2.5 py-2 text-[11px] text-muted-foreground">
                          <div className="font-medium text-foreground">Auto {modelMode === 'keyed' ? '(Gemini)' : ''}</div>
                          <div className="mt-0.5 text-[10px]">Falls back to the tuned Gemini aliases.</div>
                        </div>
                      )}
                      <div className="mt-2 border-t border-border px-2 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Persona
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {PERSONAS.map((persona) => (
                          <button
                            key={persona.id}
                            type="button"
                            onClick={() => setResponseStyle(persona.id)}
                            className={`rounded-lg px-1 py-1.5 text-[10px] transition-colors ${
                              responseStyle === persona.id
                                ? 'bg-teal-500/15 text-foreground'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {persona.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
            </div>

            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Pocket Lawyer can make mistakes. Please consult a real lawyer for legal advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
