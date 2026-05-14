"use client";

import { useState, useEffect, useCallback } from "react";
import { getTemplates, getEntities, getCalendarEvents, getGoogleCalendarStatus, syncGoogleCalendar, Template, Entity, CalendarEvent as ApiCalendarEvent } from "@/lib/api";
import { useIsMobile } from "@/lib/useIsMobile";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  template: string;
  templateName: string;
  color: string;
  entity: Entity;
  dateFieldName: string;
}

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#84cc16",
];

function getColorForTemplate(templateName: string, index: number): string {
  return COLORS[index % COLORS.length];
}

function extractTitleFromEntity(entity: Entity, templateName: string): string {
  const titlePatterns = [
    "title",
    "nombre",
    "nombre_tarea",
    "tarea",
    "descripcion",
    "task",
    "name",
    "concepto",
    "descripcion_gasto",
  ];

  for (const pattern of titlePatterns) {
    for (const key in entity.data) {
      if (key.toLowerCase().includes(pattern)) {
        const val = entity.data[key];
        if (val) return String(val).substring(0, 30);
      }
    }
  }

  // Si no encuentra un campo descriptivo, usar el template
  return templateName;
}

function extractDateFromEntity(entity: Entity): { fieldName: string; date: string } | null {
  const datePatterns = [
    "fecha",
    "date",
    "vencimiento",
    "expiracion",
    "deadline",
    "fecha_vencimiento",
    "fecha_importante",
    "fecha_evento",
    "created_at",
  ];

  for (const key in entity.data) {
    const val = entity.data[key];
    if (!val) continue;

    const keyLower = key.toLowerCase();
    if (datePatterns.some((p) => keyLower.includes(p))) {
      const strVal = String(val);
      const match = strVal.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return { fieldName: key, date: match[1] };
      }
    }
  }
  return null;
}

function localDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function DayCell({
  date,
  events,
  selected,
  onSelect,
}: {
  date: Date;
  events: CalendarEvent[];
  selected: boolean;
  onSelect: (date: Date) => void;
}) {
  const dateStr = localDateStr(date);
  const dayEvents = events.filter((e) => e.date === dateStr);
  const isToday = dateStr === localDateStr(new Date());
  const isCurrentMonth = date.getMonth() === new Date().getMonth();

  return (
    <div
      onClick={() => onSelect(date)}
      style={{
        minHeight: 80,
        border: selected ? "2px solid var(--accent)" : "1px solid var(--border)",
        padding: "4px",
        background: selected ? "var(--user-bubble)" : isCurrentMonth ? "var(--bg-surface)" : "var(--bg-elevated)",
        opacity: isCurrentMonth ? 1 : 0.5,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!selected && isCurrentMonth) {
          (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && isCurrentMonth) {
          (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
        }
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: isToday ? 700 : 500,
          color: isToday ? "var(--accent)" : selected ? "var(--text-primary)" : "var(--text-secondary)",
          marginBottom: 2,
          padding: "1px 2px",
        }}
      >
        {date.getDate()}
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 1 }}>
        {dayEvents.slice(0, 3).map((event) => (
          <div
            key={event.id}
            style={{
              fontSize: 9,
              padding: "2px 3px",
              borderRadius: 2,
              background: event.color + "20",
              border: `1px solid ${event.color}40`,
              color: "var(--text-primary)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={event.title}
          >
            {event.title}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div style={{ fontSize: 8, color: "var(--text-muted)", padding: "1px 3px" }}>
            +{dayEvents.length - 3} más
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, e, apiEvents] = await Promise.all([
        getTemplates(),
        getEntities(),
        getCalendarEvents().catch(() => []) // Si falla, usar array vacío
      ]);
      setTemplates(t);
      setEntities(e);

      const extractedEvents: CalendarEvent[] = [];
      const templateMap = new Map(t.map((x) => [x.id, x]));

      if (apiEvents && apiEvents.length > 0) {
        // Usar eventos del API
        apiEvents.forEach((evt) => {
          const dateMatch = String(evt.date).match(/^(\d{4}-\d{2}-\d{2})/);
          const dateStr = dateMatch ? dateMatch[1] : evt.date;

          if (evt.template === "google_calendar") {
            extractedEvents.push({
              id: evt.id,
              title: evt.title,
              date: dateStr,
              template: "google_calendar",
              templateName: "Google Calendar",
              color: "#4285f4",
              entity: {
                id: evt.id,
                template_id: "google_calendar",
                data: evt.data,
                original_text: null,
                is_canonical: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              dateFieldName: "inicio",
            });
            return;
          }

          const template = t.find((x) => x.name === evt.template);
          if (template) {
            const colorIndex = t.findIndex((x) => x.id === template.id);
            const color = getColorForTemplate(template.name, colorIndex);

            extractedEvents.push({
              id: evt.id,
              title: evt.title,
              date: dateStr,
              template: template.id,
              templateName: template.name,
              color,
              entity: {
                id: evt.id,
                template_id: template.id,
                data: evt.data,
                original_text: null,
                is_canonical: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              dateFieldName: "date",
            });
          }
        });
      } else {
        // Fallback: extraer fechas manualmente
        e.forEach((entity) => {
          const dateInfo = extractDateFromEntity(entity);
          if (dateInfo) {
            const template = templateMap.get(entity.template_id);
            if (template) {
              const colorIndex = t.findIndex((x) => x.id === template.id);
              const color = getColorForTemplate(template.name, colorIndex);
              const title = extractTitleFromEntity(entity, template.name);

              extractedEvents.push({
                id: entity.id,
                title,
                date: dateInfo.date,
                template: template.id,
                templateName: template.name,
                color,
                entity,
                dateFieldName: dateInfo.fieldName,
              });
            }
          }
        });
      }

      setEvents(extractedEvents);
    } catch (err) {
      console.error("Error loading calendar:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getGoogleCalendarStatus()
      .then((s) => setGoogleConnected(s.connected))
      .catch(() => setGoogleConnected(false));
  }, []);

  const handleGoogleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await syncGoogleCalendar();
      setSyncMsg(`Sincronizado: ${result.created} nuevos, ${result.updated} actualizados`);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("no_calendar_scope")) {
        setSyncMsg("Sin permisos de calendario. Reconecta Google.");
        setGoogleConnected(false);
      } else {
        setSyncMsg("Error al sincronizar");
      }
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days: Date[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthName = currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" });

  const selectedDateStr = selectedDate ? localDateStr(selectedDate) : null;
  const selectedDayEvents = selectedDateStr ? events.filter((e) => e.date === selectedDateStr) : [];
  const selectedDayName = selectedDate
    ? selectedDate.toLocaleString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-base)" }}>
      {/* Calendario */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px" }}>
        <div style={{ maxWidth: 900 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              Calendario
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              Eventos y fechas importantes
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 8, flexWrap: isMobile ? "wrap" : "nowrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={prevMonth}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
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
                ← Anterior
              </button>
              <button
                onClick={today}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
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
                Hoy
              </button>
              <button
                onClick={nextMonth}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
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
                Siguiente →
              </button>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                textTransform: "capitalize",
              }}
            >
              {monthName}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={load}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 6,
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Actualizar
                </button>
                {googleConnected === false ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google/calendar`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #4285f4",
                      background: "var(--bg-surface)",
                      color: "#4285f4",
                      fontSize: 13,
                      cursor: "pointer",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Conectar Google Calendar
                  </a>
                ) : googleConnected === true ? (
                  <button
                    onClick={handleGoogleSync}
                    disabled={syncing}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #4285f4",
                      background: syncing ? "var(--bg-elevated)" : "var(--bg-surface)",
                      color: "#4285f4",
                      fontSize: 13,
                      cursor: syncing ? "not-allowed" : "pointer",
                      transition: "background 0.15s",
                      opacity: syncing ? 0.7 : 1,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {syncing ? "Sincronizando..." : "Sincronizar Google Calendar"}
                  </button>
                ) : null}
              </div>
              {syncMsg && (
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{syncMsg}</span>
              )}
            </div>
          </div>

          {/* Legend */}
          {(templates.length > 0 || events.some((e) => e.template === "google_calendar")) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {templates.map((t, idx) => {
                const hasEvents = events.some((e) => e.template === t.id);
                if (!hasEvents) return null;
                const color = getColorForTemplate(t.name, idx);
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.name}</span>
                  </div>
                );
              })}
              {events.some((e) => e.template === "google_calendar") && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#4285f4" }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Google Calendar</span>
                </div>
              )}
            </div>
          )}

          {/* Calendar */}
          {loading ? (
            <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "var(--bg-surface)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "var(--text-muted)", margin: "0 auto 16px", display: "block" }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                No hay eventos con fechas. Almacena información con fechas en el Chat.
              </p>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
                background: "var(--bg-surface)",
              }}
            >
              {/* Weekday headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div
                    key={day}
                    style={{
                      padding: "8px 4px",
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      background: "var(--bg-elevated)",
                      borderRight: "1px solid var(--border)",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {week.map((date) => (
                    <DayCell
                      key={date.toISOString()}
                      date={date}
                      events={events}
                      selected={selectedDateStr === localDateStr(date)}
                      onSelect={setSelectedDate}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar con detalles del día */}
      {!isMobile && <div
        style={{
          width: 340,
          borderLeft: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {selectedDate && selectedDateStr ? (
          <>
            {/* Header */}
            <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textTransform: "capitalize",
                }}
              >
                {selectedDayName}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                {selectedDayEvents.length} evento{selectedDayEvents.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Events list */}
            <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 12px", color: "var(--text-muted)" }}>
                  <p style={{ margin: 0, fontSize: 13 }}>Sin eventos este día</p>
                </div>
              ) : (
                selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      background: "var(--bg-surface)",
                      border: `1px solid ${event.color}40`,
                      borderLeft: `4px solid ${event.color}`,
                      borderRadius: 8,
                      padding: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: event.color,
                          marginTop: 4,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                          {event.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {event.templateName}
                        </p>
                      </div>
                    </div>

                    {/* Data details */}
                    <div
                      style={{
                        background: "var(--bg-elevated)",
                        borderRadius: 6,
                        padding: "8px 10px",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {Object.entries(event.entity.data).map(([key, val]) => (
                          <div key={key} style={{ fontSize: 11 }}>
                            <span style={{ color: "var(--text-muted)" }}>{key}:</span>
                            <span
                              style={{
                                marginLeft: 4,
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date field info */}
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      <span>📅 {event.dateFieldName}: </span>
                      <span style={{ color: "var(--text-secondary)" }}>{event.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ marginBottom: 12, opacity: 0.5 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <p style={{ margin: 0, fontSize: 13 }}>Selecciona un día para ver sus eventos</p>
          </div>
        )}
      </div>}
    </div>
  );
}
