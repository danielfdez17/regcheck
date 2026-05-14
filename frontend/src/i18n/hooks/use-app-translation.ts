import { useTranslation } from "react-i18next";

import type { Namespace } from "../config";
// Re-export for convenience at call sites.
export type { Namespace } from "../config";

export function useAppTranslation(namespace: Namespace) {
  return useTranslation(namespace);
}
