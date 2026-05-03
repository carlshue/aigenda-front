import { getCurrentUser } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getUserId(): string {
  const user = getCurrentUser();
  if (!user) throw new Error("No user logged in");
  return user;
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
  message: string;
  usage?: TokenUsage;
}

export interface QueryResponse {
  intent: "query";
  answer: string;
  confidence: number | string;
  pivot: Record<string, unknown> | null;
  related: Record<string, unknown>[];
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      user_id: getUserId(),
      timestamp: localISOString(now),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      context,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTemplates(): Promise<Template[]> {
  const res = await fetch(`${BASE_URL}/templates/?user_id=${getUserId()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTemplatesStats(): Promise<TemplateStats[]> {
  const res = await fetch(`${BASE_URL}/templates/stats/summary?user_id=${getUserId()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`${BASE_URL}/templates/${id}?user_id=${getUserId()}`, { method: "DELETE" });
}

export async function getEntities(limit = 100): Promise<Entity[]> {
  const res = await fetch(
    `${BASE_URL}/entities/?user_id=${getUserId()}&limit=${limit}`
  );
  if (!res.ok) throw new Error(await res.text());
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
  const res = await fetch(`${BASE_URL}/entities/calendar/events?user_id=${getUserId()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getEntityFacts(entityId: string): Promise<Fact[]> {
  const res = await fetch(`${BASE_URL}/facts/entity/${entityId}?user_id=${getUserId()}&direction=all`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function inferTemplate(description: string): Promise<Template> {
  const res = await fetch(`${BASE_URL}/templates/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, user_id: getUserId() }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
