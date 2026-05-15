import type { AssessmentSummary } from "./regcheck-api";

function formatDoneMetricValue(done: number, total: number): string {
  return `${done} / ${total}`;
}

export function formatChecklistItemsMetricValue(
  summary: Pick<AssessmentSummary, "done_items" | "total_items">,
): string {
  return formatDoneMetricValue(summary.done_items, summary.total_items);
}

export function formatHighPriorityMetricValue(
  summary: Pick<AssessmentSummary, "high_priority_done_items" | "high_priority_items">,
): string {
  return formatDoneMetricValue(
    summary.high_priority_done_items,
    summary.high_priority_items,
  );
}
