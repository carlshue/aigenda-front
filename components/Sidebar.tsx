"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/project-context";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconSchemas = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Modal crear proyecto ─────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreate }: {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreate: (name: string, desc?: string) => Promise<any>;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(name.trim(), desc.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 24, width: 340,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
          Nuevo proyecto
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Nombre *
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Clases de inglés"
              style={{
                display: "block", width: "100%", marginTop: 6,
                padding: "8px 10px", borderRadius: 6,
                border: "1px solid var(--border)", background: "var(--bg-input)",
                color: "var(--text-primary)", fontSize: 13,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Descripción
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Opcional"
              style={{
                display: "block", width: "100%", marginTop: 6,
                padding: "8px 10px", borderRadius: 6,
                border: "1px solid var(--border)", background: "var(--bg-input)",
                color: "var(--text-primary)", fontSize: 13,
              }}
            />
          </div>
          {error && (
            <p style={{ margin: 0, fontSize: 12, color: "#f87171" }}>{error}</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: 13,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6,
                border: "none", background: "var(--accent)",
                color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600,
                opacity: !name.trim() || loading ? 0.5 : 1,
              }}
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const GLOBAL_NAV = [
  { href: "/chat", label: "Chat", icon: <IconChat /> },
  { href: "/calendar", label: "Calendario", icon: <IconCalendar /> },
  { href: "/schemas", label: "Schemas", icon: <IconSchemas /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects();

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

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id, false); // cascade=false → archiva, no borra datos globales
      setConfirmDelete(null);
      if (pathname.startsWith(`/projects/${id}`)) {
        router.push("/chat");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <aside
        style={{
          width: isMobile ? 52 : 220,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          padding: isMobile ? "16px 6px" : "16px 10px",
          gap: 0,
          transition: "width 0.2s",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "4px 6px 20px", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08 1.99 0 5.97 1.08 6 3.08a7.17 7.17 0 0 1-6 3.22z" />
            </svg>
          </div>
          {!isMobile && <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Genda</span>}
        </div>

        {/* Global nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {GLOBAL_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} isMobile={isMobile} />
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "16px 0 12px" }} />

        {/* Proyectos */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {/* Header sección */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "space-between",
            padding: "0 6px", marginBottom: 8,
          }}>
            {!isMobile && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Proyectos
              </span>
            )}
            <button
              title="Nuevo proyecto"
              onClick={() => setShowCreateModal(true)}
              style={{
                width: 22, height: 22, borderRadius: 4, border: "1px solid var(--border)",
                background: "transparent", color: "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <IconPlus />
            </button>
          </div>

          {/* Lista de proyectos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {projectsLoading && projects.length === 0 && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 6px", margin: 0 }}>
                {isMobile ? "·" : "Cargando..."}
              </p>
            )}
            {!projectsLoading && projects.length === 0 && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 6px", margin: 0 }}>
                {isMobile ? "" : "Sin proyectos"}
              </p>
            )}
            {projects.map((project) => {
              const active = pathname.startsWith(`/projects/${project.id}`);
              return (
                <div
                  key={project.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    borderRadius: 7,
                    background: active ? "var(--bg-elevated)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    title={isMobile ? project.name : undefined}
                    style={{
                      flex: 1, minWidth: 0,
                      display: "flex", alignItems: "center",
                      gap: isMobile ? 0 : 7,
                      padding: isMobile ? "8px 0" : "7px 6px",
                      justifyContent: isMobile ? "center" : "flex-start",
                      textDecoration: "none",
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      fontSize: 13, fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span style={{ color: active ? "var(--accent)" : "inherit", flexShrink: 0, display: "flex" }}>
                      <IconFolder />
                    </span>
                    {!isMobile && (
                      <span style={{
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {project.name}
                      </span>
                    )}
                  </Link>
                  {!isMobile && (
                    confirmDelete === project.id ? (
                      <div style={{ display: "flex", gap: 3, paddingRight: 4, flexShrink: 0 }}>
                        <button
                          title="Confirmar borrar"
                          onClick={() => handleDeleteProject(project.id)}
                          style={{
                            padding: "2px 6px", borderRadius: 4, border: "none",
                            background: "#7f1d1d", color: "#fca5a5", fontSize: 10, cursor: "pointer", fontWeight: 600,
                          }}
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)",
                            background: "transparent", color: "var(--text-muted)", fontSize: 10, cursor: "pointer",
                          }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        title="Archivar proyecto"
                        onClick={(e) => { e.preventDefault(); setConfirmDelete(project.id); }}
                        style={{
                          width: 20, height: 20, borderRadius: 4, border: "none",
                          background: "transparent", color: "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0, marginRight: 4,
                          transition: "color 0.15s",
                        }}
                        className="project-delete-btn"
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "transparent")}
                      >
                        <IconX />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer usuario */}
        {!isMobile && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 8 }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 10px 6px" }}>
              LLM Memory & Agenda
            </p>
            {user && (
              <>
                <div style={{
                  padding: "7px 8px", borderRadius: 6,
                  background: "var(--bg-elevated)", marginBottom: 8,
                }}>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 3px", textTransform: "uppercase" }}>
                    Usuario
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", padding: "6px 10px", borderRadius: 6,
                    border: "1px solid var(--border)", background: "var(--bg-surface)",
                    color: "var(--text-secondary)", fontSize: 12, cursor: "pointer",
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

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createProject}
        />
      )}
    </>
  );
}

// ─── NavItem helper ───────────────────────────────────────────────────────────

function NavItem({ href, label, icon, active, isMobile }: {
  href: string; label: string; icon: React.ReactNode; active: boolean; isMobile: boolean;
}) {
  return (
    <Link
      href={href}
      title={isMobile ? label : undefined}
      style={{
        display: "flex", alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: isMobile ? 0 : 9, padding: "8px 8px",
        borderRadius: 7, textDecoration: "none", fontSize: 13,
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
      <span style={{ color: active ? "var(--accent)" : "inherit", display: "flex" }}>{icon}</span>
      {!isMobile && label}
    </Link>
  );
}
