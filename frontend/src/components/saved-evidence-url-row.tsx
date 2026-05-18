import { useAppTranslation } from "../i18n/hooks/use-app-translation";
import { toAbsoluteEvidenceUrl } from "../evidence-url";

type SavedEvidenceUrlRowProps = {
  referenceUrl: string;
  notes: string | null;
  onEdit: () => void;
  onDelete: () => void;
};

export function SavedEvidenceUrlRow({
  referenceUrl,
  notes,
  onEdit,
  onDelete,
}: Readonly<SavedEvidenceUrlRowProps>) {
  const { t: tCommon } = useAppTranslation("common");
  const absoluteReferenceUrl = toAbsoluteEvidenceUrl(referenceUrl);

  return (
    <>
      <div className="saved-evidence-url-row">
        <a href={absoluteReferenceUrl} rel="noopener noreferrer" target="_blank">
          {referenceUrl}
        </a>
        <div className="saved-evidence-actions">
          <button className="secondary-button" onClick={onEdit} type="button">
            {tCommon("actions.edit")}
          </button>
          <button className="secondary-button" onClick={onDelete} type="button">
            {tCommon("actions.delete")}
          </button>
        </div>
      </div>
      {notes ? <span className="saved-evidence-notes">{notes}</span> : null}
    </>
  );
}
