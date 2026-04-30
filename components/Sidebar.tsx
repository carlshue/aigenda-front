"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";

const NAV_ITEMS = [
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "Calendario",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/schemas",
    label: "Schemas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    href: "/dashboards",
    label: "Dashboards",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8l3 3 2-2 3 3" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: isMobile ? 56 : 220,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        padding: isMobile ? "20px 8px" : "20px 12px",
        gap: 4,
        transition: "width 0.2s",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "4px 8px 24px", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
          </svg>
        </div>
        {!isMobile && (
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            Genda
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isMobile ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : "flex-start",
                gap: isMobile ? 0 : 10,
                padding: "9px 10px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                background: active ? "var(--bg-elevated)" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ color: active ? "var(--accent)" : "inherit", display: "flex" }}>
                {item.icon}
              </span>
              {!isMobile && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isMobile && (
        <div style={{ marginTop: "auto", padding: "8px 10px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 12px", paddingTop: 8 }}>
            LLM Memory & Agenda
          </p>
          {currentUser && (
            <>
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  background: "var(--bg-elevated)",
                  marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase" }}>
                  Usuario actual
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0, textTransform: "capitalize" }}>
                  {currentUser}
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
