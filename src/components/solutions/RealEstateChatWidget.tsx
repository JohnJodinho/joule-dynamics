import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Send, X, AlertCircle, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  sender: 'assistant' | 'user';
  text: string;
  path?: string;
  suggested_actions?: string[];
}

const STARTER_QUESTIONS = [
  "What is the average rate in Miami?",
  "Are there any rate spikes above 25% today?",
  "Explain how the 7-day trailing average works."
];

export default function RealEstateChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I'm your Real Estate Intelligence Assistant. Ask me about live rate volatility, property availability, or how our tracking methodology works."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Browser-scoped persistent session ID
  const sessionIdRef = useRef<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate UUID once for this tab's lifecycle
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInput('');
    setLoading(true);

    // Capture URL SearchParam Filters to send to backend
    const activeFilters = {
      market: searchParams.get('market') || 'all',
      platform: searchParams.get('platform') || 'all',
      bedrooms: searchParams.get('bedrooms') || 'all',
    };

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL ?? "https://johnalbarkaibrahim-sentimentscope.hf.space";
      const apiUrl = `${baseUrl}/api/v1/real-estate/chat`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionIdRef.current,
          context: activeFilters
        })
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply || "I couldn't parse the response. Please try again.",
          path: data.path_used,
          suggested_actions: data.suggested_actions
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: "Unable to reach the intelligence layer. Please try again shortly." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] p-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-full shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] flex items-center gap-2 transition-all"
        aria-label="Toggle Intelligence Assistant"
      >
        <Bot className="w-6 h-6" />
        {/* Hide text on small screens for responsiveness */}
        <span className="hidden sm:inline-block text-sm font-semibold pr-1">Ask Intelligence</span>
      </button>

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[400px] md:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-transform transform translate-x-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Real Estate Intelligence</h3>
                <p className="text-xs text-slate-400">Scoped to Rate Monitor</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Read-Only Scope Notice */}
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="leading-snug">Answers grounded live from page data and methodology context.</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-snug prose-a:text-emerald-400 hover:prose-a:text-emerald-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                  {msg.path && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                      Route: {msg.path}
                    </span>
                  )}
                </div>
                
                {/* Suggested Actions */}
                {msg.sender === 'assistant' && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.suggested_actions.map((action, actionIdx) => (
                      <button
                        key={actionIdx}
                        onClick={() => handleSend(action)}
                        disabled={loading}
                        className="text-xs px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 text-slate-400 p-3 rounded-lg text-xs animate-pulse rounded-bl-sm">
                  Analyzing database & methodology...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Quick Questions */}
          {messages.length <= 2 && (
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">Suggested questions:</p>
              <div className="flex flex-col gap-1.5">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-left text-xs text-emerald-400 hover:bg-slate-800/60 p-1.5 rounded transition-colors"
                  >
                    → {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rates, spikes..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-emerald-500 text-slate-950 p-2 rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center w-10 h-10"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
