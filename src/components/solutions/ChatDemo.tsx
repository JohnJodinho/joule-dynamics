import { useState, type ChangeEvent, type KeyboardEvent } from "react";

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
      const response = await fetch(
        "https://johnalbarkaibrahim-sentimentscope.hf.space/api/rag/chat",
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
      console.error("ChatDemo request failed", error);
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
    <div className="flex h-full min-h-[360px] flex-col rounded-3xl border border-border bg-card/90 p-4 text-sm shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Amara Home & Kitchen Support</p>
          <p className="text-xs text-muted-foreground">Ask product, shipping, returns, or warranty questions.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Live demo
        </span>
      </div>

      <div className="flex-1 overflow-y-auto rounded-3xl border border-border/80 bg-slate-50/80 p-4 shadow-inner transition-all duration-200">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-white text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="sr-only" htmlFor="chat-question-input">
          Ask a question
        </label>
        <textarea
          id="chat-question-input"
          rows={2}
          value={question}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type your question here..."
          className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {loading ? "Thinking..." : "Press Enter or click Ask."}
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}
