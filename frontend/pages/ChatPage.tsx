import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { assistantService } from '../services/api';
import { ChatSession, Message, RequestStatus } from '../types';
import { Send, Plus, MessageSquare, Menu, Scale, User, MoreVertical, Paperclip, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setInput('');
    setIsTyping(true);

    try {
      const { requestId } = await assistantService.sendMessage(userMsg.content);
      setPollingId(requestId);
    } catch (err) {
      setIsTyping(false);
      // Handle error UI
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop: Static, Mobile: Overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white font-bold">
               <Scale className="w-5 h-5 text-teal-500" /> Pocket Lawyer
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/10">
              <Plus className="w-4 h-4" /> New Consultation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent</div>
            {sessions.map(session => (
              <button key={session.id} className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-medium text-slate-200 truncate">{session.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{session.date}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <img src={user?.avatar} alt="User" className="w-9 h-9 rounded-full bg-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.plan === 'free' ? 'Basic Plan' : 'Premium Plan'}</p>
              </div>
              <Link to="/profile" className="p-2 hover:bg-slate-800 rounded-lg">
                <SettingsIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full bg-white relative">
        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 bg-white z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 -ml-2 text-slate-600">
               <Menu className="w-6 h-6" />
             </button>
             <div>
               <h2 className="font-bold text-slate-800">Legal Assistant</h2>
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-xs text-slate-500">AI Active</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
               <MoreVertical className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-teal-600'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Scale className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex justify-start">
              <div className="flex max-w-[80%] gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-600">
                   <Scale className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
           {/* Disclaimer Banner */}
           <div className="mb-3 bg-yellow-50 border border-yellow-100 rounded-lg p-2 flex items-start gap-2">
             <div className="text-yellow-600 mt-0.5"><Scale className="w-3 h-3" /></div>
             <p className="text-[10px] text-yellow-800 leading-tight">
               Disclaimer: Pocket Lawyer is an AI tool, not a law firm. Information provided is not legal advice. 
               <Link to="/terms" className="underline ml-1">Learn more</Link>
             </p>
           </div>
           
           <form onSubmit={handleSendMessage} className="relative">
             <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-400 transition-all">
               <button type="button" className="p-2 text-slate-400 hover:text-teal-600 rounded-full hover:bg-slate-200 transition-colors">
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
                 placeholder="Type your legal question here..."
                 className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-slate-800 placeholder-slate-400 text-sm"
                 rows={1}
               />
               <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors shadow-sm"
               >
                 <Send className="w-4 h-4" />
               </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default ChatPage;