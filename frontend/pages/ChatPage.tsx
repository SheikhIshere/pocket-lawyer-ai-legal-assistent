
import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { assistantService } from '../services/api';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessage } from '../components/chat/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { ChatSession, Message } from '../types';

const ChatPage = () => {
    const { user } = useAuth();

    // State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Load sessions on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    // Poll for message updates
    useEffect(() => {
        if (!currentSessionId) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.response && !lastMessage.error) {
            const pollInterval = setInterval(() => {
                refreshCurrentSession();
            }, 3000);
            return () => clearInterval(pollInterval);
        }
    }, [messages, currentSessionId]);

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const data = await assistantService.getSessions();
            const sessionList = Array.isArray(data) ? data : (data.results || []);
            setSessions(sessionList);

            if (!currentSessionId && sessionList.length > 0) {
                selectSession(sessionList[0].id);
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
            const sessionData = await assistantService.getSession(sessionId);
            const adaptedMessages: Message[] = [];
            if (sessionData.messages && Array.isArray(sessionData.messages)) {
                sessionData.messages.forEach((msg: any, idx: number) => {
                    if (msg.message) {
                        adaptedMessages.push({
                            id: `${sessionId}-msg-${idx}-user`,
                            content: msg.message,
                            role: 'user',
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    }
                    if (msg.response) {
                        adaptedMessages.push({
                            id: `${sessionId}-msg-${idx}-assistant`,
                            content: msg.response,
                            role: 'assistant',
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    }
                });
            }
            setMessages(adaptedMessages);
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
            const sessionData = await assistantService.getSession(currentSessionId);
            const adaptedMessages: Message[] = [];
            if (sessionData.messages && Array.isArray(sessionData.messages)) {
                sessionData.messages.forEach((msg: any, idx: number) => {
                    if (msg.message) {
                        adaptedMessages.push({
                            id: `${currentSessionId}-msg-${idx}-user`,
                            content: msg.message,
                            role: 'user',
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    }
                    if (msg.response) {
                        adaptedMessages.push({
                            id: `${currentSessionId}-msg-${idx}-assistant`,
                            content: msg.response,
                            role: 'assistant',
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    }
                });
            }
            setMessages(adaptedMessages);
        } catch (err) {
            console.error("Silent refresh failed", err);
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isSending) return;

        const userMsgContent = inputValue.trim();
        setInputValue('');
        setIsSending(true);
        setError(null);

        const tempUserMsg: Message = {
            id: 'temp-user-' + Date.now(),
            content: userMsgContent,
            role: 'user',
            timestamp: Date.now()
        };

        // Add simple placeholder 
        // Note: ChatMessage component handles rendering
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const response = await assistantService.sendMessage(userMsgContent, currentSessionId);

            if (!currentSessionId && response.data?.session) {
                setCurrentSessionId(response.data.session);
                fetchSessions();
            }

            // We rely on polling to show the bot response

        } catch (err) {
            console.error('Send message failed', err);
            setError('Failed to send message');
        } finally {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <ChatSidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={selectSession}
                onNewSession={createNewSession}
                isOpen={sidebarOpen}
                onCloseMobile={() => setSidebarOpen(false)}
                user={user}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-black relative">
                <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="font-semibold text-lg">Chat</h1>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                    {messages.length === 0 && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
                            <Bot size={48} />
                            <p>How can I help you today?</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} msg={msg} />
                    ))}

                    {isSending && (
                        <div className="py-6 px-4 bg-transparent">
                            <div className="max-w-3xl mx-auto flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <span className="text-gray-400 text-sm flex items-center">Thinking...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="py-4 text-center">
                            <span className="text-red-400 text-sm flex items-center justify-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-black border-t border-gray-800">
                    <div className="max-w-3xl mx-auto relative">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Send a message..."
                            className="w-full bg-gray-900 border-none text-white rounded-xl pl-4 pr-12 py-4 resize-none focus:ring-1 focus:ring-blue-600 scrollbar-hide"
                            rows={1}
                            style={{ minHeight: '50px', maxHeight: '200px' }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isSending}
                            className={`
                absolute right-3 bottom-3 p-2 rounded-lg transition-all
                ${inputValue.trim() && !isSending
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'bg-transparent text-gray-500'}
              `}
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
