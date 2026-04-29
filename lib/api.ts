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

export interface IngestResponse {
  intent: "ingest";
  matched_templates: string[];
  created_templates: { name: string; schema: Record<string, string> }[];
  evolved_templates: { name: string; new_fields: string[] }[];
  saved_entities: { id: string; template: string; data: Record<string, unknown>; action: string }[];
  errors: string[];
}

export interface QueryResponse {
  intent: "query";
  answer: string;
  confidence: number | string;
  pivot: Record<string, unknown> | null;
  related: Record<string, unknown>[];
}

export interface InteractResponse {
  intent: "interact";
  answer: string;
  confidence: string;
}

export type ChatResponse = IngestResponse | QueryResponse | InteractResponse;

export interface Template {
  id: string;
  name: string;
  schema: Record<string, string>;
  created_at: string;
}

export interface Entity {
  id: string;
  template_id: string;
  data: Record<string, unknown>;
  text: string | null;
  created_at: string;
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

export async function inferTemplate(description: string): Promise<Template> {
  const res = await fetch(`${BASE_URL}/templates/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, user_id: getUserId() }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
