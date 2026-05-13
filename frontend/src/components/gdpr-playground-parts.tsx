import type { ReactNode } from "react";

import type { ChecklistPriority } from "../lib/regcheck-api";

type OptionCardProps = {
  ariaLabel: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
};

type ResponseBlockProps = {
  title: string;
  children: ReactNode;
};

type PriorityBadgeProps = {
  priority: ChecklistPriority;
};

function getPriorityBadgeClass(priority: ChecklistPriority): string {
  if (priority === "high") {
    return "priority-badge priority-badge-high";
  }
  if (priority === "medium") {
    return "priority-badge priority-badge-medium";
  }
  return "priority-badge priority-badge-low";
}

export function OptionCard({
  ariaLabel,
  label,
  description,
  checked,
  onChange,
}: Readonly<OptionCardProps>) {
  return (
    <label aria-label={ariaLabel} className="rule-card">
      <input
        checked={checked}
        className="rule-checkbox"
        onChange={onChange}
        type="checkbox"
      />
      <span>
        <strong>{label}</strong>
        {description ? <span>{description}</span> : null}
      </span>
    </label>
  );
}

export function PriorityBadge({ priority }: Readonly<PriorityBadgeProps>) {
  return (
    <span className={getPriorityBadgeClass(priority)}>{priority}</span>
  );
}

export function ResponseBlock({
  title,
  children,
}: Readonly<ResponseBlockProps>) {
  return (
    <div className="response-block">
      <p className="response-label">{title}</p>
      <ul className="checklist-mini">{children}</ul>
    </div>
  );
}
