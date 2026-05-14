import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/use-auth";
import { useAppTranslation } from "../i18n/hooks/use-app-translation";
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
  const { t } = useAppTranslation("auth");
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
        error instanceof Error ? error.message : t("errors.authFailed");
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
            <p className="panel-kicker">{t("kicker")}</p>
            <h1>{mode === "login" ? t("login.title") : t("signup.title")}</h1>
            <p className="auth-lead">
              {mode === "login" ? t("login.lead") : t("signup.lead")}
            </p>

            <div
              className="auth-mode-toggle"
              role="tablist"
              aria-label={t("mode.ariaLabel")}
            >
              <button
                type="button"
                className="auth-mode-button"
                data-active={mode === "login"}
                onClick={() => {
                  switchMode("login");
                }}
              >
                {t("mode.login")}
              </button>
              <button
                type="button"
                className="auth-mode-button"
                data-active={mode === "signup"}
                onClick={() => {
                  switchMode("signup");
                }}
              >
                {t("mode.signup")}
              </button>
            </div>

            <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
              {mode === "signup" ? (
                <>
                  <label className="auth-field">
                    <span>{t("fields.firstName")}</span>
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
                    <span>{t("fields.lastName")}</span>
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
                    <span>{t("fields.enterprise")}</span>
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
                <span>{t("fields.email")}</span>
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
                <span>{t("fields.password")}</span>
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
                  ? t("submit.waiting")
                  : mode === "login"
                    ? t("submit.signIn")
                    : t("submit.createAccount")}
              </button>
            </form>
          </section>
        </div>
      </main>
      <AppFooter />
    </AppShell>
  );
}
