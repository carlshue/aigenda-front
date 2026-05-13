"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/project-context";
import { getProject, getProjectMembers, getProjectEntities } from "@/lib/api";
import type { Project, ProjectMember, ProjectEntity } from "@/lib/api";
import { useIsMobile } from "@/lib/useIsMobile";

type Tab = "entidades" | "miembros" | "info";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function entityLabel(data: Record<string, unknown>): string {
  const keys = ["nombre", "name", "title", "titulo", "id"];
  for (const k of keys) {
    if (data[k] && typeof data[k] === "string") return data[k] as string;
  }
  const vals = Object.values(data).filter((v) => typeof v === "string" && v.length < 60);
  return (vals[0] as string) ?? "—";
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Pill({ label, color = "var(--accent)" }: { label: string; color?: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>
      {label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)", fontSize: 13 }}>
      {message}
    </div>
  );
}

function EntityCard({ entity }: { entity: ProjectEntity }) {
  const [expanded, setExpanded] = useState(false);
  const label = entityLabel(entity.data);
  const fields = Object.entries(entity.data);

  return (
    <div
      style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 8, overflow: "hidden",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div
        style={{
          padding: "10px 14px", display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: "pointer", gap: 8,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Pill label={entity.template} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 12, flexShrink: 0 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>
      {expanded && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
            <tbody>
              {fields.map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: "3px 0", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", width: 120, verticalAlign: "top" }}>
                    {k}
                  </td>
                  <td style={{ padding: "3px 0", fontSize: 12, color: "var(--text-secondary)", wordBreak: "break-word" }}>
                    {String(v ?? "—")}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: "3px 0", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  creado
                </td>
                <td style={{ padding: "3px 0", fontSize: 12, color: "var(--text-secondary)" }}>
                  {formatDate(entity.created_at)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: ProjectMember }) {
  const label = entityLabel(member.entity_data);
  const attrs = Object.entries(member.attributes || {});

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "12px 14px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      {/* Avatar letra */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: "var(--accent-dim)",
        border: "1px solid var(--accent)", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: "var(--accent)",
      }}>
        {label.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
          <Pill label={member.role} color="#a78bfa" />
          <Pill label={member.entity_template} color="#6b7280" />
        </div>
        {attrs.length > 0 && (
          <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {attrs.map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text-secondary)" }}>{k}:</strong> {String(v)}
              </span>
            ))}
          </div>
        )}
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
          Unido {formatDate(member.joined_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ProjectView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { projects, deleteProject } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [entities, setEntities] = useState<ProjectEntity[]>([]);
  const [tab, setTab] = useState<Tab>("entidades");
  const [loading, setLoading] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Cargar proyecto
  useEffect(() => {
    setLoading(true);
    setError("");
    getProject(projectId)
      .then(setProject)
      .catch(() => setError("Proyecto no encontrado"))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Cargar datos según tab
  useEffect(() => {
    if (!project) return;
    setLoadingTab(true);

    const load = async () => {
      try {
        if (tab === "entidades") {
          const data = await getProjectEntities(projectId);
          setEntities(data);
        } else if (tab === "miembros") {
          const data = await getProjectMembers(projectId);
          setMembers(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTab(false);
      }
    };

    load();
  }, [tab, project, projectId]);

  const handleDelete = async () => {
    try {
      await deleteProject(projectId, false);
      router.push("/chat");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Cargando...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <p style={{ color: "var(--text-muted)" }}>{error || "Proyecto no encontrado"}</p>
        <button onClick={() => router.push("/chat")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13 }}>
          Volver al chat
        </button>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "entidades", label: "Entidades" },
    { id: "miembros", label: "Miembros" },
    { id: "info", label: "Info" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? "16px" : "24px 32px 0",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-sidebar)",
        flexShrink: 0,
      }}>
        {/* Título + acciones */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {project.name}
              </h1>
            </div>
            {project.description && (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", maxWidth: 600 }}>
                {project.description}
              </p>
            )}
          </div>

          {/* Botón borrar */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                padding: "7px 12px", borderRadius: 6, flexShrink: 0,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer", fontSize: 12,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              Archivar
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>¿Confirmar?</span>
              <button
                onClick={handleDelete}
                style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#7f1d1d", color: "#fca5a5", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}
              >
                No
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
          {[
            { label: "Entidades", value: project.entity_count ?? "—" },
            { label: "Miembros", value: project.member_count ?? "—" },
            { label: "Creado", value: formatDate(project.created_at) },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
                {s.label}
              </p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 16px",
                borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                border: "none",
                background: "transparent",
                color: tab === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: tab === t.id ? 600 : 400,
                fontSize: 13, cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del tab */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px 32px" }}>
        {loadingTab && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>
            Cargando...
          </div>
        )}

        {!loadingTab && tab === "entidades" && (
          <>
            {entities.length === 0 ? (
              <EmptyState message="No hay entidades locales en este proyecto todavía. Chatea con el proyecto activo para añadir datos." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 800 }}>
                {entities.map((e) => <EntityCard key={e.id} entity={e} />)}
              </div>
            )}
          </>
        )}

        {!loadingTab && tab === "miembros" && (
          <>
            {members.length === 0 ? (
              <EmptyState message="No hay miembros en este proyecto. Los miembros son personas o lugares globales que aparecen en conversaciones dentro del proyecto." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 700 }}>
                {members.map((m) => <MemberCard key={m.membership_id} member={m} />)}
              </div>
            )}
          </>
        )}

        {!loadingTab && tab === "info" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden",
            }}>
              {[
                { label: "ID", value: project.id },
                { label: "Slug", value: project.slug },
                { label: "Tipo", value: project.canonical_type ?? "—" },
                { label: "Estado", value: project.status },
                { label: "Visibilidad cruzada", value: project.allow_cross_project_visibility ? "Activada" : "Desactivada" },
                { label: "Creado", value: formatDate(project.created_at) },
                { label: "Actualizado", value: formatDate(project.updated_at) },
              ].map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex", padding: "12px 16px",
                    borderBottom: i < 6 ? "1px solid var(--border)" : "none",
                    gap: 16,
                  }}
                >
                  <span style={{ width: 160, fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", wordBreak: "break-all" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
