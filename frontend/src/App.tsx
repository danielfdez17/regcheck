import { useEffect, useState } from "react";

import GdprPlayground from "./gdpr-playground";
import ThemeToggle from "./theme-toggle";
import {
  createChecklist,
  getRuleSelector,
  type ChecklistItem,
  type GDPRRuleSelectorResponse,
  type RuleOption,
} from "./lib/regcheck-api";

const FEATURES = [
  "Company profile intake",
  "Service and department based recommendations",
  "Actionable checklist generation with evidence requests",
  "Status tracking (pending, in progress, done)",
  "Export-ready output",
];

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/gdpr/rule-selector",
    summary: "Returns the GDPR mode and its selectable rules.",
  },
  {
    method: "POST",
    path: "/api/v1/gdpr/checklists",
    summary: "Generates a checklist from company profile context and chosen rule ids.",
  },
];

interface HomePageData {
  connected: boolean;
  errorMessage: string | null;
  selector: GDPRRuleSelectorResponse | null;
  initialChecklist: {
    rule: RuleOption | null;
    checklistItems: ChecklistItem[];
  };
}

async function loadHomePageData(): Promise<HomePageData> {
  try {
    const selector = await getRuleSelector();
    const firstRule = selector.available_rules[0] ?? null;

    if (firstRule === null) {
      return {
        connected: true,
        errorMessage: "Backend is reachable but no GDPR rules are configured.",
        selector,
        initialChecklist: {
          rule: null,
          checklistItems: [],
        },
      };
    }

    const checklist = await createChecklist({
      selectedRuleIds: [firstRule.id],
      companyProfile: {
        company_type: "other",
        department_types: [],
        service_description: "General data processing activities",
        requested_frameworks: ["gdpr"],
        uses_cloud: false,
        has_physical_buildings: false,
        supports_remote_work_vpn: false,
      },
    });

    return {
      connected: true,
      errorMessage: null,
      selector,
      initialChecklist: {
        rule: firstRule,
        checklistItems: checklist.checklist_items,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while connecting to backend.";

    return {
      connected: false,
      errorMessage: message,
      selector: null,
      initialChecklist: {
        rule: null,
        checklistItems: [],
      },
    };
  }
}

export default function App() {
  const [pageData, setPageData] = useState<HomePageData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchHomePageData() {
      const nextPageData = await loadHomePageData();

      if (isMounted) {
        setPageData(nextPageData);
      }
    }

    void fetchHomePageData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (pageData === null) {
    return (
      <main className="page">
        <section className="hero hero-grid">
          <div>
            <div className="hero-top">
              <p className="eyebrow">RegCheck MVP</p>
              <ThemeToggle />
            </div>
            <h1>Turn regulatory rules into clear actions.</h1>
            <p className="lead">
              Loading the GDPR rule selector and generating the first checklist.
            </p>
          </div>
          <article className="panel panel-highlight">
            <p className="panel-kicker">Backend status</p>
            <h2>Connecting...</h2>
            <p>The frontend is fetching the initial selector state.</p>
          </article>
        </section>
      </main>
    );
  }

  const { connected, errorMessage, selector, initialChecklist } = pageData;

  return (
    <main className="page">
      <section className="hero hero-grid">
        <div>
          <div className="hero-top">
            <p className="eyebrow">RegCheck MVP</p>
            <ThemeToggle />
          </div>
          <h1>Turn regulatory rules into clear actions.</h1>
          <p className="lead">
            The first GDPR domain mode now supports company profile intake,
            service-driven recommendations, and evidence-focused checklists.
          </p>
          <div className="badge-row" aria-label="Available mode">
            <span className="badge">GDPR domain mode</span>
            <span className="badge badge-soft">Checklist entities</span>
            <span className="badge badge-soft">
              {connected ? "Backend connected" : "Backend disconnected"}
            </span>
          </div>
          {errorMessage && <p className="status-note">{errorMessage}</p>}
        </div>
      </section>

      {selector ? (
        <GdprPlayground
          initialChecklist={{
            domain_mode: selector.domain_mode,
            selected_rules:
              initialChecklist.rule === null ? [] : [initialChecklist.rule],
            checklist_items: initialChecklist.checklistItems,
            recommended_rule_ids: [],
          }}
          initialSelector={selector}
        />
      ) : (
        <section className="grid">
          <article className="panel panel-highlight">
            <p className="panel-kicker">Default rule selector</p>
            <h2>Rule unavailable</h2>
            <p>
              The frontend could not load the backend selector, so no live input
              controls are available yet.
            </p>
          </article>
        </section>
      )}

      <section className="grid">
        <article className="panel">
          <h2>Initial infrastructure ready</h2>
          <ul className="feature-list">
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>API endpoints</h2>
          <div className="endpoint-list">
            {API_ENDPOINTS.map((endpoint) => (
              <div className="endpoint" key={endpoint.path}>
                <span className="endpoint-method">{endpoint.method}</span>
                <span className="endpoint-path">{endpoint.path}</span>
                <p>{endpoint.summary}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
