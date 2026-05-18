import { formatDateTime } from "../i18n/format";
import { useAppTranslation } from "../i18n/hooks/use-app-translation";
import type { AssessmentHistoryItem } from "../lib/regcheck-api";

type AssessmentCardProps = {
  item: AssessmentHistoryItem;
};

export function AssessmentCard({ item }: Readonly<AssessmentCardProps>) {
  const { t } = useAppTranslation("playground");

  return (
    <li>
      <strong>{item.company_type}</strong>
      <span>{formatDateTime(item.created_at)}</span>
      <span>
        {item.service_description || t("output.noServiceDescription")}
      </span>
      <span>
        {t("output.historySummary", {
          total: item.total_items,
          done: item.done_items,
          high: item.high_priority_items,
          rules: item.selected_rule_count,
        })}
      </span>
    </li>
  );
}
