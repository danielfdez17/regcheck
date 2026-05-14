import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/auth-provider";
import LocaleSync from "./i18n/components/locale-sync";
import "./i18n";
import { setAppFavicon } from "./set-favicon";
import { ThemeProvider } from "./theme-provider";
import "../app/globals.css";

setAppFavicon();

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <ThemeProvider>
    <AuthProvider>
      <LocaleSync />
      <App />
    </AuthProvider>
  </ThemeProvider>,
);
