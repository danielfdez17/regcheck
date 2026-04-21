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
};

export function AppNavbar({ navItems }: Readonly<AppNavbarProps>) {
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

        <ThemeToggle />
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <p>RegCheck MVP</p>
        <p>Operational GDPR rule mapping and checklist generation.</p>
      </div>
    </footer>
  );
}

export default function AppShell({ children }: Readonly<AppShellProps>) {
  return <div className="app-shell">{children}</div>;
}
