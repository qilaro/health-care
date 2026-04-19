"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, AlertTriangle, Sparkles } from "lucide-react";
import { api, ChatHistoryItem } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm MedQ AI, your personal medication assistant powered by Google Gemini. I can help you understand drugs, side effects, interactions, and general medication questions. What would you like to know? 💊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const history: ChatHistoryItem[] = messages.slice(-6).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      const data = await api.chatbot(userMessage, history);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I apologize, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What is Metformin used for?",
    "What are common blood pressure medications?",
    "Can I take ibuprofen with blood thinners?",
    "What are the side effects of statins?",
  ];

  return (
    <div className="container-medq py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
          <Bot className="h-6 w-6" style={{ color: "#DB3924" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">MedQ AI Assistant</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Powered by Google Gemini
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-700">
          <strong>Medical Disclaimer:</strong> MedQ AI provides general information only. Always consult a qualified healthcare professional before making medical decisions. In emergencies, call 911.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${message.role === "assistant" ? "" : "bg-navy"}`} style={message.role === "assistant" ? { backgroundColor: "#DB3924" } : {}}>
                {message.role === "assistant" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === "user" ? "text-white" : "bg-gray-50 border border-gray-100"}`} style={message.role === "user" ? { backgroundColor: "#DB3924" } : {}}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#DB3924" }}>
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100 hover:bg-red-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about medications, dosages, side effects..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#DB3924" }}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
