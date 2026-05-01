"use client";

import {
    MitraDashboard,
    type MitraDashboardSection,
} from "../../_components/MitraDashboard";

interface MitraDashboardPageContentProps {
    initialSection?: MitraDashboardSection;
}

export function MitraDashboardPageContent({
    initialSection = "overview",
}: MitraDashboardPageContentProps) {
    return <MitraDashboard initialSection={initialSection} />;
}
