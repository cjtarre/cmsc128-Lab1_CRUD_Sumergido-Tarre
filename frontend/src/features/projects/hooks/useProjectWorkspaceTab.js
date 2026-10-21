import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { PROJECT_TAB_IDS } from "../constants/projectOptions";

// Manage the active workspace view through the URL.
export function useProjectWorkspaceTab() {
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get("view");
    const activeTab = PROJECT_TAB_IDS.has(requestedTab) ? requestedTab : "overview";

    const setActiveTab = useCallback((tab) => {
        if (!PROJECT_TAB_IDS.has(tab)) return;
        setSearchParams(tab === "overview" ? {} : { view: tab });
    }, [setSearchParams]);

    return { activeTab, setActiveTab };
}