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

export interface CompanyProfileOptions {
  company_types: string[];
  department_types: string[];
  framework_options: string[];
}

export interface CompanyProfileInput {
  company_type: string;
  department_types: string[];
  service_description: string;
  requested_frameworks: string[];
  uses_cloud: boolean;
  has_physical_buildings: boolean;
  supports_remote_work_vpn: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: ChecklistPriority;
  status: ChecklistStatus;
  rule_id: string;
  concrete_action: string | null;
  evidence_request: string | null;
  evidence_entries: EvidenceEntry[];
}

export interface EvidenceEntry {
  id: string;
  label: string;
  reference_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface GDPRRuleSelectorResponse {
  domain_mode: DomainMode;
  available_rules: RuleOption[];
  profile_options: CompanyProfileOptions;
}

export interface GDPRChecklistResponse {
  domain_mode: DomainMode;
  selected_rules: RuleOption[];
  checklist_items: ChecklistItem[];
  recommended_rule_ids: string[];
}

export interface GDPRChecklistRequest {
  selected_rule_ids: string[];
  company_profile: CompanyProfileInput | null;
}

export interface AssessmentSummary {
  selected_rule_count: number;
  total_items: number;
  high_priority_items: number;
  medium_priority_items: number;
  low_priority_items: number;
  recommended_rule_count: number;
}

export interface GDPRAssessmentResponse {
  assessment_id: string;
  created_at: string;
  request: GDPRChecklistRequest;
  domain_mode: DomainMode;
  selected_rules: RuleOption[];
  checklist_items: ChecklistItem[];
  recommended_rule_ids: string[];
  summary: AssessmentSummary;
}

export interface AssessmentHistoryItem {
  assessment_id: string;
  created_at: string;
  company_type: string;
  service_description: string;
  selected_rule_labels: string[];
  total_items: number;
  high_priority_items: number;
  medium_priority_items: number;
  low_priority_items: number;
}

export interface AssessmentHistoryResponse {
  items: AssessmentHistoryItem[];
}

export interface CreateChecklistInput {
  selectedRuleIds: string[];
  companyProfile?: CompanyProfileInput;
}

export interface UpdateChecklistItemInput {
  assessmentId: string;
  checklistItemId: string;
  status?: ChecklistStatus;
  evidenceEntries?: EvidenceEntry[];
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
  input: CreateChecklistInput,
): Promise<GDPRChecklistResponse> {
  return requestJson<GDPRChecklistResponse>({
    path: "/api/v1/gdpr/checklists",
    method: "POST",
    body: JSON.stringify({
      selected_rule_ids: input.selectedRuleIds,
      company_profile: input.companyProfile,
    }),
  });
}

export async function createAssessment(
  input: CreateChecklistInput,
): Promise<GDPRAssessmentResponse> {
  return requestJson<GDPRAssessmentResponse>({
    path: "/api/v1/gdpr/assessments",
    method: "POST",
    body: JSON.stringify({
      selected_rule_ids: input.selectedRuleIds,
      company_profile: input.companyProfile,
    }),
  });
}

export async function getLatestAssessment(): Promise<GDPRAssessmentResponse> {
  return requestJson<GDPRAssessmentResponse>({
    path: "/api/v1/gdpr/assessments/latest",
    method: "GET",
  });
}

export async function getAssessmentHistory(
  limit = 5,
): Promise<AssessmentHistoryResponse> {
  return requestJson<AssessmentHistoryResponse>({
    path: `/api/v1/gdpr/assessments?limit=${limit}`,
    method: "GET",
  });
}

export async function updateAssessmentChecklistItem(
  input: UpdateChecklistItemInput,
): Promise<GDPRAssessmentResponse> {
  return requestJson<GDPRAssessmentResponse>({
    path: `/api/v1/gdpr/assessments/${input.assessmentId}/checklist-items/${input.checklistItemId}`,
    method: "PATCH",
    body: JSON.stringify({
      status: input.status,
      evidence_entries: input.evidenceEntries,
    }),
  });
}
