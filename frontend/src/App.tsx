import AppShell, { AppFooter, AppNavbar } from "./components/app-shell";
import {
  HeroSection,
  LoadingOverview,
  SelectorUnavailable,
} from "./components/home-content";
import GdprPlayground from "./gdpr-playground";
import { useHomePageData } from "./hooks/use-home-page-data";

const NAV_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Playground", href: "#playground" },
  { label: "API", href: "#api" },
];

export default function App() {
  const pageData = useHomePageData();

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

  const { connected, errorMessage, selector, initialChecklist } = pageData;

  return (
    <AppShell>
      <AppNavbar navItems={NAV_ITEMS} />

      <main className="app-main">
        <div className="page">
          <HeroSection connected={connected} errorMessage={errorMessage} />

          {selector ? (
            <div id="playground">
              <GdprPlayground
                initialChecklist={{
                  domain_mode: selector.domain_mode,
                  selected_rules:
                    initialChecklist.rule === null
                      ? []
                      : [initialChecklist.rule],
                  checklist_items: initialChecklist.checklistItems,
                  recommended_rule_ids: [],
                }}
                initialSelector={selector}
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
