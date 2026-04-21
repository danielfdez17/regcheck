import { useEffect, useState } from "react";

import {
  createChecklist,
  getRuleSelector,
  type ChecklistItem,
  type GDPRRuleSelectorResponse,
  type RuleOption,
} from "../lib/regcheck-api";

export interface HomePageData {
  connected: boolean;
  errorMessage: string | null;
  selector: GDPRRuleSelectorResponse | null;
  initialChecklist: {
    rule: RuleOption | null;
    checklistItems: ChecklistItem[];
  };
}

async function loadHomePageData(): Promise<HomePageData> {
  try {
    const selector = await getRuleSelector();
    const firstRule = selector.available_rules[0] ?? null;

    if (firstRule === null) {
      return {
        connected: true,
        errorMessage: "Backend is reachable but no GDPR rules are configured.",
        selector,
        initialChecklist: {
          rule: null,
          checklistItems: [],
        },
      };
    }

    const checklist = await createChecklist({
      selectedRuleIds: [firstRule.id],
      companyProfile: {
        company_type: "other",
        department_types: [],
        service_description: "General data processing activities",
        requested_frameworks: ["gdpr"],
        uses_cloud: false,
        has_physical_buildings: false,
        supports_remote_work_vpn: false,
      },
    });

    return {
      connected: true,
      errorMessage: null,
      selector,
      initialChecklist: {
        rule: firstRule,
        checklistItems: checklist.checklist_items,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while connecting to backend.";

    return {
      connected: false,
      errorMessage: message,
      selector: null,
      initialChecklist: {
        rule: null,
        checklistItems: [],
      },
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
