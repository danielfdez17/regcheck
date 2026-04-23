import { useMemo, useState } from "react";

import { OptionCard, ResponseBlock } from "./components/gdpr-playground-parts";
import {
  createAssessment,
  type AssessmentHistoryResponse,
  type CompanyProfileInput,
  type GDPRAssessmentResponse,
  type GDPRRuleSelectorResponse,
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function buildCompanyProfile(): CompanyProfileInput {
    return {
      company_type: companyType,
      department_types: departmentTypes,
      service_description: serviceDescription,
      requested_frameworks: requestedFrameworks,
      uses_cloud: usesCloud,
      has_physical_buildings: hasPhysicalBuildings,
      supports_remote_work_vpn: supportsRemoteWorkVpn,
    };
  }

  async function handleGenerateChecklist() {
    setIsSubmitting(true);

    try {
      setErrorMessage(null);
      setStatusMessage(null);
      const nextAssessment = await createAssessment({
        selectedRuleIds,
        companyProfile: buildCompanyProfile(),
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

  function handleExportReport() {
    if (currentAssessment === null) {
      setErrorMessage("Generate an assessment before exporting the report.");
      return;
    }

    const reportHtml = buildAssessmentReportHtml({
      selector,
      assessment: currentAssessment,
      history,
    });
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const downloadUrl = globalThis.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `regcheck-report-${currentAssessment.assessment_id}.html`;
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
    <section className="playground-grid">
      <article className="panel panel-playground">
        <p className="panel-kicker">Live backend input</p>
        <h2>Build the company profile and choose the controls</h2>
        <p className="panel-copy">
          Every assessment is stored in SQLite, so the dashboard keeps a real
          history instead of discarding each result after render.
        </p>

        <label aria-label="Company type" className="rule-card">
          <span>
            <strong>Company type</strong>
          </span>
          <select
            className="rule-checkbox"
            onChange={(event) => {
              setCompanyType(event.target.value);
            }}
            value={companyType}
          >
            {selector.profile_options.company_types.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label aria-label="Service description" className="rule-card">
          <span>
            <strong>Service to be audited</strong>
            <span>Describe what the company does.</span>
          </span>
          <textarea
            className="rule-checkbox"
            onChange={(event) => {
              setServiceDescription(event.target.value);
            }}
            placeholder="Cyber SOC services, web audits, satellite telemetry..."
            rows={3}
            value={serviceDescription}
          />
        </label>

        <p className="response-label">Department types</p>
        <div className="rule-list">
          {selector.profile_options.department_types.map((departmentType) => (
            <OptionCard
              ariaLabel={departmentType}
              checked={departmentTypes.includes(departmentType)}
              key={departmentType}
              label={departmentType}
              onChange={() => toggleDepartment(departmentType)}
            />
          ))}
        </div>

        <p className="response-label">Applicable frameworks</p>
        <div className="rule-list">
          {selector.profile_options.framework_options.map((framework) => (
            <OptionCard
              ariaLabel={framework}
              checked={requestedFrameworks.includes(framework)}
              key={framework}
              label={framework}
              onChange={() => toggleFramework(framework)}
            />
          ))}
        </div>

        <p className="response-label">Operational context</p>
        <div className="rule-list">
          <OptionCard
            ariaLabel="Cloud usage"
            checked={usesCloud}
            label="Cloud usage"
            onChange={() =>
              setUsesCloud((currentValue: boolean) => !currentValue)
            }
          />
          <OptionCard
            ariaLabel="Physical buildings with access control"
            checked={hasPhysicalBuildings}
            label="Physical buildings with access control"
            onChange={() =>
              setHasPhysicalBuildings((currentValue: boolean) => !currentValue)
            }
          />
          <OptionCard
            ariaLabel="Remote work over VPN"
            checked={supportsRemoteWorkVpn}
            label="Remote work over VPN"
            onChange={() =>
              setSupportsRemoteWorkVpn((currentValue: boolean) => !currentValue)
            }
          />
        </div>

        <p className="response-label">Manual rule override (optional)</p>

        <div className="rule-list">
          {selector.available_rules.map((rule) => (
            <OptionCard
              ariaLabel={rule.label}
              checked={selectedRuleIds.includes(rule.id)}
              description={rule.description}
              key={rule.id}
              label={rule.label}
              onChange={() => toggleRule(rule.id)}
            />
          ))}
        </div>

        <button
          className="primary-button"
          disabled={isSubmitting || selectedRuleIds.length === 0}
          onClick={() => {
            void handleGenerateChecklist();
          }}
          type="button"
        >
          {isSubmitting ? "Saving assessment..." : "Generate assessment"}
        </button>

        <button
          className="secondary-button"
          disabled={currentAssessment === null}
          onClick={handleExportReport}
          type="button"
        >
          Export report
        </button>

        <p className="status-hint">
          The export generates a self-contained HTML report with the sections
          requested in the project brief.
        </p>

        {errorMessage && <p className="status-note">{errorMessage}</p>}
        {statusMessage && <p className="status-note">{statusMessage}</p>}
      </article>

      <article className="panel panel-highlight">
        <p className="panel-kicker">Assessment output</p>
        {currentAssessment ? (
          <>
            <h2>{currentAssessment.domain_mode.label}</h2>
            <p>{currentAssessment.domain_mode.description}</p>

            <div className="mini-metric-grid">
              <MetricTile
                description="Controls selected for this company context"
                label="Selected rules"
                value={String(currentAssessment.summary.selected_rule_count)}
              />
              <MetricTile
                description="Checklist items that now need evidence"
                label="Checklist items"
                value={String(currentAssessment.summary.total_items)}
              />
              <MetricTile
                description="Items to address first"
                label="High priority"
                value={String(currentAssessment.summary.high_priority_items)}
              />
              <MetricTile
                description="Rules suggested by the profile"
                label="Recommendations"
                value={String(currentAssessment.summary.recommended_rule_count)}
              />
            </div>

            <ResponseBlock title="Recommended rules from profile">
              {currentAssessment.recommended_rule_ids.map((ruleId) => (
                <li key={ruleId}>{ruleId}</li>
              ))}
            </ResponseBlock>

            <ResponseBlock title="Selected rules">
              {currentAssessment.selected_rules.map((rule) => (
                <li key={rule.id}>{rule.label}</li>
              ))}
            </ResponseBlock>

            <ResponseBlock title="Checklist items">
              {currentAssessment.checklist_items.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.priority}</span>
                  <span>{item.concrete_action}</span>
                  <span>{item.evidence_request}</span>
                </li>
              ))}
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
    </section>
  );
}
