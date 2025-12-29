import { auth } from "../firebase";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL env var");
}

export type DiagnosisPayload = {
  brand: string;
  model: string;
  series?: string;
  error_code?: string;
  symptom: string;
  checks_done?: string;
  language: string;
};

export type DiagnosisResponse = {
  case_id: number;
  diagnosis: string;
  source?: "cases" | "ai";
};

export type Case = {
  id: number;
  brand: string;
  model: string;
  series?: string | null;
  error_code?: string | null;
  symptom: string;
  checks_done?: string | null;
  diagnosis: string;
  status?: "open" | "resolved";
  resolution_note?: string | null;
  resolved_at?: string | null;
};

type ApiRequestOptions = RequestInit & {
  json?: boolean;
};

async function apiFetch(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers ?? {});

  if (options.json) {
    headers.set("Content-Type", "application/json");
  }

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

export async function fetchCases(params: { status?: string; limit?: number }) {
  const { status, limit } = params;
  const search = new URLSearchParams();
  if (status) search.set("status", status);
  if (limit) search.set("limit", String(limit));
  const res = await apiFetch(`/cases${search.toString() ? `?${search}` : ""}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<Case[]>;
}

export async function postDiagnosis(payload: DiagnosisPayload) {
  const res = await apiFetch("/diagnosis", {
    method: "POST",
    json: true,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<DiagnosisResponse>;
}

export async function resolveCase(caseId: number, resolution_note: string) {
  const res = await apiFetch(`/cases/${caseId}/resolve`, {
    method: "PATCH",
    json: true,
    body: JSON.stringify({ resolution_note }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}
