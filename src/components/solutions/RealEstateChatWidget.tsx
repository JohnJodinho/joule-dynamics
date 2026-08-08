import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Send, X, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
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
  const [isErrorState, setIsErrorState] = useState(false);

  // Browser-scoped persistent session ID
  const [sessionId] = useState(() => crypto.randomUUID());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);



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
    setIsErrorState(false);

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
          session_id: sessionId,
          context: activeFilters
        })
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.path_used === "ERROR") {
        setIsErrorState(true);
        // Remove the optimistic user message if we want, or just leave it.
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.reply || "I couldn't parse the response. Please try again.",
            path: data.path_used,
            suggested_actions: data.suggested_actions
          }
        ]);
      }
    } catch (err) {
      setIsErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] p-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full shadow-lg flex items-center gap-2 transition-all"
        aria-label="Toggle Intelligence Assistant"
      >
        <Bot className="w-6 h-6" />
        {/* Hide text on small screens for responsiveness */}
        <span className="hidden sm:inline-block text-sm font-semibold pr-1">Ask Intelligence</span>
      </button>

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[400px] md:max-w-md bg-background border-l border-border shadow-2xl flex flex-col transition-transform transform translate-x-0">
          {/* Header */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-card">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Real Estate Intelligence</h3>
                <p className="text-xs text-muted-foreground">Scoped to Rate Monitor</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Read-Only Scope Notice */}
          <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="leading-snug">Answers grounded live from page data and methodology context.</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {isErrorState && (
              <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-3" />
                <p className="text-sm font-medium text-foreground">Real Estate Intelligence Layer experienced an issue. Resolving...</p>
                <button 
                  onClick={() => setIsErrorState(false)} 
                  className="mt-4 text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isLastMessage = idx === messages.length - 1;
              
              // Format data and dates
              let formattedText = msg.text;
              if (msg.sender === 'assistant') {
                formattedText = formattedText.replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/g, (_match) => {
                  try {
                    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(_match));
                  } catch { return _match; }
                });
                
                formattedText = formattedText.replace(/(\$?)(\d+)\.(\d{3,})(%?)/g, (_match, dollar, whole, frac, percent) => {
                  const num = parseFloat(`${whole}.${frac}`);
                  if (!dollar && !percent) {
                    return `$${num.toFixed(2)}`;
                  }
                  return `${dollar}${num.toFixed(2)}${percent}`;
                });
              }

              const markdownComponents: Components = {
                table: ({ children, ...props }) => (
                  <div className="w-full overflow-x-auto my-3 border border-border rounded-md">
                    <table className="w-full text-left border-collapse text-xs whitespace-nowrap" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th className="p-2 border-b border-border bg-muted font-semibold" {...props}>{children}</th>
                ),
                td: ({ children, ...props }) => (
                  <td className="p-2 border-b border-border/50" {...props}>{children}</td>
                ),
                a: ({ children, href, ...props }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline" {...props}>{children}</a>
                )
              };

              return (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-secondary text-secondary-foreground font-medium rounded-br-sm'
                      : 'bg-card text-foreground border border-border/50 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-muted-foreground prose-a:text-primary">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {formattedText}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{formattedText}</p>
                  )}
                </div>
                
                {/* Suggested Actions - only on last message */}
                {msg.sender === 'assistant' && msg.suggested_actions && msg.suggested_actions.length > 0 && isLastMessage && (
                  <div className="flex flex-wrap gap-2 mt-3 max-w-[90%]">
                    {msg.suggested_actions.map((action, actionIdx) => (
                      <button
                        key={actionIdx}
                        onClick={() => handleSend(action)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground text-muted-foreground bg-transparent transition-colors disabled:opacity-50 text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-transparent text-muted-foreground py-2 px-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs font-medium">Running tool...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Quick Questions */}
          {messages.length <= 2 && (
            <div className="p-3 border-t border-border bg-card/50">
              <p className="text-[11px] text-muted-foreground mb-2 font-medium">Suggested questions:</p>
              <div className="flex flex-col gap-1.5">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-left text-xs text-primary hover:bg-accent hover:text-accent-foreground p-1.5 rounded transition-colors"
                  >
                    → {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-4 border-t border-border bg-card">
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
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center w-10 h-10"
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
