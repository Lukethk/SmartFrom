import { apiRequest } from "../lib/api";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Template {
  id: string;
  name: string;
  filename: string;
  created_at: string;
}

export interface MappingProfile {
  id: string;
  template_id: string;
  name: string;
  sheet_name: string;
  start_row: number;
  mapping_json: Record<string, string>;
}

export interface Batch {
  id: string;
  template_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: string;
  logical_key: string;
  raw_text: string;
  normalized_value: string;
  confidence: number;
  source_bbox: Record<string, number>;
  is_validated: boolean;
}

export interface Extraction {
  id: string;
  document_id: string;
  template_id: string;
  confidence: number;
  status: string;
  cells: Cell[];
}

export function register(email: string, password: string) {
  return apiRequest<TokenPair>("/auth/register", { method: "POST", body: { email, password } });
}

export function login(email: string, password: string) {
  return apiRequest<TokenPair>("/auth/login", { method: "POST", body: { email, password } });
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/auth/password-reset/request", { method: "POST", body: { email } });
}

export function confirmPasswordReset(token: string, new_password: string) {
  return apiRequest<{ message: string }>("/auth/password-reset/confirm", {
    method: "POST",
    body: { token, new_password },
  });
}

export function listTemplates(token: string) {
  return apiRequest<Template[]>("/templates/", { token });
}

export function createTemplate(token: string, name: string, file: File) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("file", file);
  return apiRequest<Template>("/templates/", { method: "POST", token, formData: fd });
}

export function saveTemplateFields(token: string, templateId: string, fields: Array<{logical_key: string; label: string;}>) {
  return apiRequest<{ message: string }>(`/templates/${templateId}/fields`, {
    method: "POST",
    token,
    body: fields.map((f) => ({ ...f, data_type: "string", required: false })),
  });
}

export function createMapping(token: string, payload: {
  template_id: string;
  name: string;
  sheet_name: string;
  start_row: number;
  mapping_json: Record<string, string>;
}) {
  return apiRequest<MappingProfile>("/mappings/", { method: "POST", token, body: payload });
}

export function listMappings(token: string) {
  return apiRequest<MappingProfile[]>("/mappings/", { token });
}

export function listBatches(token: string) {
  return apiRequest<Batch[]>("/batches/", { token });
}

export function createBatch(token: string, templateId: string, name: string, files: File[]) {
  const fd = new FormData();
  fd.append("template_id", templateId);
  fd.append("name", name);
  files.forEach((file) => fd.append("files", file));
  return apiRequest<Batch>("/batches/", { method: "POST", token, formData: fd });
}

export function listExtractionsByBatch(token: string, batchId: string) {
  return apiRequest<Extraction[]>(`/extractions/batch/${batchId}`, { token });
}

export function patchExtraction(token: string, extractionId: string, cells: Array<{id: string; normalized_value: string; is_validated: boolean;}>) {
  return apiRequest<{ message: string }>(`/extractions/${extractionId}`, {
    method: "PATCH",
    token,
    body: { cells },
  });
}
