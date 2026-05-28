"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const STARTER_QUESTIONS = [
  'מה זה "הדרך"?',
  "האם הפלטפורמה בחינם?",
  "איך מתחילים?",
  "מי רואה את השיחות שלי?",
];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "שלום! אני העוזר של הדרך. שאל אותי כל שאלה על הפלטפורמה — קורסים, מאמן AI, סימולטור, פרטיות, תשלום ועוד.",
};

function genId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FAQChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMsg: ChatMessage = { id: genId(), role: "user", text: clean };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data: { content?: string; error?: string } = await r.json();
      const reply: ChatMessage = {
        id: genId(),
        role: "assistant",
        text: data.content || data.error || "סליחה, נסה שוב.",
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: genId(), role: "assistant", text: "סליחה, יש בעיה בתקשורת. נסה שוב." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h3 className="text-base font-bold text-slate-900">שאל בצ'אט</h3>
        <p className="text-xs text-slate-500">תשובות מהירות על "הדרך" — בלי לדפדף בקטגוריות</p>
      </div>

      <div
        className="max-h-96 overflow-y-auto px-4 py-4"
        aria-live="polite"
        aria-label="היסטוריית שיחה"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`mb-2 flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-2 flex justify-end"
            >
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-slate-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="mb-2 text-xs font-semibold text-slate-500">שאלות פופולריות:</div>
          <div className="flex flex-wrap gap-2">
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex gap-2 border-t border-slate-100 px-4 py-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="כתוב שאלה..."
          disabled={loading}
          aria-label="הקלד שאלה"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="שלח שאלה"
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          שלח
        </button>
      </form>
    </div>
  );
}
