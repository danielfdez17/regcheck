import { useState } from "react";

import {
  createChecklist,
  type GDPRChecklistResponse,
  type GDPRRuleSelectorResponse,
} from "./lib/regcheck-api";

type GdprPlaygroundProps = {
  initialSelector: GDPRRuleSelectorResponse;
  initialChecklist: GDPRChecklistResponse;
};

export default function GdprPlayground({
  initialSelector,
  initialChecklist,
}: Readonly<GdprPlaygroundProps>) {
  const [selector] = useState(initialSelector);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(
    initialChecklist.selected_rules.map((rule) => rule.id),
  );
  const [checklist, setChecklist] = useState(initialChecklist);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGenerateChecklist() {
    setIsSubmitting(true);

    try {
      setErrorMessage(null);
      setStatusMessage(null);
      const nextChecklist = await createChecklist(selectedRuleIds);
      setChecklist(nextChecklist);
      const generatedAt = new Date().toLocaleTimeString();
      setStatusMessage(
        `Checklist generated at ${generatedAt} (${nextChecklist.checklist_items.length} items).`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while generating the checklist.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleRule(ruleId: string) {
    setSelectedRuleIds((currentRuleIds) =>
      currentRuleIds.includes(ruleId)
        ? currentRuleIds.filter((currentRuleId) => currentRuleId !== ruleId)
        : [...currentRuleIds, ruleId],
    );
  }

  return (
    <section className="playground-grid">
      <article className="panel panel-playground">
        <p className="panel-kicker">Live backend input</p>
        <h2>Choose GDPR rules</h2>
        <p className="panel-copy">
          This form calls the backend endpoints directly so testers can select
          rules and generate the resulting checklist.
        </p>

        <div className="rule-list">
          {selector.available_rules.map((rule) => (
            <label aria-label={rule.label} className="rule-card" key={rule.id}>
              <input
                checked={selectedRuleIds.includes(rule.id)}
                className="rule-checkbox"
                onChange={() => toggleRule(rule.id)}
                type="checkbox"
              />
              <span>
                <strong>{rule.label}</strong>
                <span>{rule.description}</span>
              </span>
            </label>
          ))}
        </div>

        <button
          className="primary-button"
          disabled={isSubmitting || selectedRuleIds.length === 0}
          onClick={() => {
            void handleGenerateChecklist();
          }}
          type="button"
        >
          {isSubmitting ? "Generating checklist..." : "Generate checklist"}
        </button>

        {errorMessage && <p className="status-note">{errorMessage}</p>}
        {statusMessage && <p className="status-note">{statusMessage}</p>}
      </article>

      <article className="panel panel-highlight">
        <p className="panel-kicker">API response</p>
        <h2>{checklist.domain_mode.label}</h2>
        <p>{checklist.domain_mode.description}</p>

        <div className="response-block">
          <p className="response-label">Selected rules</p>
          <ul className="checklist-mini">
            {checklist.selected_rules.map((rule) => (
              <li key={rule.id}>{rule.label}</li>
            ))}
          </ul>
        </div>

        <div className="response-block">
          <p className="response-label">Checklist items</p>
          <ul className="checklist-mini">
            {checklist.checklist_items.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.priority}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
