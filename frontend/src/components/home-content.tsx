import type { AssessmentSummary } from "../lib/regcheck-api";
import {
  formatChecklistItemsMetricValue,
  formatHighPriorityMetricValue,
} from "../lib/assessment-metrics";
import { useAppTranslation } from "../i18n/hooks/use-app-translation";

type HeroSectionProps = {
  connected: boolean;
  errorMessage: string | null;
};

type DashboardMetricsProps = {
  summary: AssessmentSummary;
  historyCount: number;
};

type LoadingOverviewProps = {
  message: string;
};

type SelectorUnavailableProps = {
  message: string;
};

type OverviewSectionProps = {
  title: string;
  description: string;
  connected?: boolean;
  errorMessage?: string | null;
};

function OverviewSection({
  title,
  description,
  connected,
  errorMessage,
}: Readonly<OverviewSectionProps>) {
  const { t } = useAppTranslation("home");

  return (
    <section className="hero hero-overview" id="overview">
      <div>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        {connected === undefined ? null : (
          <div className="badge-row" aria-label={t("badges.ariaAvailableMode")}>
            <span className="badge">{t("badges.domainMode")}</span>
            <span className="badge badge-soft">{t("badges.checklistEntities")}</span>
            <span className="badge badge-soft">
              {connected ? t("badges.backendConnected") : t("badges.backendDisconnected")}
            </span>
          </div>
        )}
        {errorMessage ? <p className="status-note">{errorMessage}</p> : null}
      </div>
    </section>
  );
}

export function LoadingOverview({ message }: Readonly<LoadingOverviewProps>) {
  const { t } = useAppTranslation("home");

  return (
    <>
      <OverviewSection description={message} title={t("hero.title")} />
      <section className="grid">
        <article className="panel panel-highlight">
          <p className="panel-kicker">{t("loading.backendStatus")}</p>
          <h2>{t("loading.connecting")}</h2>
          <p>{t("loading.fetching")}</p>
        </article>
      </section>
    </>
  );
}

export function HeroSection({
  connected,
  errorMessage,
}: Readonly<HeroSectionProps>) {
  const { t } = useAppTranslation("home");

  return (
    <OverviewSection
      connected={connected}
      description={t("hero.description")}
      errorMessage={errorMessage}
      title={t("hero.title")}
    />
  );
}

export function DashboardMetrics({
  summary,
  historyCount,
}: Readonly<DashboardMetricsProps>) {
  const { t } = useAppTranslation("home");

  return (
    <section className="metric-grid" aria-label={t("metrics.ariaLabel")}>
      <article className="metric-card metric-card-strong">
        <p className="metric-label">{t("metrics.selectedRules.label")}</p>
        <strong>{summary.selected_rule_count}</strong>
        <span>{t("metrics.selectedRules.description")}</span>
      </article>
      <article className="metric-card">
        <p className="metric-label">{t("metrics.checklistItems.label")}</p>
        <strong>{formatChecklistItemsMetricValue(summary)}</strong>
        <span>
          {t("metrics.checklistItems.description", {
            done: summary.done_items,
            total: summary.total_items,
          })}
        </span>
      </article>
      <article className="metric-card">
        <p className="metric-label">{t("metrics.highPriority.label")}</p>
        <strong>{formatHighPriorityMetricValue(summary)}</strong>
        <span>
          {t("metrics.highPriority.description", {
            done: summary.high_priority_done_items,
            total: summary.high_priority_items,
          })}
        </span>
      </article>
      <article className="metric-card">
        <p className="metric-label">{t("metrics.history.label")}</p>
        <strong>{historyCount}</strong>
        <span>{t("metrics.history.description")}</span>
      </article>
    </section>
  );
}

export function SelectorUnavailable({
  message,
}: Readonly<SelectorUnavailableProps>) {
  const { t } = useAppTranslation("home");

  return (
    <section className="grid">
      <article className="panel panel-highlight">
        <p className="panel-kicker">{t("selectorUnavailable.kicker")}</p>
        <h2>{t("selectorUnavailable.title")}</h2>
        <p>{message}</p>
      </article>
    </section>
  );
}
