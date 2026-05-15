export type ChecklistStatus = "pending" | "in_progress" | "done";
export type ChecklistPriority = "high" | "medium" | "low";

export interface AuthUser {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  enterprise: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  enterprise: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

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
  done_items: number;
  high_priority_items: number;
  high_priority_done_items: number;
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
export const AUTH_TOKEN_STORAGE_KEY = "regcheck-auth-token";

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );
}

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token === null) {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getStoredAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

async function requestJson<T>({ path, ...init }: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (authToken !== null) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && onUnauthorized !== null) {
    onUnauthorized();
  }

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as { detail?: string | { message?: string } };
      if (typeof payload.detail === "string") {
        detail = payload.detail;
      } else if (
        payload.detail !== undefined &&
        typeof payload.detail === "object" &&
        typeof payload.detail.message === "string"
      ) {
        detail = payload.detail.message;
      }
    } catch {
      // Keep the default status-based message.
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function signup(input: SignupInput): Promise<AuthResponse> {
  return requestJson<AuthResponse>({
    path: "/api/v1/auth/signup",
    method: "POST",
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      enterprise: input.enterprise,
      email: input.email,
      password: input.password,
    }),
  });
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return requestJson<AuthResponse>({
    path: "/api/v1/auth/login",
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });
}

export async function logout(): Promise<void> {
  await requestJson<void>({
    path: "/api/v1/auth/logout",
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return requestJson<AuthUser>({
    path: "/api/v1/auth/me",
    method: "GET",
  });
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
