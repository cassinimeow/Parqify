'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';

const QA_DATABASE = [
  {
    keywords: ['book', 'reserve', 'find', 'park'],
    question: 'How do I book a parking slot?',
    answer: 'To book a parking slot, go to your Dashboard and click "Find Parking", or click on the "Parking" link in the navigation menu. Select your campus lot, pick a green (Available) slot on the map, and click "Confirm Booking".'
  },
  {
    keywords: ['cancel', 'delete', 'remove'],
    question: 'How do I cancel my booking?',
    answer: 'Currently, you can complete your booking by viewing your Digital Ticket and clicking "Complete Parking". If you need to cancel an active reservation before entering, please contact the admin.'
  },
  {
    keywords: ['password', 'reset', 'forgot'],
    question: 'How do I reset my password?',
    answer: 'If you are logged out, click "Forgot Password" on the Login page. If you are logged in, go to your Settings page from the top-right dropdown menu to update your password securely.'
  },
  {
    keywords: ['pay', 'cost', 'fee', 'rate'],
    question: 'How much does parking cost?',
    answer: 'Parqify is currently a community project for PUP Manila. Parking rates and fees depend on the specific rules of the PUP campus administration.'
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    question: 'Say Hello',
    answer: 'Hello! Welcome to Parqify. How can I help you with your parking experience today?'
  }
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I am Parqibot. You can ask me a question or choose from the options below!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text }]);
    setInputValue('');

    // Simulate slight delay for bot thinking
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let foundAnswer = null;

      // Simple keyword matching
      for (const item of QA_DATABASE) {
        if (item.keywords.some((kw) => lowerText.includes(kw))) {
          foundAnswer = item.answer;
          break;
        }
      }

      if (!foundAnswer) {
        foundAnswer = "I'm sorry, I don't quite understand that yet. Try asking about booking, passwords, or fees!";
      }

      setMessages((prev) => [...prev, { type: 'bot', text: foundAnswer }]);
    }, 600);
  };

  const handleOptionClick = (qaItem) => {
    handleSend(qaItem.question);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl mb-4 w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-brand-maroon-800 text-white p-4 flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-lg">Parqibot</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-brand-maroon-800 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-foreground rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Options (Only show if last message is from bot) */}
          {messages.length > 0 && messages[messages.length - 1].type === 'bot' && (
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2">
              {QA_DATABASE.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(item)}
                  className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  {item.question}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-transparent focus:border-brand-maroon-800 focus:ring-1 focus:ring-brand-maroon-800 rounded-full pl-4 pr-12 py-2.5 text-sm transition-all"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="absolute right-1 p-2 bg-brand-maroon-800 text-white rounded-full disabled:opacity-50 hover:bg-brand-maroon-900 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? 'bg-zinc-800 text-white hover:bg-zinc-700 rotate-90 scale-90'
            : 'bg-brand-maroon-800 text-white hover:bg-brand-maroon-900 hover:scale-105 animate-bounce'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
