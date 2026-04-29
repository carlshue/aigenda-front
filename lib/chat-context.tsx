"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ChatResponse } from "./api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  data?: ChatResponse;
  error?: string;
}

export interface ContextMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatContextValue {
  messages: Message[];
  addMessage: (msg: Message) => void;
  getContextWindow: () => ContextMessage[];
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = "genda_chat";
const MAX_STORED = 30;
const CONTEXT_WINDOW = 5;

function serializeAssistant(msg: Message): string {
  if (msg.error) return `[error] ${msg.error}`;
  if (!msg.data) return "";
  const d = msg.data;
  if (d.intent === "query") return `[consulta] ${d.answer}`;
  if (d.intent === "interact") return `[examen] ${d.answer}`;
  const saved = d.saved_entities.map((e) => `${e.template}: ${JSON.stringify(e.data)}`).join("; ");
  return `[guardado] ${saved || "sin entidades"}`;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {}
  }, [messages]);

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  function getContextWindow(): ContextMessage[] {
    return messages.slice(-CONTEXT_WINDOW).map((m) => ({
      role: m.role,
      content: m.role === "user" ? m.text : serializeAssistant(m),
    })).filter((m) => m.content);
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage, getContextWindow, loading, setLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}
