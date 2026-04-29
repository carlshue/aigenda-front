const BASE_URL = "http://localhost:8000";
export const USER_ID = "00000000-0000-0000-0000-000000000001";

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

export type ChatResponse = IngestResponse | QueryResponse;

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

export async function sendChat(text: string): Promise<ChatResponse> {
  const now = new Date();
  const res = await fetch(`${BASE_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      user_id: USER_ID,
      timestamp: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTemplates(): Promise<Template[]> {
  const res = await fetch(`${BASE_URL}/templates/`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`${BASE_URL}/templates/${id}`, { method: "DELETE" });
}

export async function getEntities(limit = 100): Promise<Entity[]> {
  const res = await fetch(
    `${BASE_URL}/entities/?user_id=${USER_ID}&limit=${limit}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function inferTemplate(description: string): Promise<Template> {
  const res = await fetch(`${BASE_URL}/templates/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
