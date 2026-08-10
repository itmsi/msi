import { MasterZoneSiteSection } from "../../../types/iupSurvey";

const ZONE_NAME_TO_SECTION_KEY: { keyword: string; sectionKey: string }[] = [
    { keyword: "Jetty Information", sectionKey: "jetty" },
    { keyword: "ETO Information", sectionKey: "eto" },
    { keyword: "EFO Information", sectionKey: "efo" },
    { keyword: "Barging Road Information", sectionKey: "bargingRoad" },
    { keyword: "Mining Road Information", sectionKey: "miningRoad" },
    { keyword: "Hauling Road Information", sectionKey: "haulingRoad" },
    { keyword: "Workshop Information", sectionKey: "workshop" },
    { keyword: "Warehouse Information", sectionKey: "warehouse" },
    { keyword: "PIT Information", sectionKey: "pit" },
];

export function getMasterZoneSiteForName(
    zoneName: string,
    templates: MasterZoneSiteSection[]
): MasterZoneSiteSection | undefined {
    const normalized = zoneName.trim().toLowerCase();
    if (!normalized) return undefined;

    // const match = ZONE_NAME_TO_SECTION_KEY.find((m) => normalized.includes(m.keyword));
    const match = ZONE_NAME_TO_SECTION_KEY.find(
        (m) => normalized.trim().toLowerCase() === m.keyword.trim().toLowerCase()
    );
    if (!match) return undefined;

    return templates.find((t) => t.sectionKey === match.sectionKey);
}
