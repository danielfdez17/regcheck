import { useEffect, useMemo, useState } from "react";

import { LiveBackendInputSidebar } from "./components/live-backend-input-sidebar";
import {
  ChecklistStatusSelect,
  PriorityBadge,
  ResponseBlock,
} from "./components/gdpr-playground-parts";
import { formatDateTime } from "./i18n/format";
import { useAppTranslation } from "./i18n/hooks/use-app-translation";
import i18n from "./i18n";
import {
  createAssessment,
  type AssessmentHistoryResponse,
  type AssessmentSummary,
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
  isInputSidebarOpen: boolean;
  onInputSidebarOpenChange: (isOpen: boolean) => void;
  onLiveDashboardChange?: (dashboard: LiveDashboardState) => void;
};

export type LiveDashboardState = {
  summary: AssessmentSummary;
  historyCount: number;
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
  return formatDateTime(timestamp);
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
  const ruleLabelLower = rule.label.toLowerCase();

  return {
    id: itemId,
    title: i18n.t("checklist.preview.title", {
      ns: "playground",
      ruleLabel: rule.label,
      index: index + 1,
    }),
    description: rule.description,
    priority,
    status: "pending",
    rule_id: rule.id,
    concrete_action: i18n.t("checklist.preview.concreteAction", {
      ns: "playground",
      ruleLabel: ruleLabelLower,
    }),
    evidence_request: i18n.t("checklist.preview.evidenceRequest", {
      ns: "playground",
      ruleLabel: ruleLabelLower,
      index: index + 1,
    }),
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

function buildEvidenceEntryDraft(entry: EvidenceEntry): {
  notes: string;
  referenceUrl: string;
} {
  return {
    notes: entry.notes ?? "",
    referenceUrl: entry.reference_url ?? "",
  };
}

export default function GdprPlayground({
  initialSelector,
  initialAssessment,
  initialHistory,
  isInputSidebarOpen,
  onInputSidebarOpenChange,
  onLiveDashboardChange,
}: Readonly<GdprPlaygroundProps>) {
  const { t } = useAppTranslation("playground");
  const { t: tErrors } = useAppTranslation("errors");
  const { t: tCommon } = useAppTranslation("common");
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
  const [itemEvidenceEditIds, setItemEvidenceEditIds] = useState<
    Record<string, string | null>
  >({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const liveCompanyProfile = useMemo(
    () => {
      const vpnMfaLabel = vpnMfaEnabled ? "yes" : "no";

      return {
        company_type: companyType,
        department_types: departmentTypes,
        service_description: [
          serviceDescription.trim(),
          departmentTypes.includes("development") && developmentLifecycleNotes.trim()
            ? i18n.t("profileNotes.devLifecycle", {
                ns: "playground",
                notes: developmentLifecycleNotes.trim(),
              })
            : "",
          usesCloud && cloudProvider.trim()
            ? i18n.t("profileNotes.cloudProvider", {
                ns: "playground",
                provider: cloudProvider.trim(),
              })
            : "",
          supportsRemoteWorkVpn
            ? i18n.t("profileNotes.vpnMfaEnabled", {
                ns: "playground",
                value: vpnMfaLabel,
              })
            : "",
          hasPhysicalBuildings && physicalControlNotes.trim()
            ? i18n.t("profileNotes.physicalControls", {
                ns: "playground",
                notes: physicalControlNotes.trim(),
              })
            : "",
          (departmentTypes.includes("cyber") ||
            serviceDescription.toLowerCase().includes("soc")) &&
          cyberMonitoringNotes.trim()
            ? i18n.t("profileNotes.cyberMonitoring", {
                ns: "playground",
                notes: cyberMonitoringNotes.trim(),
              })
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

  const liveDashboard = useMemo<LiveDashboardState>(
    () => ({
      summary: liveAssessment.summary,
      historyCount: history.length,
    }),
    [history.length, liveAssessment.summary],
  );

  useEffect(() => {
    onLiveDashboardChange?.(liveDashboard);
  }, [liveDashboard, onLiveDashboardChange]);

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
        tErrors("assessment.savedAt", {
          generatedAt,
          count: nextAssessment.checklist_items.length,
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : tErrors("assessment.unexpectedGenerate");
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
      setErrorMessage(tErrors("assessment.saveBeforeEdit"));
      return;
    }

    try {
      setErrorMessage(null);
      const nextAssessment = await updateAssessmentChecklistItem({
        assessmentId: liveAssessment.assessment_id,
        checklistItemId: item.id,
        status: nextStatus,
        evidenceEntries: item.evidence_entries,
      });
      setCurrentAssessment(nextAssessment);
      setStatusMessage(tErrors("assessment.updatedItem", { title: item.title }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : tErrors("assessment.unexpectedUpdate");
      setErrorMessage(message);
    }
  }

  function updateEvidenceDraft(
    itemId: string,
    nextDraft: { notes: string; referenceUrl: string },
  ) {
    setItemEvidenceDrafts((currentDrafts) => ({
      ...currentDrafts,
      [itemId]: nextDraft,
    }));
  }

  async function handleSaveEvidenceEntry(item: ChecklistItem) {
    if (liveAssessment.assessment_id === "draft-preview") {
      setErrorMessage(tErrors("assessment.saveBeforeEdit"));
      return;
    }

    const draft = itemEvidenceDrafts[item.id] ?? { notes: "", referenceUrl: "" };
    const notes = normalizeEvidenceDraft(draft.notes);
    const referenceUrl = normalizeEvidenceDraft(draft.referenceUrl);
    if (!notes && !referenceUrl) {
      setErrorMessage(tErrors("assessment.addEvidenceBeforeSave"));
      return;
    }

    const currentEditId = itemEvidenceEditIds[item.id];
    const nextEntry: EvidenceEntry = {
      id: currentEditId ?? `${item.id}-evidence-${Date.now()}`,
      label: t("checklist.operatorEvidenceNote"),
      notes: notes || null,
      reference_url: referenceUrl || null,
      created_at: new Date().toISOString(),
    };

    const nextEvidenceEntries =
      currentEditId === undefined || currentEditId === null
        ? [...item.evidence_entries, nextEntry]
        : item.evidence_entries.map((entry) =>
            entry.id === currentEditId ? nextEntry : entry,
          );

    try {
      setErrorMessage(null);
      const nextAssessment = await updateAssessmentChecklistItem({
        assessmentId: liveAssessment.assessment_id,
        checklistItemId: item.id,
        status: item.status,
        evidenceEntries: nextEvidenceEntries,
      });
      setCurrentAssessment(nextAssessment);
      updateEvidenceDraft(item.id, { notes: "", referenceUrl: "" });
      setItemEvidenceEditIds((current) => ({ ...current, [item.id]: null }));
      setStatusMessage(
        currentEditId
          ? tErrors("assessment.evidenceUpdated")
          : tErrors("assessment.evidenceSaved"),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : tErrors("assessment.unexpectedEvidenceSave");
      setErrorMessage(message);
    }
  }

  async function handleDeleteEvidenceEntry(item: ChecklistItem, entryId: string) {
    if (liveAssessment.assessment_id === "draft-preview") {
      setErrorMessage(tErrors("assessment.saveBeforeEdit"));
      return;
    }

    const nextEvidenceEntries = item.evidence_entries.filter(
      (entry) => entry.id !== entryId,
    );

    try {
      setErrorMessage(null);
      const nextAssessment = await updateAssessmentChecklistItem({
        assessmentId: liveAssessment.assessment_id,
        checklistItemId: item.id,
        status: item.status,
        evidenceEntries: nextEvidenceEntries,
      });
      setCurrentAssessment(nextAssessment);
      setItemEvidenceEditIds((current) => ({ ...current, [item.id]: null }));
      updateEvidenceDraft(item.id, { notes: "", referenceUrl: "" });
      setStatusMessage(tErrors("assessment.evidenceDeleted"));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : tErrors("assessment.unexpectedEvidenceDelete");
      setErrorMessage(message);
    }
  }

  function startEditingEvidenceEntry(itemId: string, entry: EvidenceEntry) {
    setItemEvidenceEditIds((current) => ({
      ...current,
      [itemId]: entry.id,
    }));
    updateEvidenceDraft(itemId, buildEvidenceEntryDraft(entry));
  }

  function cancelEditingEvidenceEntry(itemId: string) {
    setItemEvidenceEditIds((current) => ({
      ...current,
      [itemId]: null,
    }));
    updateEvidenceDraft(itemId, { notes: "", referenceUrl: "" });
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
    setStatusMessage(tErrors("report.exported"));
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
    <section className="playground-layout">
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
          onInputSidebarOpenChange(false);
        }}
        onCompanyTypeChange={setCompanyType}
        onCyberMonitoringNotesChange={setCyberMonitoringNotes}
        onDevelopmentLifecycleNotesChange={setDevelopmentLifecycleNotes}
        onExportReport={handleExportReport}
        onGenerateAssessment={() => {
          void handleGenerateChecklist();
        }}
        onOpen={() => {
          onInputSidebarOpenChange(true);
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

        <p className="panel-kicker">{t("output.kicker")}</p>
        {liveAssessment ? (
          <>
            <h2>{liveAssessment.domain_mode.label}</h2>
            <p>{liveAssessment.domain_mode.description}</p>

            <div className="mini-metric-grid">
              <MetricTile
                description={t("output.metrics.selectedRules.description")}
                label={t("output.metrics.selectedRules.label")}
                value={String(liveAssessment.summary.selected_rule_count)}
              />
              <MetricTile
                description={t("output.metrics.checklistItems.description")}
                label={t("output.metrics.checklistItems.label")}
                value={String(liveAssessment.summary.total_items)}
              />
              <MetricTile
                description={t("output.metrics.highPriority.description")}
                label={t("output.metrics.highPriority.label")}
                value={String(liveAssessment.summary.high_priority_items)}
              />
              <MetricTile
                description={t("output.metrics.recommendations.description")}
                label={t("output.metrics.recommendations.label")}
                value={String(liveAssessment.summary.recommended_rule_count)}
              />
            </div>

            <ResponseBlock title={t("output.recommendedRules")}>
              {liveAssessment.recommended_rule_ids.map((ruleId) => (
                <li key={ruleId}>{selector.available_rules.find((rule) => rule.id === ruleId)?.label}</li>
              ))}
            </ResponseBlock>

            <ResponseBlock title={t("output.selectedRules")}>
              {liveAssessment.selected_rules.map((rule) => (
                <li key={rule.id}>{rule.label}</li>
              ))}
            </ResponseBlock>

            <ResponseBlock title={t("output.checklistItems")}>
              {liveAssessment.checklist_items.map((item) => {
                const currentDraft = itemEvidenceDrafts[item.id] ?? {
                  notes: "",
                  referenceUrl: "",
                };
                const hasUnsavedEvidenceDraft =
                  normalizeEvidenceDraft(currentDraft.notes).length > 0 ||
                  normalizeEvidenceDraft(currentDraft.referenceUrl).length > 0;
                const isEditingExistingEvidence =
                  itemEvidenceEditIds[item.id] !== undefined &&
                  itemEvidenceEditIds[item.id] !== null;

                return (
                  <li className="checklist-item" key={item.id}>
                    <div className="checklist-item-header">
                      <strong>{item.title}</strong>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    {hasUnsavedEvidenceDraft && (
                      <span className="status-note">{t("checklist.unsavedDraft")}</span>
                    )}
                    <ChecklistStatusSelect
                      onChange={(nextStatus) => {
                        void handleSaveChecklistItem(item, nextStatus);
                      }}
                      value={item.status}
                    />
                    <span>{item.concrete_action}</span>
                    <span>{item.evidence_request}</span>
                    <textarea
                      className="rule-checkbox"
                      onChange={(event) => {
                        updateEvidenceDraft(item.id, {
                          notes: event.target.value,
                          referenceUrl: currentDraft.referenceUrl,
                        });
                      }}
                      placeholder={t("checklist.evidenceNotesPlaceholder")}
                      rows={2}
                      value={currentDraft.notes}
                    />
                    <input
                      className="rule-checkbox"
                      onChange={(event) => {
                        updateEvidenceDraft(item.id, {
                          notes: currentDraft.notes,
                          referenceUrl: event.target.value,
                        });
                      }}
                      placeholder={t("checklist.evidenceUrlPlaceholder")}
                      type="url"
                      value={currentDraft.referenceUrl}
                    />
                    <button
                      className="secondary-button"
                      onClick={() => {
                        void handleSaveEvidenceEntry(item);
                      }}
                      type="button"
                    >
                      {isEditingExistingEvidence
                        ? t("checklist.updateEvidence")
                        : t("checklist.saveEvidence")}
                    </button>
                    {isEditingExistingEvidence && (
                      <button
                        className="secondary-button"
                        onClick={() => {
                          cancelEditingEvidenceEntry(item.id);
                        }}
                        type="button"
                      >
                        {tCommon("actions.cancelEdit")}
                      </button>
                    )}
                    {item.evidence_entries.length > 0 && (
                      <div className="saved-evidence-list">
                        <span>
                          {t("checklist.savedEntries", {
                            count: item.evidence_entries.length,
                          })}
                        </span>
                        <ul className="saved-evidence-items">
                          {item.evidence_entries.map((entry) => (
                            <li key={entry.id}>
                              {entry.reference_url ? (
                                <div className="saved-evidence-url-row">
                                  <a
                                    href={entry.reference_url}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {entry.reference_url}
                                  </a>
                                  <div className="saved-evidence-actions">
                                    <button
                                      className="secondary-button"
                                      onClick={() => {
                                        startEditingEvidenceEntry(item.id, entry);
                                      }}
                                      type="button"
                                    >
                                      {tCommon("actions.edit")}
                                    </button>
                                    <button
                                      className="secondary-button"
                                      onClick={() => {
                                        void handleDeleteEvidenceEntry(item, entry.id);
                                      }}
                                      type="button"
                                    >
                                      {tCommon("actions.delete")}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="saved-evidence-main">
                                    <span>{entry.label}</span>
                                    <span>{t("checklist.noUrlSaved")}</span>
                                    {entry.notes ? <span>{entry.notes}</span> : null}
                                  </div>
                                  <div className="saved-evidence-actions">
                                    <button
                                      className="secondary-button"
                                      onClick={() => {
                                        startEditingEvidenceEntry(item.id, entry);
                                      }}
                                      type="button"
                                    >
                                      {tCommon("actions.edit")}
                                    </button>
                                    <button
                                      className="secondary-button"
                                      onClick={() => {
                                        void handleDeleteEvidenceEntry(item, entry.id);
                                      }}
                                      type="button"
                                    >
                                      {tCommon("actions.delete")}
                                    </button>
                                  </div>
                                </>
                              )}
                              {entry.reference_url && entry.notes ? (
                                <span className="saved-evidence-notes">{entry.notes}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ResponseBlock>
          </>
        ) : (
          <p className="status-note">{tErrors("assessment.notLoaded")}</p>
        )}

        <ResponseBlock title={t("output.history")}>
          {history.map((item) => (
            <li key={item.assessment_id}>
              <strong>{item.company_type}</strong>
              <span>{formatTimestamp(item.created_at)}</span>
              <span>
                {item.service_description || t("output.noServiceDescription")}
              </span>
              <span>
                {t("output.historySummary", {
                  total: item.total_items,
                  high: item.high_priority_items,
                })}
              </span>
            </li>
          ))}
        </ResponseBlock>
        </article>
      </div>
    </section>
  );
}
