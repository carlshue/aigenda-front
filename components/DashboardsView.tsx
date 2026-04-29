const PLACEHOLDER_CARDS = [
  {
    title: "Gastos por categoría",
    description: "Distribución de gastos agrupados por categoría.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Actividad en el tiempo",
    description: "Frecuencia de registros creados por día o semana.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Distribución por schema",
    description: "Número de entidades por tipo de schema.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    title: "Mapa de relaciones",
    description: "Grafo de conexiones entre entidades referenciadas.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
];

export default function DashboardsView() {
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              Dashboards
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--accent)",
                background: "var(--accent-dim)",
                padding: "2px 8px",
                borderRadius: 20,
                border: "1px solid var(--accent)",
              }}
            >
              Próximamente
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Visualizaciones agregadas sobre los datos almacenados en el sistema.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {PLACEHOLDER_CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--bg-base)",
                  opacity: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              />

              <div style={{ position: "relative", zIndex: 2 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {card.icon}
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  {card.title}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {card.description}
                </p>
              </div>

              {/* Placeholder chart lines */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6, position: "relative", zIndex: 2 }}>
                {[80, 55, 70, 40, 65].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "var(--bg-elevated)",
                      width: `${w}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div
          style={{
            marginTop: 32,
            padding: "16px 20px",
            borderRadius: 10,
            background: "var(--accent-dim)",
            border: "1px solid var(--accent)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Los dashboards se generarán automáticamente a partir de los datos almacenados en tus schemas. Almacena información en el Chat para empezar.
          </p>
        </div>
      </div>
    </div>
  );
}
