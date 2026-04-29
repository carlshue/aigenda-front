"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ingestText, queryText, IngestResponse, QueryResponse } from "@/lib/api";

type Mode = "ask" | "store";

interface Message {
  id: string;
  role: "user" | "assistant";
  mode: Mode;
  text: string;
  ingestData?: IngestResponse;
  queryData?: QueryResponse;
  error?: string;
}

function IngestResult({ data }: { data: IngestResponse }) {
  const hasSaved = data.saved_entities.length > 0;
  const hasCreated = data.created_templates.length > 0;
  const hasEvolved = data.evolved_templates.length > 0;
  const hasErrors = data.errors.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      {hasSaved && (
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Entidades guardadas
          </p>
          {data.saved_entities.map((e) => (
            <div
              key={e.id}
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 10px",
                marginBottom: 4,
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{e.template}</span>
              <span style={{ color: "var(--text-muted)", marginLeft: 6, fontSize: 11 }}>({e.action})</span>
              <pre style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-secondary)", whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)" }}>
                {JSON.stringify(e.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
      {hasCreated && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
          Nuevos schemas: {data.created_templates.map((t) => <strong key={t.name} style={{ color: "var(--text-primary)" }}> {t.name}</strong>)}
        </p>
      )}
      {hasEvolved && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
          Schemas evolucionados: {data.evolved_templates.map((t) => (
            <span key={t.name}> <strong style={{ color: "var(--text-primary)" }}>{t.name}</strong> (+{t.new_fields.join(", ")})</span>
          ))}
        </p>
      )}
      {hasErrors && (
        <p style={{ margin: 0, fontSize: 12, color: "#f87171" }}>Errores: {data.errors.join(", ")}</p>
      )}
      {!hasSaved && !hasErrors && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Sin entidades nuevas.</p>
      )}
    </div>
  );
}

function QueryResult({ data }: { data: QueryResponse }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)" }}>{data.answer}</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {data.confidence !== undefined && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Confianza: {Math.round(data.confidence * 100)}%
          </span>
        )}
        {data.intent && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Intent: {data.intent}
          </span>
        )}
      </div>

      {data.related && data.related.length > 0 && (
        <div>
          <p style={{ margin: "4px 0", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Relacionados
          </p>
          {data.related.map((r, i) => (
            <pre
              key={i}
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                color: "var(--text-secondary)",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 10px",
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-mono)",
              }}
            >
              {JSON.stringify(r, null, 2)}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
}

function MsgBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div
          style={{
            maxWidth: "72%",
            background: "var(--user-bubble)",
            border: "1px solid var(--user-bubble-border)",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 14px",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: msg.mode === "store" ? "#34d399" : "#818cf8",
                background: msg.mode === "store" ? "#34d39918" : "#818cf818",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              {msg.mode === "store" ? "Almacenar" : "Consultar"}
            </span>
          </div>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 10, maxWidth: "82%" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
          </svg>
        </div>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px 16px 16px 16px",
            padding: "10px 14px",
            fontSize: 14,
          }}
        >
          {msg.error ? (
            <p style={{ margin: 0, color: "#f87171" }}>Error: {msg.error}</p>
          ) : msg.ingestData ? (
            <IngestResult data={msg.ingestData} />
          ) : msg.queryData ? (
            <QueryResult data={msg.queryData} />
          ) : (
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>{msg.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
        </svg>
      </div>
      <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px 16px 16px 16px" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--text-muted)",
              display: "inline-block",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("ask");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      mode,
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (mode === "store") {
        const data = await ingestText(text);
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          mode,
          text: "",
          ingestData: data,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const data = await queryText(text);
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          mode,
          text: "",
          queryData: data,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        mode,
        text: "",
        error: err instanceof Error ? err.message : "Error desconocido",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, mode, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-base)" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {isEmpty && !loading && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
                </svg>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>Genda</h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Almacena información en modo <strong>Almacenar</strong> o haz consultas en modo <strong>Consultar</strong>.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <MsgBubble key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-sidebar)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {(["ask", "store"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: mode === m ? "var(--accent)" : "var(--border)",
                  background: mode === m ? "var(--accent-dim)" : "transparent",
                  color: mode === m ? "var(--accent)" : "var(--text-muted)",
                  fontSize: 12,
                  fontWeight: mode === m ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {m === "ask" ? "Consultar" : "Almacenar"}
              </button>
            ))}
          </div>

          {/* Textarea + send */}
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === "ask" ? "¿Qué quieres saber?" : "¿Qué quieres almacenar?"}
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-primary)",
                maxHeight: 160,
                overflowY: "auto",
                fontFamily: "var(--font-geist-sans)",
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "none",
                background: input.trim() && !loading ? "var(--accent)" : "var(--bg-elevated)",
                color: input.trim() && !loading ? "white" : "var(--text-muted)",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
