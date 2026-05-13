"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Tab = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Error en login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(email, name, password);
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Error en registro");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

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
          width: 380,
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => { setTab("login"); setError(""); }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: tab === "login" ? "var(--accent)" : "var(--bg-elevated)",
              color: tab === "login" ? "white" : "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Login
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: tab === "register" ? "var(--accent)" : "var(--bg-elevated)",
              color: tab === "register" ? "white" : "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 12px",
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

        {/* Form */}
        <form onSubmit={tab === "login" ? handleLogin : handleRegister}>
          {tab === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "var(--text-secondary)" }}>
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "var(--text-secondary)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 mayúscula, 1 número"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
            {tab === "register" && password && !passwordValid && (
              <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, margin: 0 }}>
                Mín 8 caracteres, 1 mayúscula, 1 número
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (tab === "register" && !passwordValid)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: isLoading || (tab === "register" && !passwordValid) ? "var(--bg-elevated)" : "var(--accent)",
              color: isLoading || (tab === "register" && !passwordValid) ? "var(--text-secondary)" : "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: isLoading || (tab === "register" && !passwordValid) ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Cargando..." : tab === "login" ? "Entrar" : "Registrarse"}
          </button>
        </form>

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
          {tab === "login"
            ? "¿No tienes cuenta? Haz clic en Registrarse"
            : "Ya tienes cuenta? Haz clic en Login"}
        </p>
      </div>
    </div>
  );
}
