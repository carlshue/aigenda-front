"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useIsMobile } from "@/lib/useIsMobile";
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
  fieldType?: "field" | "relation";
  relationPredicate?: string;
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
  const [dataType, setDataType] = useState<"field" | "relation">("field");
  const [availableRelations, setAvailableRelations] = useState<string[]>([]);
  const [selectedRelation, setSelectedRelation] = useState("");

  const currentTemplate = templates.find((t) => t.name === selectedTemplate);
  const fields = currentTemplate?.schema ? Object.keys(currentTemplate.schema) : [];

  useEffect(() => {
    const loadRelations = async () => {
      if (!selectedTemplate) {
        setAvailableRelations([]);
        return;
      }
      const user = getCurrentUser();
      if (!user) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/facts/predicates?user_id=${user}&template=${selectedTemplate}`
        );
        if (res.ok) {
          const predicates = await res.json();
          setAvailableRelations(predicates || []);
          setSelectedRelation("");
        }
      } catch (err) {
        console.error("Error loading relations:", err);
      }
    };
    loadRelations();
  }, [selectedTemplate]);

  const handleAdd = () => {
    const chart: Chart = {
      id: crypto.randomUUID(),
      name: chartName || `${chartType}-${selectedTemplate}`,
      type: chartType,
      template: selectedTemplate,
      field: dataType === "field" ? selectedField : selectedRelation,
      fields: selectedFields,
      lineMode,
      xField,
      yField,
      dateField,
      numberField,
      fieldType: dataType,
      relationPredicate: dataType === "relation" ? selectedRelation : undefined,
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

        {selectedTemplate && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Tipo de dato
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => {
                  setDataType("field");
                  setSelectedField("");
                  setSelectedRelation("");
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: dataType === "field" ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: dataType === "field" ? "var(--accent-dim)" : "var(--bg-base)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Campo
              </button>
              <button
                onClick={() => {
                  setDataType("relation");
                  setSelectedField("");
                  setSelectedRelation("");
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: dataType === "relation" ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: dataType === "relation" ? "var(--accent-dim)" : "var(--bg-base)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Relación
              </button>
            </div>
          </div>
        )}

        {chartType === "pie" && selectedTemplate && dataType === "field" && (
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

        {selectedTemplate && dataType === "relation" && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Relación a analizar
            </label>
            {availableRelations.length === 0 ? (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                No hay relaciones disponibles para este schema
              </div>
            ) : (
              <select
                value={selectedRelation}
                onChange={(e) => setSelectedRelation(e.target.value)}
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
                <option value="">Selecciona una relación...</option>
                {availableRelations.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
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
            disabled={
              !selectedTemplate ||
              (dataType === "relation" && !selectedRelation) ||
              (dataType === "field" && chartType === "pie" && !selectedField) ||
              (dataType === "field" && chartType === "bar" && selectedFields.length === 0) ||
              (dataType === "field" && chartType === "line" && !xField && !dateField)
            }
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

function ChartHeader({ chart, dataCount }: { chart: Chart; dataCount: number }) {
  const getTypeLabel = () => {
    if (chart.type === "pie") return "Distribución (Pie)";
    if (chart.type === "bar") {
      if (chart.fields && chart.fields.length === 1) return "Conteo (Bar)";
      return "Suma por categoría (Bar)";
    }
    if (chart.type === "line") {
      if (chart.lineMode === "xy") return "Correlación X-Y (Line)";
      return "Evolución temporal (Line)";
    }
    return chart.type;
  };

  const getFieldsLabel = () => {
    if (chart.fieldType === "relation") {
      return `${chart.relationPredicate} (relación)`;
    }
    if (chart.type === "pie") return chart.field;
    if (chart.type === "bar") return chart.fields?.join(" + ") || "";
    if (chart.type === "line") {
      if (chart.lineMode === "xy") return `${chart.xField} vs ${chart.yField}`;
      return `${chart.dateField} → ${chart.numberField}`;
    }
    return "";
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border)",
        borderRadius: "6px 6px 0 0",
        fontSize: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div>
          <span style={{ color: "var(--text-muted)", marginRight: 6 }}>Schema:</span>
          <strong style={{ color: "var(--text-primary)" }}>{chart.template}</strong>
        </div>
        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
          <span style={{ color: "var(--text-muted)", marginRight: 6 }}>Comparando:</span>
          <strong style={{ color: "var(--accent)" }}>{getFieldsLabel()}</strong>
        </div>
        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
          <span style={{ color: "var(--text-muted)", marginRight: 6 }}>Tipo:</span>
          <strong style={{ color: "var(--text-primary)" }}>{getTypeLabel()}</strong>
        </div>
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600 }}>
        {dataCount} entidades
      </div>
    </div>
  );
}

function ChartDisplay({ chart, data }: { chart: Chart; data: any[] }) {
  const isLoading = data.length === 0;

  // Extraer entidades relacionadas únicas
  const relatedTemplates: Record<string, number> = {};
  if (data.length > 0 && data[0]._relatedData) {
    Object.values(data[0]._relatedData).forEach((entity: any) => {
      const template = entity.template || "unknown";
      relatedTemplates[template] = (relatedTemplates[template] || 0) + 1;
    });
  }

  const chartContent = (() => {
    if (isLoading) {
      return (
        <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          Cargando datos...
        </div>
      );
    }

    if (chart.type === "pie") {
      const counts: Record<string, number> = {};
      data.forEach((item: any) => {
        const fieldName = chart.fieldType === "relation" ? "_object" : chart.field;
        const value = item.data?.[fieldName] || "sin valor";
        counts[String(value)] = (counts[String(value)] || 0) + 1;
      });
      const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));

      const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          if (chart.fieldType === "relation") {
            // Encontrar el objeto relacionado para mostrar sus datos completos
            const relatedItem = data.relatedData;
            if (relatedItem) {
              return (
                <div style={{ background: "var(--bg-surface)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 600 }}>{data.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "var(--text-secondary)" }}>Cantidad: {data.value}</p>
                  {relatedItem && Object.entries(relatedItem).map(([key, val]: [string, any]) => (
                    <p key={key} style={{ margin: "2px 0", fontSize: 10, color: "var(--text-secondary)" }}>
                      {key}: {String(val)}
                    </p>
                  ))}
                </div>
              );
            }
          }
          return (
            <div style={{ background: "var(--bg-surface)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 600 }}>{data.name}</p>
              <p style={{ margin: 0, fontSize: 10 }}>Cantidad: {data.value}</p>
            </div>
          );
        }
        return null;
      };

      // Enriquecer pieData con datos relacionados si es una relación
      if (chart.fieldType === "relation") {
        pieData.forEach((item) => {
          const matchingItem = data.find((d: any) => d.data?._object === item.name);
          if (matchingItem && matchingItem._object_data_full) {
            (item as any).relatedData = matchingItem._object_data_full;
          }
        });
      }

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie dataKey="value" data={pieData} label>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

  if (chart.type === "bar") {
    // Para relaciones, mostrar conteo de cada valor
    if (chart.fieldType === "relation") {
      const counts: Record<string, any> = {};
      data.forEach((item: any) => {
        const value = item.data?._object || "sin valor";
        const key = String(value);
        if (!counts[key]) {
          counts[key] = {
            count: 0,
            relatedData: item._object_data_full,
          };
        }
        counts[key].count++;
      });

      const barData = Object.entries(counts).map(([label, data]: [string, any]) => ({
        name: label,
        count: data.count,
        relatedData: data.relatedData,
      }));

      const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const barData = payload[0].payload;
          return (
            <div style={{ background: "var(--bg-surface)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 600 }}>{barData.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text-secondary)" }}>Cantidad: {barData.count}</p>
              {barData.relatedData && Object.entries(barData.relatedData).map(([key, val]: [string, any]) => (
                <p key={key} style={{ margin: "2px 0", fontSize: 10, color: "var(--text-secondary)" }}>
                  {key}: {String(val)}
                </p>
              ))}
            </div>
          );
        }
        return null;
      };

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="count" fill={COLORS[0]} name={chart.relationPredicate} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

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
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => {
                if (typeof value === 'number') {
                  return value.toLocaleString();
                }
                if (typeof value === 'string') {
                  return value;
                }
                return '';
              }}
            />
            <Legend />
            <Bar
              dataKey="total"
              fill={COLORS[0]}
              name={`${valueField} (suma)`}
            />
          </BarChart>
        </ResponsiveContainer>
      );

    }

    return null;
  }

  if (chart.type === "line") {
    let lineData = [];
    if (chart.lineMode === "xy") {
      const xField = chart.xField || "";
      const yField = chart.yField || "";
      lineData = data
        .filter((item: any) => {
          const x = parseFloat(String(item.data?.[xField]));
          const y = parseFloat(String(item.data?.[yField]));
          return !isNaN(x) && !isNaN(y);
        })
        .map((item: any) => ({
          [xField]: parseFloat(String(item.data?.[xField])),
          [yField]: parseFloat(String(item.data?.[yField])),
        }));
    } else {
      const dateField = chart.dateField || "";
      const numberField = chart.numberField || "";
      lineData = data
        .filter((item: any) => {
          const date = item.data?.[dateField];
          const num = parseFloat(String(item.data?.[numberField]));
          return date && !isNaN(num);
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.data?.[dateField]).getTime();
          const dateB = new Date(b.data?.[dateField]).getTime();
          return dateA - dateB;
        })
        .map((item: any) => ({
          date: item.data?.[dateField] || "",
          [numberField]: parseFloat(String(item.data?.[numberField])),
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
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ChartHeader chart={chart} dataCount={data.length} />
      {Object.keys(relatedTemplates).length > 0 && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            color: "var(--text-secondary)",
          }}
        >
          Entidades relacionadas incluidas: {Object.entries(relatedTemplates)
            .map(([template, count]) => `${template} (${count})`)
            .join(", ")}
        </div>
      )}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {chartContent}
      </div>
    </div>
  );
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
      // Si es una relación, cargar facts en lugar de fields
      if (chart.fieldType === "relation" && chart.relationPredicate) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/facts/by-predicate?user_id=${user}&predicate=${chart.relationPredicate}&subject_template=${chart.template}`
        );
        if (res.ok) {
          const facts = await res.json();
          // Transformar facts en un formato que ChartDisplay pueda procesar
          const entityData = facts.map((fact: any) => {
            // Mostrar TODOS los valores de la entidad relacionada
            let objectLabel = "sin valor";
            let objectDetails: Record<string, any> = {};

            // Intentar obtener datos de múltiples fuentes
            const objectData = fact.object_data || {};
            objectDetails = { ...objectData };

            // Crear etiqueta a partir de los datos disponibles
            // Prioridad: value > name > title > todos los campos
            if (objectData.value) {
              objectLabel = String(objectData.value);
            } else if (objectData.name) {
              objectLabel = String(objectData.name);
            } else if (objectData.title) {
              objectLabel = String(objectData.title);
            } else {
              // Mostrar todos los campos disponibles concatenados
              const entries = Object.entries(objectData);
              if (entries.length > 0) {
                objectLabel = entries
                  .map(([k, v]) => {
                    // Ignorar campos internos como id, created_at, etc
                    if (k.startsWith('_') || k === 'id' || k === 'created_at' || k === 'updated_at') {
                      return null;
                    }
                    return String(v);
                  })
                  .filter(v => v !== null && v !== '')
                  .join(" | ") || String(fact.object_id).substring(0, 8);
              } else if (fact.object_id) {
                objectLabel = String(fact.object_id).substring(0, 8);
              }
            }

            console.log(`DEBUG: Fact ${fact.predicate} - object: ${objectLabel}, data:`, objectData);

            return {
              id: fact.subject_id,
              template: chart.template,
              data: {
                _object: objectLabel,
                _subject_name: fact.subject_data?.name || fact.subject_data?.title || "entidad",
              },
              _originalFact: fact,
              _object_data_full: objectDetails, // TODOS los datos de la entidad relacionada
              _object_id: fact.object_id,
            };
          });
          setChartData((prev) => ({
            ...prev,
            [chart.id]: entityData,
          }));
        }
      } else {
        // Cargar datos por campos normales
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
          // Filtrar entidades del template principal
          let entities = result.data_found.filter((e: any) => e.template === chart.template);

          // Cargar entidades relacionadas (seguir referencias _id)
          const relatedEntities: Record<string, any> = {};
          entities.forEach((entity: any) => {
            Object.entries(entity.data || {}).forEach(([key, value]: [string, any]) => {
              // Si el campo termina en _id y tiene un valor, buscar la entidad relacionada
              if (key.endsWith("_id") && value && typeof value === "string") {
                const relatedEntity = result.data_found.find((e: any) => e.id === value);
                if (relatedEntity) {
                  relatedEntities[value] = relatedEntity;
                }
              }
            });
          });

          // Enriquecer entidades con datos relacionados
          const enrichedEntities = entities.map((entity: any) => ({
            ...entity,
            _relatedData: relatedEntities,
          }));

          setChartData((prev) => ({
            ...prev,
            [chart.id]: enrichedEntities,
          }));
        }
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
