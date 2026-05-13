import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/use-auth";
import AppShell, { AppFooter } from "./app-shell";

type AuthMode = "login" | "signup";

type AuthFormState = {
  firstName: string;
  lastName: string;
  enterprise: string;
  email: string;
  password: string;
};

const EMPTY_FORM: AuthFormState = {
  firstName: "",
  lastName: "",
  enterprise: "",
  email: "",
  password: "",
};

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<AuthFormState>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof AuthFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          email: form.email.trim(),
          password: form.password,
        });
        return;
      }

      await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        enterprise: form.enterprise.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setForm(EMPTY_FORM);
  };

  return (
    <AppShell>
      <main className="app-main">
        <div className="page auth-page">
          <section className="panel auth-panel">
            <p className="panel-kicker">Secure access</p>
            <h1>{mode === "login" ? "Sign in to RegCheck" : "Create your workspace"}</h1>
            <p className="auth-lead">
              {mode === "login"
                ? "Use your enterprise email and password to access your tenant workspace."
                : "Register your enterprise to start tenant-scoped GDPR assessments."}
            </p>

            <div className="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className="auth-mode-button"
                data-active={mode === "login"}
                onClick={() => {
                  switchMode("login");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="auth-mode-button"
                data-active={mode === "signup"}
                onClick={() => {
                  switchMode("signup");
                }}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
              {mode === "signup" ? (
                <>
                  <label className="auth-field">
                    <span>First name</span>
                    <input
                      autoComplete="given-name"
                      required
                      value={form.firstName}
                      onChange={(event) => {
                        updateField("firstName", event.target.value);
                      }}
                    />
                  </label>
                  <label className="auth-field">
                    <span>Last name</span>
                    <input
                      autoComplete="family-name"
                      required
                      value={form.lastName}
                      onChange={(event) => {
                        updateField("lastName", event.target.value);
                      }}
                    />
                  </label>
                  <label className="auth-field">
                    <span>Enterprise</span>
                    <input
                      autoComplete="organization"
                      required
                      value={form.enterprise}
                      onChange={(event) => {
                        updateField("enterprise", event.target.value);
                      }}
                    />
                  </label>
                </>
              ) : null}

              <label className="auth-field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => {
                    updateField("email", event.target.value);
                  }}
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={8}
                  required
                  type="password"
                  value={form.password}
                  onChange={(event) => {
                    updateField("password", event.target.value);
                  }}
                />
              </label>

              {errorMessage !== null ? (
                <p className="status-note auth-error" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>
          </section>
        </div>
      </main>
      <AppFooter />
    </AppShell>
  );
}
