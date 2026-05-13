import { useState } from "react";

import { useAuth } from "./auth/use-auth";
import AppShell, { AppFooter, AppNavbar } from "./components/app-shell";
import AuthPage from "./components/auth-page";
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

function AuthenticatedApp() {
  const { logout, user } = useAuth();
  const pageData = useHomePageData();
  const [liveDashboard, setLiveDashboard] = useState<LiveDashboardState | null>(
    null,
  );

  if (pageData === null) {
    return (
      <AppShell>
        <AppNavbar
          enterprise={user?.enterprise ?? ""}
          navItems={NAV_ITEMS}
          onLogout={() => {
            void logout();
          }}
          userName={
            user === null ? "" : `${user.first_name} ${user.last_name}`
          }
        />
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
      <AppNavbar
        enterprise={user?.enterprise ?? ""}
        navItems={NAV_ITEMS}
        onLogout={() => {
          void logout();
        }}
        userName={user === null ? "" : `${user.first_name} ${user.last_name}`}
      />

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

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppShell>
        <main className="app-main">
          <div className="page">
            <LoadingOverview message="Restoring your authenticated session." />
          </div>
        </main>
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}
