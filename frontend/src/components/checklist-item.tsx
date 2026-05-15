import {
  ChecklistStatusSelect,
  PriorityBadge,
} from "./gdpr-playground-parts";
import { useAppTranslation } from "../i18n/hooks/use-app-translation";
import type {
  ChecklistItem as ChecklistItemModel,
  ChecklistStatus,
  EvidenceEntry,
} from "../lib/regcheck-api";

export type EvidenceDraft = {
  notes: string;
  referenceUrl: string;
};

type ChecklistItemProps = {
  item: ChecklistItemModel;
  evidenceDraft: EvidenceDraft;
  hasUnsavedEvidenceDraft: boolean;
  isEditingExistingEvidence: boolean;
  onStatusChange: (status: ChecklistStatus) => void;
  onEvidenceNotesChange: (notes: string) => void;
  onEvidenceUrlChange: (referenceUrl: string) => void;
  onSaveEvidence: () => void;
  onCancelEdit: () => void;
  onEditEvidenceEntry: (entry: EvidenceEntry) => void;
  onDeleteEvidenceEntry: (entryId: string) => void;
};

export function ChecklistItem({
  item,
  evidenceDraft,
  hasUnsavedEvidenceDraft,
  isEditingExistingEvidence,
  onStatusChange,
  onEvidenceNotesChange,
  onEvidenceUrlChange,
  onSaveEvidence,
  onCancelEdit,
  onEditEvidenceEntry,
  onDeleteEvidenceEntry,
}: Readonly<ChecklistItemProps>) {
  const { t } = useAppTranslation("playground");
  const { t: tCommon } = useAppTranslation("common");

  return (
    <li className="checklist-item">
      <div className="checklist-item-header">
        <strong>{item.title}</strong>
        <PriorityBadge priority={item.priority} />
      </div>
      {hasUnsavedEvidenceDraft ? (
        <span className="status-note">{t("checklist.unsavedDraft")}</span>
      ) : null}
      <ChecklistStatusSelect onChange={onStatusChange} value={item.status} />
      <span>{item.concrete_action}</span>
      <span>{item.evidence_request}</span>
      <textarea
        className="rule-checkbox"
        onChange={(event) => {
          onEvidenceNotesChange(event.target.value);
        }}
        placeholder={t("checklist.evidenceNotesPlaceholder")}
        rows={2}
        value={evidenceDraft.notes}
      />
      <input
        className="rule-checkbox"
        onChange={(event) => {
          onEvidenceUrlChange(event.target.value);
        }}
        placeholder={t("checklist.evidenceUrlPlaceholder")}
        type="url"
        value={evidenceDraft.referenceUrl}
      />
      <button className="secondary-button" onClick={onSaveEvidence} type="button">
        {isEditingExistingEvidence
          ? t("checklist.updateEvidence")
          : t("checklist.saveEvidence")}
      </button>
      {isEditingExistingEvidence ? (
        <button className="secondary-button" onClick={onCancelEdit} type="button">
          {tCommon("actions.cancelEdit")}
        </button>
      ) : null}
      {item.evidence_entries.length > 0 ? (
        <div className="saved-evidence-list">
          <span>
            {t("checklist.savedEntries", {
              count: item.evidence_entries.length,
            })}
          </span>
          <ul className="saved-evidence-items">
            {item.evidence_entries.map((entry) => (
              <li key={entry.id}>
                {entry.reference_url ? (
                  <div className="saved-evidence-url-row">
                    <a
                      href={entry.reference_url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {entry.reference_url}
                    </a>
                    <div className="saved-evidence-actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          onEditEvidenceEntry(entry);
                        }}
                        type="button"
                      >
                        {tCommon("actions.edit")}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => {
                          onDeleteEvidenceEntry(entry.id);
                        }}
                        type="button"
                      >
                        {tCommon("actions.delete")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="saved-evidence-main">
                      <span>{entry.label}</span>
                      <span>{t("checklist.noUrlSaved")}</span>
                      {entry.notes ? <span>{entry.notes}</span> : null}
                    </div>
                    <div className="saved-evidence-actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          onEditEvidenceEntry(entry);
                        }}
                        type="button"
                      >
                        {tCommon("actions.edit")}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => {
                          onDeleteEvidenceEntry(entry.id);
                        }}
                        type="button"
                      >
                        {tCommon("actions.delete")}
                      </button>
                    </div>
                  </>
                )}
                {entry.reference_url && entry.notes ? (
                  <span className="saved-evidence-notes">{entry.notes}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
