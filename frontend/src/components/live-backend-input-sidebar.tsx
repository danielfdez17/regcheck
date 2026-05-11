import { OptionCard } from "./gdpr-playground-parts";
import type { GDPRRuleSelectorResponse } from "../lib/regcheck-api";

type LiveBackendInputSidebarProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  selector: GDPRRuleSelectorResponse;
  companyType: string;
  onCompanyTypeChange: (value: string) => void;
  serviceDescription: string;
  onServiceDescriptionChange: (value: string) => void;
  departmentTypes: string[];
  onToggleDepartment: (departmentType: string) => void;
  selectedRuleIds: string[];
  onToggleRule: (ruleId: string) => void;
  requestedFrameworks: string[];
  onToggleFramework: (framework: string) => void;
  usesCloud: boolean;
  onToggleUsesCloud: () => void;
  hasPhysicalBuildings: boolean;
  onToggleHasPhysicalBuildings: () => void;
  supportsRemoteWorkVpn: boolean;
  onToggleSupportsRemoteWorkVpn: () => void;
  developmentLifecycleNotes: string;
  onDevelopmentLifecycleNotesChange: (value: string) => void;
  cloudProvider: string;
  onCloudProviderChange: (value: string) => void;
  vpnMfaEnabled: boolean;
  onToggleVpnMfaEnabled: () => void;
  physicalControlNotes: string;
  onPhysicalControlNotesChange: (value: string) => void;
  cyberMonitoringNotes: string;
  onCyberMonitoringNotesChange: (value: string) => void;
  isSubmitting: boolean;
  onGenerateAssessment: () => void;
  onExportReport: () => void;
  errorMessage: string | null;
  statusMessage: string | null;
};

