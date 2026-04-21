import { useState } from "react";

import { OptionCard, ResponseBlock } from "./components/gdpr-playground-parts";
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
            onChange={() => setUsesCloud((currentValue) => !currentValue)}
          />
          <OptionCard
            ariaLabel="Physical buildings with access control"
            checked={hasPhysicalBuildings}
            label="Physical buildings with access control"
            onChange={() =>
              setHasPhysicalBuildings((currentValue) => !currentValue)
            }
          />
          <OptionCard
            ariaLabel="Remote work over VPN"
            checked={supportsRemoteWorkVpn}
            label="Remote work over VPN"
            onChange={() =>
              setSupportsRemoteWorkVpn((currentValue) => !currentValue)
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
          {isSubmitting ? "Generating checklist..." : "Generate checklist"}
        </button>

        {errorMessage && <p className="status-note">{errorMessage}</p>}
        {statusMessage && <p className="status-note">{statusMessage}</p>}
      </article>

      <article className="panel panel-highlight">
        <p className="panel-kicker">API response</p>
        <h2>{checklist.domain_mode.label}</h2>
        <p>{checklist.domain_mode.description}</p>

        <ResponseBlock title="Recommended rules from profile">
          {checklist.recommended_rule_ids.map((ruleId) => (
            <li key={ruleId}>{ruleId}</li>
          ))}
        </ResponseBlock>

        <ResponseBlock title="Selected rules">
          {checklist.selected_rules.map((rule) => (
            <li key={rule.id}>{rule.label}</li>
          ))}
        </ResponseBlock>

        <ResponseBlock title="Checklist items">
          {checklist.checklist_items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.priority}</span>
              <span>{item.concrete_action}</span>
              <span>{item.evidence_request}</span>
            </li>
          ))}
        </ResponseBlock>
      </article>
    </section>
  );
}
