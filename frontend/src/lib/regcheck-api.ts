export type ChecklistStatus = "pending" | "in_progress" | "done";
export type ChecklistPriority = "high" | "medium" | "low";

export interface DomainMode {
  id: string;
  label: string;
  description: string;
  is_default: boolean;
}

export interface RuleOption {
  id: string;
  label: string;
  description: string;
  checklist_item_ids: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: ChecklistPriority;
  status: ChecklistStatus;
  rule_id: string;
}

export interface GDPRRuleSelectorResponse {
  domain_mode: DomainMode;
  available_rules: RuleOption[];
}

export interface GDPRChecklistResponse {
  domain_mode: DomainMode;
  selected_rules: RuleOption[];
  checklist_items: ChecklistItem[];
}

interface RequestOptions extends RequestInit {
  path: string;
}

const DEFAULT_API_BASE_URL = "http://localhost:8000";

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );
}

async function requestJson<T>({ path, ...init }: RequestOptions): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Backend request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export async function getRuleSelector(): Promise<GDPRRuleSelectorResponse> {
  return requestJson<GDPRRuleSelectorResponse>({
    path: "/api/v1/gdpr/rule-selector",
    method: "GET",
  });
}

export async function createChecklist(
  selectedRuleIds: string[],
): Promise<GDPRChecklistResponse> {
  return requestJson<GDPRChecklistResponse>({
    path: "/api/v1/gdpr/checklists",
    method: "POST",
    body: JSON.stringify({ selected_rule_ids: selectedRuleIds }),
  });
}
