import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "./auth/use-auth";
import AppShell, { AppFooter, AppNavbar } from "./components/app-shell";
import AuthPage from "./components/auth-page";
import {
  AssessmentDashboard,
  HeroSection,
  DashboardMetrics,
  LoadingOverview,
  SelectorUnavailable,
} from "./components/home-content";
import GdprPlayground, { type LiveDashboardState } from "./gdpr-playground";
import { type HomePageData, useHomePageData } from "./hooks/use-home-page-data";
import { useAppTranslation } from "./i18n/hooks/use-app-translation";
import {
  getAssessment,
  type AuthUser,
  type AssessmentHistoryResponse,
  type GDPRAssessmentResponse,
} from "./lib/regcheck-api";

type AuthenticatedView = "dashboard" | "editor";
type NavItem = {
  label: string;
  href: string;
};

type AuthenticatedShellProps = {
  children: ReactNode;
  navItems: NavItem[];
  onLogout: () => void;
  user: AuthUser | null;
};

type AuthenticatedContentProps = {
  activeAssessment: GDPRAssessmentResponse | null;
  activeView: AuthenticatedView;
  assessmentHistory: AssessmentHistoryResponse;
  assessmentLoadError: string | null;
  dashboardMetrics: LiveDashboardState | null;
  isInputSidebarOpen: boolean;
  isLoadingAssessment: boolean;
  onAssessmentHistoryChange: (history: AssessmentHistoryResponse) => void;
  onCreateAssessment: () => void;
  onInputSidebarOpenChange: (isOpen: boolean) => void;
  onLiveDashboardChange: (dashboard: LiveDashboardState) => void;
  onOpenAssessment: (assessmentId: string) => void;
  onReturnToDashboard: () => void;
  pageData: HomePageData;
};

function getUserName(user: AuthUser | null): string {
  return user === null ? "" : `${user.first_name} ${user.last_name}`;
}

function AuthenticatedShell({
  children,
  navItems,
  onLogout,
  user,
}: Readonly<AuthenticatedShellProps>) {
  return (
    <AppShell>
      <AppNavbar
        enterprise={user?.enterprise ?? ""}
        navItems={navItems}
        onLogout={onLogout}
        userName={getUserName(user)}
      />
      {children}
      <AppFooter />
    </AppShell>
  );
}

