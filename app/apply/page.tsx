'use client';

import { useState, useRef, useEffect } from 'react';
import { AppHeader } from '../components/AppHeader';

type Role = 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

const WELCOME: Message = {
  role: 'assistant',
  content:
    "Hi, I'm here to help you apply for FEMA disaster assistance for the first time. This usually takes around 30 minutes on DisasterAssistance.gov, and I'll walk you through every step.\n\nFirst — what type of disaster affected you? For example: hurricane, flood, tornado, wildfire, or something else.",
};

export default function ApplyPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    const assistantPlaceholder: Message = { role: 'assistant', content: '' };
    setMessages([...nextMessages, assistantPlaceholder]);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: 'assistant', content: accumulated }]);
      }
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: "I'm sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <AppHeader backHref="/" backLabel="Home" subtitle="First-time Applicant Guide" />

      {/* FEMA info banner */}
      <div className="bg-blue-950 text-blue-100 text-xs text-center py-2 px-4">
        This guide helps you register at{' '}
        <a
          href="https://www.disasterassistance.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white transition-colors"
        >
          DisasterAssistance.gov
        </a>
        {' '}— the official FEMA application site. Free &amp; no account required here.
      </div>

      {/* Chat window */}
      <main
        id="main-content"
        className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-6 gap-4"
      >
        <div className="flex-1 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-950 to-blue-700 flex items-center justify-center mr-2 mt-1 shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                } ${msg.role === 'assistant' && msg.content === '' ? 'animate-pulse' : ''}`}
              >
                {msg.content === '' && msg.role === 'assistant' ? (
                  <span className="text-slate-400">Thinking…</span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 pt-2 pb-4 bg-slate-50">
          <div className="flex gap-2 items-end bg-white border border-slate-200 rounded-2xl shadow-sm p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your message… (Enter to send)"
              disabled={loading}
              aria-label="Message input"
              className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none px-2 py-1.5 max-h-32 disabled:opacity-50"
              style={{ lineHeight: '1.5' }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </main>
    </div>
  );
}
