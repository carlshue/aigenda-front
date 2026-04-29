"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCurrentUser, isValidUser } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (user: string) => {
    if (isValidUser(user)) {
      setCurrentUser(user);
      router.push("/chat");
    } else {
      setError("Usuario no válido");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          width: 340,
          padding: "40px",
          borderRadius: 12,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
            </svg>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
            Genda
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
            Memoria Personal & Agenda
          </p>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
            Selecciona tu usuario
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
            Continúa con tu cuenta
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#ef44441a",
              border: "1px solid #ef444440",
              color: "#ef4444",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* User Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => handleLogin("carlos")}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--accent)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            👨 Carlos
          </button>
          <button
            onClick={() => handleLogin("maría")}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
          >
            👩 María
          </button>
        </div>

        {/* Info */}
        <p
          style={{
            margin: "20px 0 0",
            padding: "12px",
            borderRadius: 6,
            background: "var(--bg-elevated)",
            fontSize: 11,
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          Cada usuario mantiene sus propios datos de forma separada.
        </p>
      </div>
    </div>
  );
}
