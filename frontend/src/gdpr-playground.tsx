import { useState } from "react";

import {
  createChecklist,
  type CompanyProfileInput,
  type GDPRChecklistResponse,
  type GDPRRuleSelectorResponse,
} from "./lib/regcheck-api";

type GdprPlaygroundProps = {
  initialSelector: GDPRRuleSelectorResponse;
  initialChecklist: GDPRChecklistResponse;
};

export default function GdprPlayground({
  initialSelector,
  initialChecklist,
}: Readonly<GdprPlaygroundProps>) {
  const [selector] = useState(initialSelector);
  const [companyType, setCompanyType] = useState(
    selector.profile_options.company_types[0] ?? "other",
  );
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([]);
  const [serviceDescription, setServiceDescription] = useState("");
  const [requestedFrameworks, setRequestedFrameworks] = useState<string[]>([
    "gdpr",
  ]);
  const [usesCloud, setUsesCloud] = useState(false);
  const [hasPhysicalBuildings, setHasPhysicalBuildings] = useState(false);
  const [supportsRemoteWorkVpn, setSupportsRemoteWorkVpn] = useState(false);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(
    initialChecklist.selected_rules.map((rule) => rule.id),
  );
  const [checklist, setChecklist] = useState(initialChecklist);
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
      const nextChecklist = await createChecklist({
        selectedRuleIds,
        companyProfile: buildCompanyProfile(),
      });
      setChecklist(nextChecklist);
      const generatedAt = new Date().toLocaleTimeString();
      setStatusMessage(
        `Checklist generated at ${generatedAt} (${nextChecklist.checklist_items.length} items).`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while generating the checklist.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
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
        <h2>Build company profile and choose rules</h2>
        <p className="panel-copy">
          This form collects company context (type, departments, service, and
          operational traits) and generates a prioritized checklist with
          concrete evidence requests.
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
            <label
              aria-label={departmentType}
              className="rule-card"
              key={departmentType}
            >
              <input
                checked={departmentTypes.includes(departmentType)}
                className="rule-checkbox"
                onChange={() => toggleDepartment(departmentType)}
                type="checkbox"
              />
              <span>
                <strong>{departmentType}</strong>
              </span>
            </label>
          ))}
        </div>

        <p className="response-label">Applicable frameworks</p>
        <div className="rule-list">
          {selector.profile_options.framework_options.map((framework) => (
            <label aria-label={framework} className="rule-card" key={framework}>
              <input
                checked={requestedFrameworks.includes(framework)}
                className="rule-checkbox"
                onChange={() => toggleFramework(framework)}
                type="checkbox"
              />
              <span>
                <strong>{framework}</strong>
              </span>
            </label>
          ))}
        </div>

        <p className="response-label">Operational context</p>
        <div className="rule-list">
          <label aria-label="Cloud usage" className="rule-card">
            <input
              checked={usesCloud}
              className="rule-checkbox"
              onChange={() => setUsesCloud((currentValue) => !currentValue)}
              type="checkbox"
            />
            <span>
              <strong>Cloud usage</strong>
            </span>
          </label>
          <label
            aria-label="Physical buildings with access control"
            className="rule-card"
          >
            <input
              checked={hasPhysicalBuildings}
              className="rule-checkbox"
              onChange={() =>
                setHasPhysicalBuildings((currentValue) => !currentValue)
              }
              type="checkbox"
            />
            <span>
              <strong>Physical buildings with access control</strong>
            </span>
          </label>
          <label aria-label="Remote work over VPN" className="rule-card">
            <input
              checked={supportsRemoteWorkVpn}
              className="rule-checkbox"
              onChange={() =>
                setSupportsRemoteWorkVpn((currentValue) => !currentValue)
              }
              type="checkbox"
            />
            <span>
              <strong>Remote work over VPN</strong>
            </span>
          </label>
        </div>

        <p className="response-label">Manual rule override (optional)</p>

        <div className="rule-list">
          {selector.available_rules.map((rule) => (
            <label aria-label={rule.label} className="rule-card" key={rule.id}>
              <input
                checked={selectedRuleIds.includes(rule.id)}
                className="rule-checkbox"
                onChange={() => toggleRule(rule.id)}
                type="checkbox"
              />
              <span>
                <strong>{rule.label}</strong>
                <span>{rule.description}</span>
              </span>
            </label>
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
          {isSubmitting ? "Generating checklist..." : "Generate checklist"}
        </button>

        {errorMessage && <p className="status-note">{errorMessage}</p>}
        {statusMessage && <p className="status-note">{statusMessage}</p>}
      </article>

      <article className="panel panel-highlight">
        <p className="panel-kicker">API response</p>
        <h2>{checklist.domain_mode.label}</h2>
        <p>{checklist.domain_mode.description}</p>

        <div className="response-block">
          <p className="response-label">Recommended rules from profile</p>
          <ul className="checklist-mini">
            {checklist.recommended_rule_ids.map((ruleId) => (
              <li key={ruleId}>{ruleId}</li>
            ))}
          </ul>
        </div>

        <div className="response-block">
          <p className="response-label">Selected rules</p>
          <ul className="checklist-mini">
            {checklist.selected_rules.map((rule) => (
              <li key={rule.id}>{rule.label}</li>
            ))}
          </ul>
        </div>

        <div className="response-block">
          <p className="response-label">Checklist items</p>
          <ul className="checklist-mini">
            {checklist.checklist_items.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.priority}</span>
                <span>{item.concrete_action}</span>
                <span>{item.evidence_request}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
