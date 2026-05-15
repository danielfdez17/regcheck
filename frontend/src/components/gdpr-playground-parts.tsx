import { useEffect, useRef, useState, type ReactNode } from "react";

import { useAppTranslation } from "../i18n/hooks/use-app-translation";
import type { ChecklistPriority, ChecklistStatus } from "../lib/regcheck-api";

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

type StatusBadgeProps = {
  status: ChecklistStatus;
};

type ChecklistStatusSelectProps = {
  value: ChecklistStatus;
  onChange: (status: ChecklistStatus) => void;
};

const CHECKLIST_STATUSES: ChecklistStatus[] = ["pending", "in_progress", "done"];

function getStatusBadgeClass(status: ChecklistStatus): string {
  if (status === "pending") {
    return "status-badge status-badge-pending";
  }
  if (status === "in_progress") {
    return "status-badge status-badge-in-progress";
  }
  return "status-badge status-badge-done";
}

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

export function StatusBadge({ status }: Readonly<StatusBadgeProps>) {
  const { t } = useAppTranslation("playground");

  return (
    <span className={getStatusBadgeClass(status)}>
      {t(`checklist.statusLabels.${status}`)}
    </span>
  );
}

export function ChecklistStatusSelect({
  value,
  onChange,
}: Readonly<ChecklistStatusSelectProps>) {
  const { t } = useAppTranslation("playground");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current !== null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className="checklist-status-control" ref={containerRef}>
      <div className="checklist-status-dropdown">
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="checklist-status-trigger"
          onClick={() => {
            setIsOpen((current) => !current);
          }}
          type="button"
        >
          <StatusBadge status={value} />
        </button>
        {isOpen ? (
          <ul
            aria-label={t("checklist.statusOptionsAria")}
            className="checklist-status-menu"
          >
            {CHECKLIST_STATUSES.map((status) => (
              <li key={status}>
                <button
                  className="checklist-status-option"
                  onClick={() => {
                    onChange(status);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <StatusBadge status={status} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
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
