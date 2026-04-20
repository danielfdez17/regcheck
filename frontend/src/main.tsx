import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./theme-provider";
import "../app/globals.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
