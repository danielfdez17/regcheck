import ThemeToggle from "./theme-toggle";

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

const CHECKLIST_ITEMS = [
  "Document processing activities",
  "Publish a privacy policy",
  "Track retention periods",
  "Define a data subject request process",
  "Assign a privacy owner",
];

export default function HomePage() {
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
          </div>
        </div>

        <div className="panel panel-highlight">
          <p className="panel-kicker">Default rule selector</p>
          <h2>Personal data processing</h2>
          <p>
            Use this rule when the company collects customer, employee, or
            vendor personal data.
          </p>
          <ul className="checklist-mini">
            {CHECKLIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

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
