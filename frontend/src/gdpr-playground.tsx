import { useMemo, useState } from "react";

import { LiveBackendInputSidebar } from "./components/live-backend-input-sidebar";
import { ResponseBlock } from "./components/gdpr-playground-parts";
import {
  createAssessment,
  type AssessmentHistoryResponse,
  type ChecklistItem,
  type ChecklistStatus,
  type EvidenceEntry,
  type GDPRAssessmentResponse,
  type GDPRRuleSelectorResponse,
  type RuleOption,
  updateAssessmentChecklistItem,
} from "./lib/regcheck-api";
import { buildAssessmentReportHtml } from "./lib/report-export";

type GdprPlaygroundProps = {
  initialSelector: GDPRRuleSelectorResponse;
  initialAssessment: GDPRAssessmentResponse | null;
  initialHistory: AssessmentHistoryResponse;
};

type MetricProps = {
  label: string;
  value: string;
  description: string;
};

function MetricTile({ label, value, description }: Readonly<MetricProps>) {
  return (
    <article className="mini-metric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{description}</span>
    </article>
  );
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function getChecklistPriority(index: number): ChecklistItem["priority"] {
  if (index === 0) {
    return "high";
  }

  if (index === 1) {
    return "medium";
  }

  return "low";
}

function createChecklistItemPreview(
  rule: RuleOption,
  itemId: string,
  index: number,
): ChecklistItem {
  const priority = getChecklistPriority(index);

  return {
    id: itemId,
    title: `${rule.label} control ${index + 1}`,
    description: rule.description,
    priority,
    status: "pending",
    rule_id: rule.id,
    concrete_action: `Review and document the ${rule.label.toLowerCase()} control.`,
    evidence_request: `Attach evidence for ${rule.label.toLowerCase()} control ${index + 1}.`,
    evidence_entries: [],
  };
}

function buildPrioritySummary(checklistItems: ChecklistItem[]) {
  return checklistItems.reduce(
    (summary, item) => ({
      total_items: summary.total_items + 1,
      high_priority_items:
        summary.high_priority_items + (item.priority === "high" ? 1 : 0),
      medium_priority_items:
        summary.medium_priority_items + (item.priority === "medium" ? 1 : 0),
      low_priority_items:
        summary.low_priority_items + (item.priority === "low" ? 1 : 0),
    }),
    {
      total_items: 0,
      high_priority_items: 0,
      medium_priority_items: 0,
      low_priority_items: 0,
    },
  );
}

function normalizeEvidenceDraft(value: string): string {
  return value.trim();
}

function getSavedEvidenceDraft(item: ChecklistItem): {
  notes: string;
  referenceUrl: string;
} {
  const firstEntry = item.evidence_entries[0];
  if (firstEntry === undefined) {
    return { notes: "", referenceUrl: "" };
  }

  return {
    notes: firstEntry.notes ?? "",
    referenceUrl: firstEntry.reference_url ?? "",
  };
}

export default function GdprPlayground({
  initialSelector,
  initialAssessment,
  initialHistory,
}: Readonly<GdprPlaygroundProps>) {
  const [selector] = useState(initialSelector);
  const [currentAssessment, setCurrentAssessment] =
    useState<GDPRAssessmentResponse | null>(initialAssessment);
  const [history, setHistory] = useState(initialHistory.items);

  const initialCompanyProfile = useMemo(
    () => currentAssessment?.request.company_profile,
    [currentAssessment?.request.company_profile],
  );

  const [companyType, setCompanyType] = useState(
    initialCompanyProfile?.company_type ??
      selector.profile_options.company_types[0] ??
      "other",
  );
  const [departmentTypes, setDepartmentTypes] = useState<string[]>(
    initialCompanyProfile?.department_types ?? [],
  );
  const [serviceDescription, setServiceDescription] = useState(
    initialCompanyProfile?.service_description ?? "",
  );
  const [requestedFrameworks, setRequestedFrameworks] = useState<string[]>(
    initialCompanyProfile?.requested_frameworks ?? ["gdpr"],
  );
  const [usesCloud, setUsesCloud] = useState(
    initialCompanyProfile?.uses_cloud ?? false,
  );
  const [hasPhysicalBuildings, setHasPhysicalBuildings] = useState(
    initialCompanyProfile?.has_physical_buildings ?? false,
  );
  const [supportsRemoteWorkVpn, setSupportsRemoteWorkVpn] = useState(
    initialCompanyProfile?.supports_remote_work_vpn ?? false,
  );
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(
    currentAssessment?.selected_rules.map((rule) => rule.id) ??
      [selector.available_rules[0]?.id ?? ""].filter(Boolean),
  );
  const [developmentLifecycleNotes, setDevelopmentLifecycleNotes] = useState("");
  const [cloudProvider, setCloudProvider] = useState("");
  const [vpnMfaEnabled, setVpnMfaEnabled] = useState(false);
  const [physicalControlNotes, setPhysicalControlNotes] = useState("");
  const [cyberMonitoringNotes, setCyberMonitoringNotes] = useState("");
  const [itemEvidenceDrafts, setItemEvidenceDrafts] = useState<
    Record<string, { notes: string; referenceUrl: string }>
  >({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInputSidebarOpen, setIsInputSidebarOpen] = useState(false);

  const liveCompanyProfile = useMemo(
    () => {
      const vpnMfaLabel = vpnMfaEnabled ? "yes" : "no";

      return {
        company_type: companyType,
        department_types: departmentTypes,
        service_description: [
          serviceDescription.trim(),
          departmentTypes.includes("development") && developmentLifecycleNotes.trim()
            ? `Dev lifecycle notes: ${developmentLifecycleNotes.trim()}`
            : "",
          usesCloud && cloudProvider.trim()
            ? `Cloud provider: ${cloudProvider.trim()}`
            : "",
          supportsRemoteWorkVpn ? `VPN MFA enabled: ${vpnMfaLabel}` : "",
          hasPhysicalBuildings && physicalControlNotes.trim()
            ? `Physical controls: ${physicalControlNotes.trim()}`
            : "",
          (departmentTypes.includes("cyber") ||
            serviceDescription.toLowerCase().includes("soc")) &&
          cyberMonitoringNotes.trim()
            ? `Cyber monitoring: ${cyberMonitoringNotes.trim()}`
            : "",
        ]
          .filter(Boolean)
          .join(" | "),
        requested_frameworks: requestedFrameworks,
        uses_cloud: usesCloud,
        has_physical_buildings: hasPhysicalBuildings,
        supports_remote_work_vpn: supportsRemoteWorkVpn,
      };
    },
    [
      companyType,
      departmentTypes,
      serviceDescription,
      requestedFrameworks,
      usesCloud,
      hasPhysicalBuildings,
      supportsRemoteWorkVpn,
      developmentLifecycleNotes,
      cloudProvider,
      vpnMfaEnabled,
      physicalControlNotes,
      cyberMonitoringNotes,
    ],
  );

  const liveAssessment = useMemo<GDPRAssessmentResponse>(() => {
    const selectedRules = selector.available_rules.filter((rule) =>
      selectedRuleIds.includes(rule.id),
    );
    const selectedRuleIdsSet = new Set(selectedRuleIds);
    const checklistItems = selectedRules.flatMap((rule) => {
      const sourceItems = currentAssessment?.checklist_items.filter(
        (item) => item.rule_id === rule.id,
      );

      if (sourceItems !== undefined && sourceItems.length > 0) {
        return sourceItems;
      }

      return rule.checklist_item_ids.map((itemId, index) =>
        createChecklistItemPreview(rule, itemId, index),
      );
    });
    const summary = buildPrioritySummary(checklistItems);
    const recommendedRuleIds =
      currentAssessment?.recommended_rule_ids ?? selectedRuleIds;

    return {
      assessment_id: currentAssessment?.assessment_id ?? "draft-preview",
      created_at: currentAssessment?.created_at ?? new Date().toISOString(),
      request: {
        selected_rule_ids: selectedRuleIds,
        company_profile: liveCompanyProfile,
      },
      domain_mode: currentAssessment?.domain_mode ?? selector.domain_mode,
      selected_rules: selectedRules,
      checklist_items: checklistItems,
      recommended_rule_ids: recommendedRuleIds,
      summary: {
        selected_rule_count: selectedRuleIdsSet.size,
        total_items: summary.total_items,
        high_priority_items: summary.high_priority_items,
        medium_priority_items: summary.medium_priority_items,
        low_priority_items: summary.low_priority_items,
        recommended_rule_count: recommendedRuleIds.length,
      },
    };
  }, [
    currentAssessment,
    liveCompanyProfile,
    selector.available_rules,
    selector.domain_mode,
    selectedRuleIds,
  ]);

  async function handleGenerateChecklist() {
    setIsSubmitting(true);

    try {
      setErrorMessage(null);
      setStatusMessage(null);
      const nextAssessment = await createAssessment({
        selectedRuleIds,
        companyProfile: liveCompanyProfile,
      });
      setCurrentAssessment(nextAssessment);
      setHistory((currentHistory) => [
        {
          assessment_id: nextAssessment.assessment_id,
          created_at: nextAssessment.created_at,
          company_type:
            nextAssessment.request.company_profile?.company_type ?? "other",
          service_description:
            nextAssessment.request.company_profile?.service_description ?? "",
          selected_rule_labels: nextAssessment.selected_rules.map(
            (rule) => rule.label,
          ),
          total_items: nextAssessment.summary.total_items,
          high_priority_items: nextAssessment.summary.high_priority_items,
          medium_priority_items: nextAssessment.summary.medium_priority_items,
          low_priority_items: nextAssessment.summary.low_priority_items,
        },
        ...currentHistory.filter(
          (assessment) =>
            assessment.assessment_id !== nextAssessment.assessment_id,
        ),
      ]);
      const generatedAt = formatTimestamp(nextAssessment.created_at);
      setStatusMessage(
        `Assessment saved at ${generatedAt} (${nextAssessment.checklist_items.length} items).`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while generating the assessment.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveChecklistItem(
    item: ChecklistItem,
    nextStatus: ChecklistStatus,
  ) {
    if (liveAssessment.assessment_id === "draft-preview") {
      setErrorMessage("Generate and save an assessment before editing checklist items.");
      return;
    }

    const draft = itemEvidenceDrafts[item.id] ?? { notes: "", referenceUrl: "" };
    const evidenceEntries: EvidenceEntry[] =
      draft.notes.trim() || draft.referenceUrl.trim()
        ? [
            {
              id: `${item.id}-evidence`,
              label: "Operator evidence note",
              notes: draft.notes.trim() || null,
              reference_url: draft.referenceUrl.trim() || null,
              created_at: new Date().toISOString(),
            },
          ]
        : item.evidence_entries;

    try {
      setErrorMessage(null);
      const nextAssessment = await updateAssessmentChecklistItem({
        assessmentId: liveAssessment.assessment_id,
        checklistItemId: item.id,
        status: nextStatus,
        evidenceEntries,
      });
      setCurrentAssessment(nextAssessment);
      setItemEvidenceDrafts((currentDrafts) => ({
        ...currentDrafts,
        [item.id]: {
          notes: draft.notes,
          referenceUrl: draft.referenceUrl,
        },
      }));
      setStatusMessage(`Updated checklist item "${item.title}".`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while updating checklist item.";
      setErrorMessage(message);
    }
  }

  function handleExportReport() {
    const reportHtml = buildAssessmentReportHtml({
      selector,
      assessment: liveAssessment,
      history,
    });
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const downloadUrl = globalThis.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `regcheck-report-${liveAssessment.assessment_id}.html`;
    downloadLink.rel = "noopener noreferrer";
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    globalThis.URL.revokeObjectURL(downloadUrl);
    setStatusMessage(
      "Report exported as HTML. Open it in the browser and print to PDF if needed.",
    );
    setErrorMessage(null);
  }

  function toggleRule(ruleId: string) {
    setSelectedRuleIds((currentRuleIds) =>
      currentRuleIds.includes(ruleId)
        ? currentRuleIds.filter((currentRuleId) => currentRuleId !== ruleId)
        : [...currentRuleIds, ruleId],
    );
  }

  function toggleDepartment(departmentType: string) {
    setDepartmentTypes((currentDepartments) =>
      currentDepartments.includes(departmentType)
        ? currentDepartments.filter(
            (currentDepartment) => currentDepartment !== departmentType,
          )
        : [...currentDepartments, departmentType],
    );
  }

  function toggleFramework(framework: string) {
    setRequestedFrameworks((currentFrameworks) =>
      currentFrameworks.includes(framework)
        ? currentFrameworks.filter(
            (currentFramework) => currentFramework !== framework,
          )
        : [...currentFrameworks, framework],
    );
  }

  return (
    <section
      className={`playground-layout ${isInputSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <LiveBackendInputSidebar
        cloudProvider={cloudProvider}
        companyType={companyType}
        cyberMonitoringNotes={cyberMonitoringNotes}
        departmentTypes={departmentTypes}
        developmentLifecycleNotes={developmentLifecycleNotes}
        errorMessage={errorMessage}
        hasPhysicalBuildings={hasPhysicalBuildings}
        isOpen={isInputSidebarOpen}
        isSubmitting={isSubmitting}
        onCloudProviderChange={setCloudProvider}
        onClose={() => {
          setIsInputSidebarOpen(false);
        }}
        onCompanyTypeChange={setCompanyType}
        onCyberMonitoringNotesChange={setCyberMonitoringNotes}
        onDevelopmentLifecycleNotesChange={setDevelopmentLifecycleNotes}
        onExportReport={handleExportReport}
        onGenerateAssessment={() => {
          void handleGenerateChecklist();
        }}
        onOpen={() => {
          setIsInputSidebarOpen(true);
        }}
        onPhysicalControlNotesChange={setPhysicalControlNotes}
        onServiceDescriptionChange={setServiceDescription}
        onToggleDepartment={toggleDepartment}
        onToggleFramework={toggleFramework}
        onToggleHasPhysicalBuildings={() => {
          setHasPhysicalBuildings((currentValue: boolean) => !currentValue);
        }}
        onToggleRule={toggleRule}
        onToggleSupportsRemoteWorkVpn={() => {
          setSupportsRemoteWorkVpn((currentValue: boolean) => !currentValue);
        }}
        onToggleUsesCloud={() => {
          setUsesCloud((currentValue: boolean) => !currentValue);
        }}
        onToggleVpnMfaEnabled={() => {
          setVpnMfaEnabled((currentValue) => !currentValue);
        }}
        physicalControlNotes={physicalControlNotes}
        requestedFrameworks={requestedFrameworks}
        selectedRuleIds={selectedRuleIds}
        selector={selector}
        serviceDescription={serviceDescription}
        statusMessage={statusMessage}
        supportsRemoteWorkVpn={supportsRemoteWorkVpn}
        usesCloud={usesCloud}
        vpnMfaEnabled={vpnMfaEnabled}
      />

      <div className="playground-main">
        <article className="panel panel-highlight">

        <p className="panel-kicker">Assessment output</p>
        {liveAssessment ? (
          <>
            <h2>{liveAssessment.domain_mode.label}</h2>
            <p>{liveAssessment.domain_mode.description}</p>

            <div className="mini-metric-grid">
              <MetricTile
                description="Controls selected for this company context"
                label="Selected rules"
                value={String(liveAssessment.summary.selected_rule_count)}
              />
              <MetricTile
                description="Checklist items that now need evidence"
                label="Checklist items"
                value={String(liveAssessment.summary.total_items)}
              />
              <MetricTile
                description="Items to address first"
                label="High priority"
                value={String(liveAssessment.summary.high_priority_items)}
              />
              <MetricTile
                description="Rules suggested by the profile"
                label="Recommendations"
                value={String(liveAssessment.summary.recommended_rule_count)}
              />
            </div>

            <ResponseBlock title="Recommended rules from profile">
              {liveAssessment.recommended_rule_ids.map((ruleId) => (
                <li key={ruleId}>{ruleId}</li>
              ))}
            </ResponseBlock>

            <ResponseBlock title="Selected rules">
              {liveAssessment.selected_rules.map((rule) => (
                <li key={rule.id}>{rule.label}</li>
              ))}
            </ResponseBlock>

            <ResponseBlock title="Checklist items">
              {liveAssessment.checklist_items.map((item) => {
                const currentDraft = itemEvidenceDrafts[item.id] ?? {
                  notes: "",
                  referenceUrl: "",
                };
                const savedDraft = getSavedEvidenceDraft(item);
                const hasUnsavedEvidenceDraft =
                  normalizeEvidenceDraft(currentDraft.notes) !==
                    normalizeEvidenceDraft(savedDraft.notes) ||
                  normalizeEvidenceDraft(currentDraft.referenceUrl) !==
                    normalizeEvidenceDraft(savedDraft.referenceUrl);

                return (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    {hasUnsavedEvidenceDraft && (
                      <span className="status-note">Unsaved evidence draft</span>
                    )}
                    <span>{item.priority}</span>
                    <label>
                      Status
                      {" "}
                      <select
                        className="rule-checkbox"
                        defaultValue={item.status}
                        onChange={(event) => {
                          void handleSaveChecklistItem(
                            item,
                            event.target.value as ChecklistStatus,
                          );
                        }}
                      >
                        <option value="pending">pending</option>
                        <option value="in_progress">in_progress</option>
                        <option value="done">done</option>
                      </select>
                    </label>
                    <span>{item.concrete_action}</span>
                    <span>{item.evidence_request}</span>
                    <textarea
                      className="rule-checkbox"
                      onChange={(event) => {
                        setItemEvidenceDrafts((current) => ({
                          ...current,
                          [item.id]: {
                            notes: event.target.value,
                            referenceUrl: current[item.id]?.referenceUrl ?? "",
                          },
                        }));
                      }}
                      placeholder="Evidence notes or location details"
                      rows={2}
                      value={currentDraft.notes}
                    />
                    <input
                      className="rule-checkbox"
                      onChange={(event) => {
                        setItemEvidenceDrafts((current) => ({
                          ...current,
                          [item.id]: {
                            notes: current[item.id]?.notes ?? "",
                            referenceUrl: event.target.value,
                          },
                        }));
                      }}
                      placeholder="Evidence URL (optional)"
                      type="url"
                      value={currentDraft.referenceUrl}
                    />
                    <button
                      className="secondary-button"
                      onClick={() => {
                        void handleSaveChecklistItem(item, item.status);
                      }}
                      type="button"
                    >
                      Save evidence metadata
                    </button>
                    {item.evidence_entries.length > 0 && (
                      <span>
                        Saved evidence entries: {String(item.evidence_entries.length)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ResponseBlock>
          </>
        ) : (
          <p className="status-note">No assessment has been loaded yet.</p>
        )}

        <ResponseBlock title="Assessment history">
          {history.map((item) => (
            <li key={item.assessment_id}>
              <strong>{item.company_type}</strong>
              <span>{formatTimestamp(item.created_at)}</span>
              <span>
                {item.service_description || "No service description"}
              </span>
              <span>
                {item.total_items} items · {item.high_priority_items} high
                priority
              </span>
            </li>
          ))}
        </ResponseBlock>
        </article>
      </div>
    </section>
  );
}
