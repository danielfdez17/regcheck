import { useState } from "react";

import AppShell, { AppFooter, AppNavbar } from "./components/app-shell";
import {
  HeroSection,
  DashboardMetrics,
  LoadingOverview,
  SelectorUnavailable,
} from "./components/home-content";
import GdprPlayground, { type LiveDashboardState } from "./gdpr-playground";
import { useHomePageData } from "./hooks/use-home-page-data";

const NAV_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Playground", href: "#playground" },
];

export default function App() {
  const pageData = useHomePageData();
  const [liveDashboard, setLiveDashboard] = useState<LiveDashboardState | null>(
    null,
  );

  if (pageData === null) {
    return (
      <AppShell>
        <AppNavbar navItems={NAV_ITEMS} />
        <main className="app-main">
          <div className="page">
            <LoadingOverview message="Loading the GDPR rule selector and generating the first checklist." />
          </div>
        </main>
        <AppFooter />
      </AppShell>
    );
  }

  const {
    connected,
    errorMessage,
    selector,
    currentAssessment,
    assessmentHistory,
  } = pageData;

  const dashboardMetrics =
    liveDashboard ??
    (currentAssessment
      ? {
          summary: currentAssessment.summary,
          historyCount: assessmentHistory.items.length,
        }
      : null);

  return (
    <AppShell>
      <AppNavbar navItems={NAV_ITEMS} />

      <main className="app-main">
        <div className="page">
          <HeroSection connected={connected} errorMessage={errorMessage} />

          {dashboardMetrics ? (
            <DashboardMetrics
              historyCount={dashboardMetrics.historyCount}
              summary={dashboardMetrics.summary}
            />
          ) : null}

          {selector ? (
            <div id="playground">
              <GdprPlayground
                initialAssessment={currentAssessment}
                initialHistory={assessmentHistory}
                initialSelector={selector}
                onLiveDashboardChange={setLiveDashboard}
              />
            </div>
          ) : (
            <SelectorUnavailable message="The frontend could not load the backend selector, so no live input controls are available yet." />
          )}
        </div>
      </main>

      <AppFooter />
    </AppShell>
  );
}
