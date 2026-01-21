import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../../types';

interface MessageProps {
  msg: Message;
}

export const ChatMessage: React.FC<MessageProps> = ({ msg }) => {
  return (
    <div className={`py-6 px-4 ${msg.role === 'user' ? 'bg-gray-800' : 'bg-transparent'} border-b border-gray-800`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
            ? 'bg-blue-600'
            : 'bg-green-600'
          }`}>
          {msg.role === 'user' ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-gray-100 prose prose-invert max-w-none text-sm leading-relaxed">
            {/* We use a simple whitespace-pre-wrap if not using markdown, but let's try to be smart. */}
            {/* Ideally import MarkdownRenderer here if we move it to a shared place. For now inline or simple text. */}
            {/* The user liked my 'fancy' markdown in the walkthrough, so let's stick to that but inside this component? */}
            {/* If I need ReactMarkdown, I need to import it. */}
            <span className="whitespace-pre-wrap font-sans">{msg.content}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
