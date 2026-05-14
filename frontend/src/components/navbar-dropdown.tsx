import { useEffect, useRef, useState } from "react";

export type NavbarDropdownOption<T extends string> = {
  value: T;
  label: string;
  ariaLabel?: string;
};

type NavbarDropdownProps<T extends string> = {
  menuLabel: string;
  triggerLabel: string;
  options: NavbarDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function NavbarDropdown<T extends string>({
  menuLabel,
  triggerLabel,
  options,
  value,
  onChange,
}: Readonly<NavbarDropdownProps<T>>) {
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
    <div className="navbar-dropdown" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={menuLabel}
        className="navbar-dropdown-trigger"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span>{triggerLabel}</span>
        <span aria-hidden="true" className="navbar-dropdown-chevron">
          ▾
        </span>
      </button>
      {isOpen ? (
        <ul aria-label={menuLabel} className="navbar-dropdown-menu">
          {options.map((option) => (
            <li key={option.value}>
              <button
                aria-label={option.ariaLabel ?? option.label}
                aria-pressed={value === option.value}
                className="navbar-dropdown-option"
                data-active={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
