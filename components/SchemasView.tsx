"use client";

import { useState, useEffect, useCallback } from "react";
import { getTemplates, getEntities, deleteTemplate, Template, Entity } from "@/lib/api";

function SchemaFieldBadge({ field, type }: { field: string; type: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 20,
        background: "var(--bg-base)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
      }}
    >
      <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{field}</span>
      <span style={{ color: "var(--text-muted)" }}>:{type}</span>
    </span>
  );
}

function EntityRow({ entity }: { entity: Entity }) {
  const [expanded, setExpanded] = useState(false);
  const fields = Object.entries(entity.data);

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "8px 12px",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      onClick={() => setExpanded((v) => !v)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
          {fields.slice(0, 4).map(([k, v]) => (
            <span key={k} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--text-muted)" }}>{k}: </span>
              <span style={{ color: "var(--text-primary)" }}>
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </span>
            </span>
          ))}
          {fields.length > 4 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{fields.length - 4} más</span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            flexShrink: 0,
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {expanded && (
        <pre
          style={{
            margin: "8px 0 0",
            fontSize: 11,
            color: "var(--text-secondary)",
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "8px 10px",
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-mono)",
          }}
        >
          {JSON.stringify(entity.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  entities,
  onDelete,
}: {
  template: Template;
  entities: Entity[];
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fields = Object.entries(template.schema);
  const templateEntities = entities.filter((e) => e.template_id === template.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el schema "${template.name}" y sus ${templateEntities.length} entidades?`)) return;
    setDeleting(true);
    await deleteTemplate(template.id);
    onDelete(template.id);
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {template.name}
            </h3>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                background: "var(--bg-elevated)",
                padding: "1px 7px",
                borderRadius: 20,
                border: "1px solid var(--border)",
              }}
            >
              {templateEntities.length} registros
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {fields.map(([k, v]) => (
              <SchemaFieldBadge key={k} field={k} type={String(v)} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar schema"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "#f87171",
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              color: "var(--text-muted)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Entities list */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {templateEntities.length === 0 ? (
            <p style={{ padding: "12px 16px", margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Sin registros.
            </p>
          ) : (
            templateEntities.map((entity) => (
              <EntityRow key={entity.id} entity={entity} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function SchemasView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, e] = await Promise.all([getTemplates(), getEntities()]);
      setTemplates(t);
      setEntities(e);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setEntities((prev) => prev.filter((e) => e.template_id !== id));
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              Schemas
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              Estructuras de datos generadas por el sistema
            </p>
          </div>
          <button
            onClick={load}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 13,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 12,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
          </div>
        ) : error ? (
          <div
            style={{
              padding: 20,
              borderRadius: 10,
              background: "#f8717120",
              border: "1px solid #f87171",
              color: "#f87171",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: "var(--text-muted)", margin: "0 auto 16px", display: "block" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              No hay schemas. Envía información en el Chat para crear uno.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                entities={entities}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
