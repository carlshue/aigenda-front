const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("genda:token");
  if (!token) throw new Error("No token found");
  return token;
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  };
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem("genda:token");
    localStorage.removeItem("genda:user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada");
  }
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res;
}

function localISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hh = pad(Math.floor(Math.abs(offset) / 60));
  const mm = pad(Math.abs(offset) % 60);
  return (
    date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) +
    sign + hh + ":" + mm
  );
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface IngestResponse {
  intent: "ingest" | "generate" | "update";
  entities_created: { id: string; template: string; data: Record<string, unknown> }[];
  entities_updated: { id: string; template: string | Record<string, unknown> }[];
  facts_created: { id: string; subject_id: string; predicate: string; object_id?: string; object_value?: string; confidence: number }[];
  templates_created: string[];
  project_id?: string | null;  // proyecto auto-detectado o especificado
  message: string;
  usage?: TokenUsage;
}

export interface QueryResponse {
  intent: "query";
  answer: string;
  confidence: number | string;
  pivot: Record<string, unknown> | null;
  related: Record<string, unknown>[];
  tables?: Array<{
    template: string;
    row_count: number;
    columns: string[];
    rows: Record<string, unknown>[];
  }>;
  usage?: TokenUsage;
}

export interface InteractResponse {
  intent: "interact";
  answer: string;
  confidence: string;
  usage?: TokenUsage;
}

export interface DeleteResponse {
  intent: "delete";
  entities_deleted: { id: string; template: string }[];
  facts_deleted: number;
  message: string;
  usage?: TokenUsage;
}

export type ChatResponse = IngestResponse | QueryResponse | InteractResponse | DeleteResponse;

export interface Template {
  id: string;
  name: string;
  schema: Record<string, string>;
  created_at: string;
}

export interface TemplateStats extends Template {
  entities_count: number;
  facts_count: number;
}

export interface Entity {
  id: string;
  template_id: string;
  data: Record<string, unknown>;
  original_text: string | null;
  is_canonical: boolean;
  created_at: string;
  updated_at: string;
}

export async function sendChat(
  text: string,
  context: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const now = new Date();
  const res = await fetch(`${BASE_URL}/chat/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      text,
      timestamp: localISOString(now),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      context,
    }),
  });
  await handleResponse(res);
  return res.json();
}

export async function getTemplates(): Promise<Template[]> {
  const res = await fetch(`${BASE_URL}/templates/`);
  await handleResponse(res);
  return res.json();
}

export async function getTemplatesStats(): Promise<TemplateStats[]> {
  const res = await fetch(`${BASE_URL}/templates/stats/summary`);
  await handleResponse(res);
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`${BASE_URL}/templates/${id}`, { method: "DELETE" });
}

export async function getEntities(limit = 100): Promise<Entity[]> {
  const res = await fetch(
    `${BASE_URL}/entities/?limit=${limit}`,
    { headers: getHeaders() }
  );
  await handleResponse(res);
  return res.json();
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  template: string;
  data: Record<string, unknown>;
}

export interface Fact {
  id: string;
  subject_id: string;
  predicate: string;
  object_id?: string;
  object_value?: string;
  confidence: number;
  source_text?: string;
  created_at: string;
  updated_at: string;
  subject_data?: Record<string, unknown>;
  object_data?: Record<string, unknown>;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await fetch(`${BASE_URL}/entities/calendar/events`);
  await handleResponse(res);
  return res.json();
}

export async function getEntityFacts(entityId: string): Promise<Fact[]> {
  const res = await fetch(`${BASE_URL}/facts/entity/${entityId}&direction=all`);
  await handleResponse(res);
  return res.json();
}

export async function inferTemplate(description: string): Promise<Template> {
  const res = await fetch(`${BASE_URL}/templates/infer`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ description, user_id: getUserId() }),
  });
  await handleResponse(res);
  return res.json();
}

// ─── Projects ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  canonical_type: string | null;
  status: "active" | "archived";
  allow_cross_project_visibility: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  entity_count?: number;
  member_count?: number;
}

export interface ProjectMember {
  membership_id: string;
  entity_id: string;
  role: string;
  attributes: Record<string, unknown>;
  is_active: boolean;
  joined_at: string;
  entity_data: Record<string, unknown>;
  entity_template: string;
}

export interface ProjectEntity {
  id: string;
  template: string;
  data: Record<string, unknown>;
  created_at: string;
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/projects/&status=active`);
  await handleResponse(res);
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects/${id}`);
  await handleResponse(res);
  return res.json();
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ user_id: getUserId(), name, description: description || null }),
  });
  await handleResponse(res);
  return res.json();
}

export async function deleteProject(id: string, cascade = false): Promise<void> {
  await fetch(`${BASE_URL}/projects/${id}&cascade=${cascade}`, {
    method: "DELETE",
  });
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members`);
  await handleResponse(res);
  return res.json();
}

export async function getProjectEntities(projectId: string, template?: string): Promise<ProjectEntity[]> {
  const url = template
    ? `${BASE_URL}/projects/${projectId}/entities&template=${template}`
    : `${BASE_URL}/projects/${projectId}/entities`;
  const res = await fetch(url);
  await handleResponse(res);
  return res.json();
}
