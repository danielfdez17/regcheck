import ThemeToggle from "./theme-toggle";
import {
  createChecklist,
  getRuleSelector,
  type ChecklistItem,
  type RuleOption,
  type GDPRRuleSelectorResponse,
} from "../lib/regcheck-api";
import GdprPlayground from "./gdpr-playground";

const FEATURES = [
  "GDPR rule selector",
  "Actionable checklist generation",
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
    summary: "Generates a checklist preview from the chosen rule ids.",
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

    const checklist = await createChecklist([firstRule.id]);

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

export default async function HomePage() {
  const { connected, errorMessage, selector, initialChecklist } =
    await loadHomePageData();

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
            The first GDPR domain mode is available now: select a rule, generate
            a checklist, and keep status tracking explicit.
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
              initialChecklist.rule !== null ? [initialChecklist.rule] : [],
            checklist_items: initialChecklist.checklistItems,
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