function AuthenticatedContent({
  activeAssessment,
  activeView,
  assessmentHistory,
  assessmentLoadError,
  dashboardMetrics,
  isInputSidebarOpen,
  isLoadingAssessment,
  onAssessmentHistoryChange,
  onCreateAssessment,
  onInputSidebarOpenChange,
  onLiveDashboardChange,
  onOpenAssessment,
  onReturnToDashboard,
  pageData,
}: Readonly<AuthenticatedContentProps>) {
  const { t } = useAppTranslation("home");
  const { connected, errorMessage, selector } = pageData;

  if (selector === null) {
    return (
      <>
        <HeroSection connected={connected} errorMessage={errorMessage} />

        {dashboardMetrics ? (
          <DashboardMetrics
            historyCount={dashboardMetrics.historyCount}
            summary={dashboardMetrics.summary}
          />
        ) : null}

        <SelectorUnavailable message={t("selectorUnavailable.message")} />
      </>
    );
  }

  return (
    <div
      className={`page-body ${isInputSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <HeroSection connected={connected} errorMessage={errorMessage} />

      {dashboardMetrics ? (
        <DashboardMetrics
          historyCount={dashboardMetrics.historyCount}
          summary={dashboardMetrics.summary}
        />
      ) : null}

      {activeView === "dashboard" ? (
        <>
          <AssessmentDashboard
            assessments={assessmentHistory.items}
            isLoadingAssessment={isLoadingAssessment}
            onCreateAssessment={onCreateAssessment}
            onOpenAssessment={onOpenAssessment}
          />
          {assessmentLoadError ? (
            <p className="status-note">{assessmentLoadError}</p>
          ) : null}
        </>
      ) : (
        <div id="playground">
          <button
            className="secondary-button dashboard-back-button"
            onClick={onReturnToDashboard}
            type="button"
          >
            {t("dashboard.backToDashboard")}
          </button>
          <GdprPlayground
            key={activeAssessment?.assessment_id ?? "new-assessment"}
            initialAssessment={activeAssessment}
            initialHistory={assessmentHistory}
            initialSelector={selector}
            isInputSidebarOpen={isInputSidebarOpen}
            onAssessmentHistoryChange={onAssessmentHistoryChange}
            onInputSidebarOpenChange={onInputSidebarOpenChange}
            onLiveDashboardChange={onLiveDashboardChange}
          />
        </div>
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const { logout, user } = useAuth();
  const { t } = useAppTranslation("home");
  const pageData = useHomePageData();
  const [activeView, setActiveView] =
    useState<AuthenticatedView>("dashboard");
  const [activeAssessment, setActiveAssessment] =
    useState<GDPRAssessmentResponse | null>(null);
  const [assessmentHistory, setAssessmentHistory] =
    useState<AssessmentHistoryResponse>({ items: [] });
  const [liveDashboard, setLiveDashboard] = useState<LiveDashboardState | null>(
    null,
  );
  const [isInputSidebarOpen, setIsInputSidebarOpen] = useState(false);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [assessmentLoadError, setAssessmentLoadError] = useState<string | null>(
    null,
  );

  const navItems = [
    { label: t("nav.overview", { ns: "common" }), href: "#overview" },
    { label: t("nav.playground", { ns: "common" }), href: "#playground" },
  ];
  const handleLogout = () => {
    void logout();
  };

  useEffect(() => {
    if (pageData !== null) {
      setAssessmentHistory(pageData.assessmentHistory);
    }
  }, [pageData]);

  if (pageData === null) {
    return (
      <AuthenticatedShell
        navItems={navItems}
        onLogout={handleLogout}
        user={user}
      >
        <main className="app-main">
          <div className="page">
            <LoadingOverview message={t("loading.selector")} />
          </div>
        </main>
      </AuthenticatedShell>
    );
  }

  const visibleAssessmentHistory =
    assessmentHistory.items.length > 0 || pageData.assessmentHistory.items.length === 0
      ? assessmentHistory
      : pageData.assessmentHistory;

  const dashboardMetrics = activeView === "editor" ? liveDashboard : null;

  function openNewAssessment() {
    setActiveAssessment(null);
    setActiveView("editor");
    setAssessmentLoadError(null);
    setLiveDashboard(null);
  }

  async function openSavedAssessment(assessmentId: string) {
    setIsLoadingAssessment(true);
    setAssessmentLoadError(null);

    try {
      const assessment = await getAssessment(assessmentId);
      setActiveAssessment(assessment);
      setActiveView("editor");
      setLiveDashboard(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("dashboard.history.unexpectedLoadError");
      setAssessmentLoadError(message);
    } finally {
      setIsLoadingAssessment(false);
    }
  }

  function returnToDashboard() {
    setActiveView("dashboard");
    setActiveAssessment(null);
    setIsInputSidebarOpen(false);
    setLiveDashboard(null);
  }

  return (
    <AuthenticatedShell navItems={navItems} onLogout={handleLogout} user={user}>
      <main className="app-main">
        <div className="page">
          <AuthenticatedContent
            activeAssessment={activeAssessment}
            activeView={activeView}
            assessmentHistory={visibleAssessmentHistory}
            assessmentLoadError={assessmentLoadError}
            dashboardMetrics={dashboardMetrics}
            isInputSidebarOpen={isInputSidebarOpen}
            isLoadingAssessment={isLoadingAssessment}
            onAssessmentHistoryChange={setAssessmentHistory}
            onCreateAssessment={openNewAssessment}
            onInputSidebarOpenChange={setIsInputSidebarOpen}
            onLiveDashboardChange={setLiveDashboard}
            onOpenAssessment={(assessmentId) => {
              void openSavedAssessment(assessmentId);
            }}
            onReturnToDashboard={returnToDashboard}
            pageData={pageData}
          />
        </div>
      </main>
    </AuthenticatedShell>
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
