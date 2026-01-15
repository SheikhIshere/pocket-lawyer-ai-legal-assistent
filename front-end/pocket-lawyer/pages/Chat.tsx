import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Mic, AlertTriangle } from 'lucide-react';
import { generateLegalAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hello! I am Pocket Lawyer AI. How can I assist you with your legal questions today? \n\n*Please note: I provide information, not legal advice.*',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Call Gemini Service
    const responseText = await generateLegalAdvice(userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-slate-100">
      {/* Sidebar (Desktop only) */}
      <div className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col">
        <div className="p-4 border-b border-slate-200">
          <button className="w-full py-2 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition">
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent</p>
           {['Rental Agreement Review', 'Traffic Ticket Help', 'Small Claims Process'].map((t, i) => (
             <div key={i} className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700 truncate">
               {t}
             </div>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center space-x-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <div>
               <h2 className="font-semibold text-slate-800">AI Legal Assistant</h2>
               <p className="text-xs text-slate-500">Pro Plan • Encrypted</p>
             </div>
          </div>
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Disclaimer */}
        <div className="bg-yellow-50 px-4 py-2 flex items-center justify-center text-xs text-yellow-800 border-t border-yellow-100">
           <AlertTriangle size={12} className="mr-2" />
           Information provided is for educational purposes only and not a substitute for professional legal advice.
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-slate-200">
          <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary-500 transition">
             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
               <Paperclip size={20} />
             </button>
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyPress}
               placeholder="Ask your legal question..." 
               className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-slate-800 placeholder-slate-400"
               rows={1}
               style={{ minHeight: '44px' }}
             />
             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
               <Mic size={20} />
             </button>
             <button 
               onClick={handleSend}
               disabled={!input.trim() || isLoading}
               className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
             >
               <Send size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;