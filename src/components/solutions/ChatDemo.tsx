import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react";

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

interface RagResponse {
  answer?: string;
  response?: string;
  message?: string;
}

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Hi! Ask me anything about Amara Home & Kitchen — shipping, returns, warranty, you name it.",
  },
];

export default function ChatDemo() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const getAssistantText = (data?: RagResponse): string => {
    return (
      data?.answer ?? data?.response ?? data?.message ??
      "I couldn't parse the response correctly. Please try again."
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    appendMessage({ role: "user", text: trimmed });
    setQuestion("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_CHAT_API_URL ?? "https://johnalbarkaibrahim-sentimentscope.hf.space/api/rag/chat";
      const response = await fetch(
        apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: trimmed }),
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = (await response.json()) as RagResponse;
      appendMessage({ role: "assistant", text: getAssistantText(data) });
    } catch (error) {
      appendMessage({
        role: "assistant",
        text: "Sorry, I couldn't fetch an answer right now. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-card p-4 text-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Amara Home & Kitchen Support</p>
          <p className="text-xs text-muted-foreground">Ask product, shipping, returns, or warranty questions.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Live demo
        </span>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md border border-border bg-muted/30 p-4 shadow-inner transition-all duration-200" aria-live="polite">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-secondary text-secondary-foreground rounded-bl-sm px-3 py-2 text-sm shadow-sm">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="sr-only" htmlFor="chat-question-input">
          Ask a question
        </label>
        <textarea
          id="chat-question-input"
          ref={inputRef}
          rows={2}
          value={question}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type your question here..."
          className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-muted"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {loading ? "Thinking..." : "Press Enter or click Ask."}
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}
