type HeroSectionProps = {
  connected: boolean;
  errorMessage: string | null;
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
  return (
    <section className="hero hero-grid" id="overview">
      <div>
        <p className="eyebrow">RegCheck MVP</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        {connected !== undefined ? (
          <div className="badge-row" aria-label="Available mode">
            <span className="badge">GDPR domain mode</span>
            <span className="badge badge-soft">Checklist entities</span>
            <span className="badge badge-soft">
              {connected ? "Backend connected" : "Backend disconnected"}
            </span>
          </div>
        ) : null}
        {errorMessage ? <p className="status-note">{errorMessage}</p> : null}
      </div>
    </section>
  );
}

export function LoadingOverview({ message }: Readonly<LoadingOverviewProps>) {
  return (
    <>
      <OverviewSection
        description={message}
        title="Turn regulatory rules into clear actions."
      />
      <section className="grid">
        <article className="panel panel-highlight">
          <p className="panel-kicker">Backend status</p>
          <h2>Connecting...</h2>
          <p>The frontend is fetching the initial selector state.</p>
        </article>
      </section>
    </>
  );
}

export function HeroSection({
  connected,
  errorMessage,
}: Readonly<HeroSectionProps>) {
  return (
    <OverviewSection
      connected={connected}
      description="The first GDPR domain mode now supports company profile intake, service-driven recommendations, and evidence-focused checklists."
      errorMessage={errorMessage}
      title="Turn regulatory rules into clear actions."
    />
  );
}

export function SelectorUnavailable({
  message,
}: Readonly<SelectorUnavailableProps>) {
  return (
    <section className="grid">
      <article className="panel panel-highlight">
        <p className="panel-kicker">Default rule selector</p>
        <h2>Rule unavailable</h2>
        <p>{message}</p>
      </article>
    </section>
  );
}
