import type { ReactNode } from "react";

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
