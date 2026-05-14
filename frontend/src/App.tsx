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
import { useAppTranslation } from "./i18n/hooks/use-app-translation";

function AuthenticatedApp() {
  const { logout, user } = useAuth();
  const { t } = useAppTranslation("home");
  const pageData = useHomePageData();
  const [liveDashboard, setLiveDashboard] = useState<LiveDashboardState | null>(
    null,
  );

  const navItems = [
    { label: t("nav.overview", { ns: "common" }), href: "#overview" },
    { label: t("nav.playground", { ns: "common" }), href: "#playground" },
  ];

  if (pageData === null) {
    return (
      <AppShell>
        <AppNavbar
          enterprise={user?.enterprise ?? ""}
          navItems={navItems}
          onLogout={() => {
            void logout();
          }}
          userName={
            user === null ? "" : `${user.first_name} ${user.last_name}`
          }
        />
        <main className="app-main">
          <div className="page">
            <LoadingOverview message={t("loading.selector")} />
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
        navItems={navItems}
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
            <SelectorUnavailable message={t("selectorUnavailable.message")} />
          )}
        </div>
      </main>

      <AppFooter />
    </AppShell>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useAppTranslation("home");

  if (isLoading) {
    return (
      <AppShell>
        <main className="app-main">
          <div className="page">
            <LoadingOverview message={t("loading.session")} />
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