export function LiveBackendInputSidebar({
  isOpen,
  onOpen,
  onClose,
  selector,
  companyType,
  onCompanyTypeChange,
  serviceDescription,
  onServiceDescriptionChange,
  departmentTypes,
  onToggleDepartment,
  selectedRuleIds,
  onToggleRule,
  requestedFrameworks,
  onToggleFramework,
  usesCloud,
  onToggleUsesCloud,
  hasPhysicalBuildings,
  onToggleHasPhysicalBuildings,
  supportsRemoteWorkVpn,
  onToggleSupportsRemoteWorkVpn,
  developmentLifecycleNotes,
  onDevelopmentLifecycleNotesChange,
  cloudProvider,
  onCloudProviderChange,
  vpnMfaEnabled,
  onToggleVpnMfaEnabled,
  physicalControlNotes,
  onPhysicalControlNotesChange,
  cyberMonitoringNotes,
  onCyberMonitoringNotesChange,
  isSubmitting,
  onGenerateAssessment,
  onExportReport,
  errorMessage,
  statusMessage,
}: Readonly<LiveBackendInputSidebarProps>) {
  const sidebarSections = [
    { id: "company-type", label: "Company type", icon: "CT" },
    { id: "service-description", label: "Service description", icon: "SD" },
    { id: "department-types", label: "Department types", icon: "DT" },
    { id: "rules-applicable", label: "Rules to be applicable", icon: "RR" },
  ] as const;

  const hasDynamicFollowUps =
    departmentTypes.includes("development") ||
    usesCloud ||
    supportsRemoteWorkVpn ||
    hasPhysicalBuildings ||
    departmentTypes.includes("cyber") ||
    serviceDescription.toLowerCase().includes("soc");

  return (
    <aside
      className={`panel panel-playground panel-sidebar ${isOpen ? "panel-sidebar-expanded" : "panel-sidebar-collapsed"}`}
    >
      {isOpen ? (
        <>
          <div className="panel-sidebar-header">
            <p className="panel-kicker">Live backend input</p>
            <button
              className="secondary-button sidebar-close-button"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
          <h2>Build the company profile and choose the controls</h2>
          <p className="panel-copy">
            Every assessment is stored in SQLite, so the dashboard keeps a real
            history instead of discarding each result after render.
          </p>

          <p className="response-label" id="company-type">Company type</p>
          <label aria-label="Company type" className="rule-card">
            <span>
              <strong>Company type</strong>
            </span>
            <select
              className="rule-checkbox"
              onChange={(event) => {
                onCompanyTypeChange(event.target.value);
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

          <p className="response-label" id="service-description">Service description</p>
          <label aria-label="Service description" className="rule-card">
            <span>
              <strong>Service to be audited</strong>
              <span>Describe what the company does.</span>
            </span>
            <textarea
              className="rule-checkbox"
              onChange={(event) => {
                onServiceDescriptionChange(event.target.value);
              }}
              placeholder="Cyber SOC services, web audits, satellite telemetry..."
              rows={3}
              value={serviceDescription}
            />
          </label>

          <p className="response-label" id="department-types">Department types</p>
          <div className="rule-list">
            {selector.profile_options.department_types.map((departmentType) => (
              <OptionCard
                ariaLabel={departmentType}
                checked={departmentTypes.includes(departmentType)}
                key={departmentType}
                label={departmentType}
                onChange={() => onToggleDepartment(departmentType)}
              />
            ))}
          </div>

          <p className="response-label" id="rules-applicable">Rules to be applicable</p>
          <div className="rule-list">
            {selector.available_rules.map((rule) => (
              <OptionCard
                ariaLabel={rule.label}
                checked={selectedRuleIds.includes(rule.id)}
                description={rule.description}
                key={rule.id}
                label={rule.label}
                onChange={() => onToggleRule(rule.id)}
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
                onChange={() => onToggleFramework(framework)}
              />
            ))}
          </div>

          <p className="response-label">Operational context</p>
          <div className="rule-list">
            <OptionCard
              ariaLabel="Cloud usage"
              checked={usesCloud}
              label="Cloud usage"
              onChange={onToggleUsesCloud}
            />
            <OptionCard
              ariaLabel="Physical buildings with access control"
              checked={hasPhysicalBuildings}
              label="Physical buildings with access control"
              onChange={onToggleHasPhysicalBuildings}
            />
            <OptionCard
              ariaLabel="Remote work over VPN"
              checked={supportsRemoteWorkVpn}
              label="Remote work over VPN"
              onChange={onToggleSupportsRemoteWorkVpn}
            />
          </div>

          {hasDynamicFollowUps && (
            <>
              <p className="response-label">Dynamic follow-up questions</p>
              {departmentTypes.includes("development") && (
                <label aria-label="Dev lifecycle notes" className="rule-card">
                  <span>
                    <strong>Development follow-up</strong>
                    <span>Describe secure SDLC or DevSecOps practices.</span>
                  </span>
                  <textarea
                    className="rule-checkbox"
                    onChange={(event) => {
                      onDevelopmentLifecycleNotesChange(event.target.value);
                    }}
                    rows={2}
                    value={developmentLifecycleNotes}
                  />
                </label>
              )}
              {usesCloud && (
                <label aria-label="Cloud provider" className="rule-card">
                  <span>
                    <strong>Cloud follow-up</strong>
                    <span>Primary cloud provider/environment.</span>
                  </span>
                  <input
                    className="rule-checkbox"
                    onChange={(event) => {
                      onCloudProviderChange(event.target.value);
                    }}
                    type="text"
                    value={cloudProvider}
                  />
                </label>
              )}
              {supportsRemoteWorkVpn && (
                <OptionCard
                  ariaLabel="VPN uses MFA"
                  checked={vpnMfaEnabled}
                  label="VPN access is protected with MFA"
                  onChange={onToggleVpnMfaEnabled}
                />
              )}
              {hasPhysicalBuildings && (
                <label aria-label="Physical controls" className="rule-card">
                  <span>
                    <strong>Physical controls follow-up</strong>
                    <span>Summarize access controls/camera coverage.</span>
                  </span>
                  <textarea
                    className="rule-checkbox"
                    onChange={(event) => {
                      onPhysicalControlNotesChange(event.target.value);
                    }}
                    rows={2}
                    value={physicalControlNotes}
                  />
                </label>
              )}
              {(departmentTypes.includes("cyber") ||
                serviceDescription.toLowerCase().includes("soc")) && (
                <label aria-label="Cyber monitoring notes" className="rule-card">
                  <span>
                    <strong>Cyber follow-up</strong>
                    <span>Describe monitoring and incident response setup.</span>
                  </span>
                  <textarea
                    className="rule-checkbox"
                    onChange={(event) => {
                      onCyberMonitoringNotesChange(event.target.value);
                    }}
                    rows={2}
                    value={cyberMonitoringNotes}
                  />
                </label>
              )}
            </>
          )}

          <button
            className="primary-button"
            disabled={isSubmitting || selectedRuleIds.length === 0}
            onClick={onGenerateAssessment}
            type="button"
          >
            {isSubmitting ? "Saving assessment..." : "Generate assessment"}
          </button>

          <button
            className="secondary-button"
            disabled={selectedRuleIds.length === 0}
            onClick={onExportReport}
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
        </>
      ) : (
        <div className="sidebar-icon-rail">
          <button
            aria-label="Open Live Backend Input sidebar"
            className="sidebar-rail-toggle"
            onClick={onOpen}
            type="button"
          >
            Open
          </button>
          {sidebarSections.map((section) => (
            <button
              aria-label={section.label}
              className="sidebar-section-icon"
              key={section.id}
              onClick={onOpen}
              title={section.label}
              type="button"
            >
              {section.icon}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
