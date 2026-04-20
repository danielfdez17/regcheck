const FEATURES = [
  "GDPR rule selector",
  "Actionable checklist generation",
  "Status tracking (pending, in progress, done)",
  "Export-ready output",
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">RegCheck MVP</p>
        <h1>Turn regulatory rules into clear actions.</h1>
        <p>
          Start with GDPR and generate an actionable checklist for your company
          profile in minutes.
        </p>
      </section>

      <section className="features">
        <h2>Initial Infrastructure Ready</h2>
        <ul>
          {FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
