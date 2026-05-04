"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "@/lib/useIsMobile";
import { getCurrentUser } from "@/lib/auth";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

type ChartType = "pie" | "bar" | "line";
type LineMode = "xy" | "date";

interface Chart {
  id: string;
  name: string;
  type: ChartType;
  template: string;
  field: string;
  fields?: string[];
  lineMode?: LineMode;
  xField?: string;
  yField?: string;
  dateField?: string;
  numberField?: string;
}

interface Dashboard {
  id: string;
  name: string;
  charts: Chart[];
  createdAt: string;
}

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1"];

function ChartBuilder({ templates, onAdd, onClose }: { templates: any[]; onAdd: (chart: Chart) => void; onClose: () => void }) {
  const [chartType, setChartType] = useState<ChartType>("pie");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [lineMode, setLineMode] = useState<LineMode>("xy");
  const [xField, setXField] = useState("");
  const [yField, setYField] = useState("");
  const [dateField, setDateField] = useState("");
  const [numberField, setNumberField] = useState("");
  const [chartName, setChartName] = useState("");

  const currentTemplate = templates.find((t) => t.name === selectedTemplate);
  const fields = currentTemplate?.schema ? Object.keys(currentTemplate.schema) : [];

  const handleAdd = () => {
    const chart: Chart = {
      id: crypto.randomUUID(),
      name: chartName || `${chartType}-${selectedTemplate}`,
      type: chartType,
      template: selectedTemplate,
      field: selectedField,
      fields: selectedFields,
      lineMode,
      xField,
      yField,
      dateField,
      numberField,
    };
    onAdd(chart);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Nombre
          </label>
          <input
            type="text"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            placeholder={`${chartType}-chart`}
            style={{
              width: "100%",
              padding: "8px 10px",
              marginTop: 6,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Tipo de gráfico
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {(["pie", "bar", "line"] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setChartType(t);
                  setSelectedFields([]);
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: chartType === t ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: chartType === t ? "var(--accent-dim)" : "var(--bg-base)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Schema
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              setSelectedField("");
              setSelectedFields([]);
            }}
            style={{
              width: "100%",
              padding: "8px 10px",
              marginTop: 6,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              fontSize: 13,
            }}
          >
            <option value="">Selecciona un schema...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {chartType === "pie" && selectedTemplate && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Campo a contar
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: 6,
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            >
              <option value="">Selecciona un campo...</option>
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        {chartType === "bar" && selectedTemplate && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Campos (múltiples)
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {fields.map((f) => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(f)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFields([...selectedFields, f]);
                      } else {
                        setSelectedFields(selectedFields.filter((s) => s !== f));
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>
        )}

        {chartType === "line" && selectedTemplate && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Modo
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => setLineMode("xy")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: lineMode === "xy" ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: lineMode === "xy" ? "var(--accent-dim)" : "var(--bg-base)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  X-Y
                </button>
                <button
                  onClick={() => setLineMode("date")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: lineMode === "date" ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: lineMode === "date" ? "var(--accent-dim)" : "var(--bg-base)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Fecha-Valor
                </button>
              </div>
            </div>

            {lineMode === "xy" && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Eje X (numérico)
                  </label>
                  <select
                    value={xField}
                    onChange={(e) => setXField(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      marginTop: 6,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      background: "var(--bg-base)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="">Selecciona un campo...</option>
                    {fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Eje Y (numérico)
                  </label>
                  <select
                    value={yField}
                    onChange={(e) => setYField(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      marginTop: 6,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      background: "var(--bg-base)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="">Selecciona un campo...</option>
                    {fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {lineMode === "date" && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Campo de fecha (X)
                  </label>
                  <select
                    value={dateField}
                    onChange={(e) => setDateField(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      marginTop: 6,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      background: "var(--bg-base)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="">Selecciona un campo...</option>
                    {fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Campo numérico (Y)
                  </label>
                  <select
                    value={numberField}
                    onChange={(e) => setNumberField(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      marginTop: 6,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      background: "var(--bg-base)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="">Selecciona un campo...</option>
                    {fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedTemplate || (chartType === "pie" && !selectedField) || (chartType === "bar" && selectedFields.length === 0) || (chartType === "line" && !xField && !dateField)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              opacity: (!selectedTemplate || (chartType === "pie" && !selectedField)) ? 0.5 : 1,
            }}
          >
            Añadir gráfico
          </button>
        </div>
      </div>
    </div>
  );
}

function ChartDisplay({ chart, data }: { chart: Chart; data: any[] }) {
  if (chart.type === "pie") {
    const counts: Record<string, number> = {};
    data.forEach((item: any) => {
      const value = item.data?.[chart.field] || "sin valor";
      counts[String(value)] = (counts[String(value)] || 0) + 1;
    });
    const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie dataKey="value" data={pieData} label>
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "bar") {
    const fields = chart.fields || [];

    if (fields.length === 0) {
      return <div style={{ color: "var(--text-muted)" }}>Selecciona al menos un campo</div>;
    }

    // Caso 1: Un solo campo - contar ocurrencias
    if (fields.length === 1) {
      const counts: Record<string, number> = {};
      data.forEach((item: any) => {
        const value = item.data?.[fields[0]];
        const key = value !== null && value !== undefined ? String(value) : "sin valor";
        counts[key] = (counts[key] || 0) + 1;
      });

      const barData = Object.entries(counts).map(([label, count]) => ({
        name: label,
        count: count,
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={COLORS[0]} name={fields[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Caso 2: Dos o más campos - primer campo como X (string), segundo como Y (suma de números)
    if (fields.length >= 2) {
      const groupField = fields[0];
      const valueField = fields[1];

      const grouped: Record<string, number[]> = {};

      data.forEach((item: any) => {
        const groupKey = item.data?.[groupField];
        const key = groupKey !== null && groupKey !== undefined ? String(groupKey) : "sin valor";
        const numValue = parseFloat(String(item.data?.[valueField] ?? "0"));

        if (!grouped[key]) {
          grouped[key] = [];
        }
        if (!isNaN(numValue)) {
          grouped[key].push(numValue);
        }
      });

      const barData = Object.entries(grouped).map(([label, values]) => ({
        name: label,
        total: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100 : 0,
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="total" fill={COLORS[0]} name={`${valueField} (suma)`} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  }

  if (chart.type === "line") {
    let lineData = [];
    if (chart.lineMode === "xy") {
      lineData = data
        .filter((item: any) => {
          const x = parseFloat(String(item.data?.[chart.xField || ""]));
          const y = parseFloat(String(item.data?.[chart.yField || ""]));
          return !isNaN(x) && !isNaN(y);
        })
        .map((item: any) => ({
          [chart.xField || ""]: parseFloat(String(item.data?.[chart.xField])),
          [chart.yField || ""]: parseFloat(String(item.data?.[chart.yField])),
        }));
    } else {
      lineData = data
        .filter((item: any) => {
          const date = item.data?.[chart.dateField || ""];
          const num = parseFloat(String(item.data?.[chart.numberField || ""]));
          return date && !isNaN(num);
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.data?.[chart.dateField || ""]).getTime();
          const dateB = new Date(b.data?.[chart.dateField || ""]).getTime();
          return dateA - dateB;
        })
        .map((item: any) => ({
          date: item.data?.[chart.dateField] || "",
          [chart.numberField || ""]: parseFloat(String(item.data?.[chart.numberField])),
        }));
    }

    const xKey = chart.lineMode === "xy" ? chart.xField : "date";
    const yKey = chart.lineMode === "xy" ? chart.yField : chart.numberField;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return <div>Tipo de gráfico no soportado</div>;
}

export default function DashboardsView() {
  const isMobile = useIsMobile();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});

  const loadChartData = async (chart: Chart) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Dame todas las entidades de tipo ${chart.template}`,
          user_id: user,
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const result = await res.json();
      if (result.data_found) {
        setChartData((prev) => ({
          ...prev,
          [chart.id]: result.data_found.filter((e: any) => e.template === chart.template),
        }));
      }
    } catch (err) {
      console.error("Error loading chart data:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const user = getCurrentUser();
      if (!user) return;

      try {
        const schemasRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/schemas/${user}`);
        const schemas = await schemasRes.json();
        const templatesList = Object.entries(schemas).map(([name, data]: [string, any]) => ({
          name,
          ...data,
        }));
        setTemplates(templatesList);

        // Crear un dashboard por defecto si no hay ninguno
        if (dashboards.length === 0) {
          const newDashboard: Dashboard = {
            id: crypto.randomUUID(),
            name: "Mi Dashboard",
            charts: [],
            createdAt: new Date().toISOString(),
          };
          setDashboards([newDashboard]);
          setCurrentDashboard(newDashboard);
        }
      } catch (err) {
        console.error("Error loading templates:", err);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (currentDashboard) {
      currentDashboard.charts.forEach((chart) => {
        if (!chartData[chart.id]) {
          loadChartData(chart);
        }
      });
    }
  }, [currentDashboard]);

  const handleAddChart = (chart: Chart) => {
    if (!currentDashboard) return;
    const updated = { ...currentDashboard, charts: [...currentDashboard.charts, chart] };
    setCurrentDashboard(updated);
    setDashboards(dashboards.map((d) => (d.id === updated.id ? updated : d)));
    setShowBuilder(false);
  };

  const handleRemoveChart = (chartId: string) => {
    if (!currentDashboard) return;
    const updated = {
      ...currentDashboard,
      charts: currentDashboard.charts.filter((c) => c.id !== chartId),
    };
    setCurrentDashboard(updated);
    setDashboards(dashboards.map((d) => (d.id === updated.id ? updated : d)));
  };

  if (!currentDashboard) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: isMobile ? "16px 0" : "32px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              {currentDashboard.name}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
              {currentDashboard.charts.length} gráfico{currentDashboard.charts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            + Añadir gráfico
          </button>
        </div>

        {/* Charts Grid */}
        {currentDashboard.charts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
              No hay gráficos todavía. Crea uno para empezar.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(500px, 1fr))",
              gap: 24,
            }}
          >
            {currentDashboard.charts.map((chart) => (
              <div
                key={chart.id}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {chart.name}
                  </h3>
                  <button
                    onClick={() => handleRemoveChart(chart.id)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: "none",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <ChartDisplay chart={chart} data={chartData[chart.id] || []} />
              </div>
            ))}
          </div>
        )}
      </div>

      {showBuilder && <ChartBuilder templates={templates} onAdd={handleAddChart} onClose={() => setShowBuilder(false)} />}
    </div>
  );
}
