import { useEffect, useState } from "react";

import i18n from "../i18n";
import {
  getAssessmentHistory,
  getRuleSelector,
  getLatestAssessment,
  type AssessmentHistoryResponse,
  type GDPRAssessmentResponse,
  type GDPRRuleSelectorResponse,
} from "../lib/regcheck-api";

export interface HomePageData {
  connected: boolean;
  errorMessage: string | null;
  selector: GDPRRuleSelectorResponse | null;
  currentAssessment: GDPRAssessmentResponse | null;
  assessmentHistory: AssessmentHistoryResponse;
}

async function loadHomePageData(): Promise<HomePageData> {
  try {
    const selector = await getRuleSelector();
    const latestAssessment = await getLatestAssessment();
    const history = await getAssessmentHistory();

    if (latestAssessment !== null) {
      return {
        connected: true,
        errorMessage: null,
        selector,
        currentAssessment: latestAssessment,
        assessmentHistory: history,
      };
    }
    if (selector.available_rules.length === 0) {
      return {
        connected: true,
        errorMessage: i18n.t("backend.noRules", { ns: "errors" }),
        selector,
        currentAssessment: null,
        assessmentHistory: history,
      };
    }

    return {
      connected: true,
      errorMessage: null,
      selector,
      currentAssessment: null,
      assessmentHistory: history,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : i18n.t("backend.unexpectedConnection", { ns: "errors" });

    return {
      connected: false,
      errorMessage: message,
      selector: null,
      currentAssessment: null,
      assessmentHistory: { items: [] },
    };
  }
}

export function useHomePageData() {
  const [pageData, setPageData] = useState<HomePageData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchHomePageData() {
      const nextPageData = await loadHomePageData();

      if (isMounted) {
        setPageData(nextPageData);
      }
    }

    void fetchHomePageData();

    return () => {
      isMounted = false;
    };
  }, []);

  return pageData;
}
