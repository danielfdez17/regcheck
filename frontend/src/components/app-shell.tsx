import type { ReactNode } from "react";

import ThemeToggle from "../theme-toggle";

type NavItem = {
  label: string;
  href: string;
};

type AppShellProps = {
  children: ReactNode;
};

type AppNavbarProps = {
  navItems: NavItem[];
  userName?: string;
  enterprise?: string;
  onLogout?: () => void;
};

export function AppNavbar({
  navItems,
  userName = "",
  enterprise = "",
  onLogout,
}: Readonly<AppNavbarProps>) {
  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <a className="brand" href="#overview">
          <span className="brand-mark" aria-hidden="true">
            RC
          </span>
          <span className="brand-copy">
            <strong>RegCheck</strong>
            <span>GDPR Compliance Workspace</span>
          </span>
        </a>

        <nav aria-label="Primary" className="app-nav-links">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="app-navbar-actions">
          {userName !== "" ? (
            <div className="app-user-menu">
              <span className="app-user-name">{userName}</span>
              {enterprise !== "" ? (
                <span className="app-user-enterprise">{enterprise}</span>
              ) : null}
            </div>
          ) : null}
          {onLogout !== undefined ? (
            <button className="logout-button" onClick={onLogout} type="button">
              Log out
            </button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <p>RegCheck v1</p>
        <p>SQLite-backed GDPR assessments with evidence-focused checklists.</p>
      </div>
    </footer>
  );
}

export default function AppShell({ children }: Readonly<AppShellProps>) {
  return <div className="app-shell">{children}</div>;
}
