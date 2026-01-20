import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { assistantService } from '../services/api';
import { ChatSession, Message, RequestStatus } from '../types';
import { Send, Plus, MessageSquare, Menu, Scale, User, MoreVertical, Paperclip, X, Settings, ChevronDown, Sparkles, Home, Layout, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Engine and Style selection
  const [selectedEngine, setSelectedEngine] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState('supportive');
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  
  // Menu dropdown
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const engines = [
    { id: 1, name: 'Gemini 3 Flash', description: 'Fast and efficient' },
    { id: 2, name: 'Gemini 2.5 Flash', description: 'Enhanced performance' },
    { id: 3, name: 'Gemini 2.5 Flash Lite', description: 'Lightweight and fast' },
    { id: 4, name: 'Gemma 3 27B', description: 'High token allowance' }
  ];

  const styles = [
    { id: 'supportive', name: 'Supportive', description: 'Helpful and encouraging' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and friendly' },
    { id: 'deep_thinking', name: 'Deep Thinking', description: 'Analytical and thorough' }
  ];

  // Initialize
  useEffect(() => {
    const loadSessions = async () => {
      const data = await assistantService.getSessions();
      setSessions(data);
    };
    loadSessions();
    
    // Initial welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name || 'User'}, I am your Pocket Lawyer AI assistant. How can I help you today? \n\n*Note: I am an AI, not a human lawyer. My advice is for informational purposes only.*`,
      timestamp: Date.now()
    }]);
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Polling Logic
  useEffect(() => {
    if (!pollingId) return;

    const interval = setInterval(async () => {
      try {
        const result = await assistantService.checkStatus(pollingId);
        if (result.status === RequestStatus.COMPLETED && result.response) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: result.response!,
            timestamp: Date.now()
          }]);
          setPollingId(null);
          setIsTyping(false);
        } else if (result.status === RequestStatus.FAILED) {
           setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I apologize, but I encountered an error processing your request. Please try again.",
            timestamp: Date.now()
          }]);
          setPollingId(null);
          setIsTyping(false);
        }
      } catch (e) {
        console.error("Polling error", e);
        setPollingId(null);
        setIsTyping(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pollingId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const messageContent = input;
    setInput('');
    setIsTyping(true);

    try {
      // Create session if needed
      let sessionId = currentSessionId;
      if (!sessionId) {
        const newSession = await assistantService.createSession('New Consultation');
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setSessions(prev => [newSession, ...prev]);
      }

      // Send message with engine and style
      await assistantService.sendMessageWithEngine(
        messageContent,
        sessionId,
        selectedEngine,
        selectedStyle
      );
      
      // For now, we'll simulate the polling (you may need to adjust based on your API response)
      setPollingId(Date.now().toString());
    } catch (err) {
      console.error('Send message error:', err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I apologize, Please make sure you have added a valid Api Key.",
        timestamp: Date.now()
      }]);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await assistantService.createSession('New Consultation');
      setCurrentSessionId(newSession.id);
      setSessions(prev => [newSession, ...prev]);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.name || 'User'}, I am your Pocket Lawyer AI assistant. How can I help you today? \n\n*Note: I am an AI, not a human lawyer. My advice is for informational purposes only.*`,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Today
          </div>
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => {
                setCurrentSessionId(session.id);
                // Load session messages
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors group mb-1"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-medium text-gray-700 truncate">{session.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{session.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.plan === 'free' ? 'Basic Plan' : 'Premium Plan'}</p>
            </div>
            <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="font-semibold text-gray-900">Pocket Lawyer AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {showMenuDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  <Link
                    to="/"
                    onClick={() => setShowMenuDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <Home className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Home</div>
                      <div className="text-xs text-gray-500">Back to main page</div>
                    </div>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMenuDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <Layout className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Dashboard</div>
                      <div className="text-xs text-gray-500">View your dashboard</div>
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowMenuDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Settings</div>
                      <div className="text-xs text-gray-500">Account settings</div>
                    </div>
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setShowMenuDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Subscription</div>
                      <div className="text-xs text-gray-500">Manage your plan</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-teal-500 to-teal-600'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Scale className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-3 max-w-2xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {/* Engine and Style Selection */}
            <div className="flex items-center gap-3 mb-3">
              {/* Engine Selection */}
              <div className="relative">
                <button
                  onClick={() => setShowEngineDropdown(!showEngineDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <span>{engines.find(e => e.id === selectedEngine)?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
                {showEngineDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {engines.map(engine => (
                      <button
                        key={engine.id}
                        onClick={() => {
                          setSelectedEngine(engine.id);
                          setShowEngineDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">{engine.name}</div>
                        <div className="text-xs text-gray-500">{engine.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Style Selection */}
              <div className="relative">
                <button
                  onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  <span className="w-4 h-4 text-gray-600">🎭</span>
                  <span>{styles.find(s => s.id === selectedStyle)?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
                {showStyleDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {styles.map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setShowStyleDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">{style.name}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>Disclaimer:</strong> Pocket Lawyer is an AI tool, not a law firm. Information provided is not legal advice. 
                  <Link to="/terms" className="underline ml-1">Learn more</Link>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="relative">
              <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Ask me anything about legal matters..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-gray-900 placeholder-gray-500 text-sm"
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;