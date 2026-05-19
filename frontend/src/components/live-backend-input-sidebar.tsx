import { useAppTranslation } from "../i18n/hooks/use-app-translation";
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
  onExportCsv: () => void;
  onExportMarkdown: () => void;
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
  onExportCsv,
  onExportMarkdown,
  errorMessage,
  statusMessage,
}: Readonly<LiveBackendInputSidebarProps>) {
  const { t } = useAppTranslation("playground");
  const { t: tCommon } = useAppTranslation("common");

  const sidebarSections = [
    { id: "company-type", label: t("sidebar.sections.companyType"), icon: "CT" },
    {
      id: "service-description",
      label: t("sidebar.sections.serviceDescription"),
      icon: "SD",
    },
    {
      id: "department-types",
      label: t("sidebar.sections.departmentTypes"),
      icon: "DT",
    },
    {
      id: "rules-applicable",
      label: t("sidebar.sections.rulesApplicable"),
      icon: "RR",
    },
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
            <p className="panel-kicker">{t("sidebar.kicker")}</p>
            <button
              className="secondary-button sidebar-close-button"
              onClick={onClose}
              type="button"
            >
              {tCommon("actions.close")}
            </button>
          </div>
          <h2>{t("sidebar.title")}</h2>
          <p className="panel-copy">{t("sidebar.description")}</p>

          <p className="response-label" id="company-type">
            {t("sidebar.companyType.label")}
          </p>
          <label
            aria-label={t("sidebar.companyType.ariaLabel")}
            className="rule-card"
          >
            <span>
              <strong>{t("sidebar.companyType.label")}</strong>
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

          <p className="response-label" id="service-description">
            {t("sidebar.serviceDescription.label")}
          </p>
          <label
            aria-label={t("sidebar.serviceDescription.ariaLabel")}
            className="rule-card"
          >
            <span>
              <strong>{t("sidebar.serviceDescription.serviceLabel")}</strong>
              <span>{t("sidebar.serviceDescription.serviceHint")}</span>
            </span>
            <textarea
              className="rule-checkbox"
              onChange={(event) => {
                onServiceDescriptionChange(event.target.value);
              }}
              placeholder={t("sidebar.serviceDescription.placeholder")}
              rows={3}
              value={serviceDescription}
            />
          </label>

          <p className="response-label" id="department-types">
            {t("sidebar.departmentTypes.label")}
          </p>
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

          <p className="response-label" id="rules-applicable">
            {t("sidebar.rulesApplicable.label")}
          </p>
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

          <p className="response-label">{t("sidebar.frameworks.label")}</p>
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

          <p className="response-label">{t("sidebar.operationalContext.label")}</p>
          <div className="rule-list">
            <OptionCard
              ariaLabel={t("sidebar.operationalContext.cloudUsageAria")}
              checked={usesCloud}
              label={t("sidebar.operationalContext.cloudUsage")}
              onChange={onToggleUsesCloud}
            />
            <OptionCard
              ariaLabel={t("sidebar.operationalContext.physicalBuildingsAria")}
              checked={hasPhysicalBuildings}
              label={t("sidebar.operationalContext.physicalBuildings")}
              onChange={onToggleHasPhysicalBuildings}
            />
            <OptionCard
              ariaLabel={t("sidebar.operationalContext.remoteWorkVpnAria")}
              checked={supportsRemoteWorkVpn}
              label={t("sidebar.operationalContext.remoteWorkVpn")}
              onChange={onToggleSupportsRemoteWorkVpn}
            />
          </div>

          {hasDynamicFollowUps && (
            <>
              <p className="response-label">{t("sidebar.dynamicFollowUps.label")}</p>
              {departmentTypes.includes("development") && (
                <label
                  aria-label={t("sidebar.dynamicFollowUps.development.ariaLabel")}
                  className="rule-card"
                >
                  <span>
                    <strong>{t("sidebar.dynamicFollowUps.development.title")}</strong>
                    <span>{t("sidebar.dynamicFollowUps.development.hint")}</span>
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
                <label
                  aria-label={t("sidebar.dynamicFollowUps.cloud.ariaLabel")}
                  className="rule-card"
                >
                  <span>
                    <strong>{t("sidebar.dynamicFollowUps.cloud.title")}</strong>
                    <span>{t("sidebar.dynamicFollowUps.cloud.hint")}</span>
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
                  ariaLabel={t("sidebar.dynamicFollowUps.vpnMfa.ariaLabel")}
                  checked={vpnMfaEnabled}
                  label={t("sidebar.dynamicFollowUps.vpnMfa.label")}
                  onChange={onToggleVpnMfaEnabled}
                />
              )}
              {hasPhysicalBuildings && (
                <label
                  aria-label={t("sidebar.dynamicFollowUps.physical.ariaLabel")}
                  className="rule-card"
                >
                  <span>
                    <strong>{t("sidebar.dynamicFollowUps.physical.title")}</strong>
                    <span>{t("sidebar.dynamicFollowUps.physical.hint")}</span>
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
                <label
                  aria-label={t("sidebar.dynamicFollowUps.cyber.ariaLabel")}
                  className="rule-card"
                >
                  <span>
                    <strong>{t("sidebar.dynamicFollowUps.cyber.title")}</strong>
                    <span>{t("sidebar.dynamicFollowUps.cyber.hint")}</span>
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
            {isSubmitting
              ? t("sidebar.savingAssessment")
              : t("sidebar.generateAssessment")}
          </button>

          <button
            className="secondary-button"
            disabled={selectedRuleIds.length === 0}
            onClick={onExportReport}
            type="button"
          >
            {t("sidebar.exportReport")}
          </button>

          <button
            className="secondary-button"
            disabled={selectedRuleIds.length === 0}
            onClick={onExportCsv}
            type="button"
          >
            {t("sidebar.exportCsv")}
          </button>

          <button
            className="secondary-button"
            disabled={selectedRuleIds.length === 0}
            onClick={onExportMarkdown}
            type="button"
          >
            {t("sidebar.exportMarkdown")}
          </button>

          <p className="status-hint">{t("sidebar.exportHint")}</p>

          {errorMessage && <p className="status-note">{errorMessage}</p>}
          {statusMessage && <p className="status-note">{statusMessage}</p>}
        </>
      ) : (
        <div className="sidebar-icon-rail">
          <button
            aria-label={t("sidebar.openAria")}
            className="sidebar-rail-toggle"
            onClick={onOpen}
            type="button"
          >
            {tCommon("actions.open")}
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
