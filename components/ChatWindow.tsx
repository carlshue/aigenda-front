"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { sendChat, IngestResponse, QueryResponse, InteractResponse, ChatResponse } from "@/lib/api";
import { useChatContext, Message } from "@/lib/chat-context";

function IngestResult({ data }: { data: IngestResponse }) {
  const created = data.entities_created ?? [];
  const updated = data.entities_updated ?? [];
  const facts = data.facts_created ?? [];
  const templates = data.templates_created ?? [];
  const hasCreated = created.length > 0;
  const hasUpdated = updated.length > 0;
  const hasFacts = facts.length > 0;
  const hasTemplates = templates.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.message && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>
          {data.message}
        </p>
      )}
      {hasCreated && (
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Entidades creadas
          </p>
          {created.map((e) => (
            <div
              key={e.id}
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "7px 10px",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{e.template}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#34d399",
                    background: "#34d39918",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  nuevo
                </span>
              </div>
              <pre style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)", whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)" }}>
                {JSON.stringify(e.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
      {hasUpdated && (
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Entidades actualizadas
          </p>
          {updated.map((e) => (
            <div
              key={e.id}
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "7px 10px",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{e.template}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#818cf8",
                    background: "#818cf818",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  actualizado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasFacts && (
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Relaciones creadas
          </p>
          {facts.map((f) => (
            <div
              key={f.id}
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "7px 10px",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{f.predicate}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#8b5cf6",
                    background: "#8b5cf618",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  {Math.round(f.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasTemplates && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
          Schemas creados:{" "}
          {templates.map((t, i) => (
            <strong key={t} style={{ color: "var(--text-primary)" }}>
              {t}{i < templates.length - 1 ? ", " : ""}
            </strong>
          ))}
        </p>
      )}
      {!hasCreated && !hasUpdated && !hasFacts && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Sin cambios.</p>
      )}
    </div>
  );
}

function QueryResult({ data }: { data: QueryResponse }) {
  const confidence = typeof data.confidence === "number"
    ? Math.round(data.confidence * 100)
    : data.confidence;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text-primary)" }}>
        {data.answer}
      </p>
      {data.confidence !== undefined && (
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Confianza: {confidence}{typeof data.confidence === "number" ? "%" : ""}
        </span>
      )}
      {data.related && data.related.length > 0 && (
        <div>
          <p style={{ margin: "4px 0 6px", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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

function IntentBadge({
  intent,
}: {
  intent: "ingest" | "generate" | "update" | "query" | "interact";
}) {
  const map = {
    query:    { label: "Consulta",    color: "#818cf8", bg: "#818cf818" },
    interact: { label: "Examen",      color: "#f59e0b", bg: "#f59e0b18" },
    ingest:   { label: "Almacenado",  color: "#34d399", bg: "#34d39918" },
    generate: { label: "Almacenado",  color: "#34d399", bg: "#34d39918" },
    update:   { label: "Actualizado", color: "#22c55e", bg: "#22c55e18" },
  };

  const { label, color, bg } = map[intent] ?? map.ingest;

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color,
        background: bg,
        padding: "2px 7px",
        borderRadius: 4,
        marginBottom: 6,
        display: "inline-block",
      }}
    >
      {label}
    </span>
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
            <p style={{ margin: 0, color: "#f87171", fontSize: 13 }}>Error: {msg.error}</p>
          ) : msg.data ? (
            <>
              <IntentBadge intent={msg.data.intent} />
              {msg.data.intent === "query" ? (
                <QueryResult data={msg.data as QueryResponse} />
              ) : msg.data.intent === "interact" ? (
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                  {(msg.data as InteractResponse).answer}
                </p>
              ) : (
                <IngestResult data={msg.data as IngestResponse} />
              )}
            </>
          ) : null}
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
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--text-muted)", display: "inline-block",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

export default function ChatWindow() {
  const { messages, addMessage, getContextWindow, loading, setLoading } = useChatContext();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    addMessage({ id: crypto.randomUUID(), role: "user", text });
    setInput("");
    setLoading(true);

    try {
      const data = await sendChat(text, getContextWindow());
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: "", data });
    } catch (err) {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        text: "",
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, addMessage, getContextWindow, setLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-base)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
                </svg>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>Genda</h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 360, marginInline: "auto" }}>
                Escribe libremente. Genda detecta si quieres guardar información o hacer una consulta.
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

      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-sidebar)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe algo para guardar o preguntar..."
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
              onClick={toggleListening}
              title={isListening ? "Detener grabación" : "Hablar"}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "none",
                background: isListening ? "#ef444420" : "var(--bg-elevated)",
                color: isListening ? "#ef4444" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s, color 0.15s",
                animation: isListening ? "pulse 1.2s ease-in-out infinite" : "none",
              }}
            >
              {isListening ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
              )}
            </button>
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
