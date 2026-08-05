
// ---------------------------------------------------------------------------
// Mapping keyword nama zona -> sectionKey di SURVEY_SCHEMA. Matching dilakukan
// terhadap `form.title` zona secara live (case-insensitive, substring match),
// supaya:
// - 9 zona default (PIT, MHR, ETO, EFO, Jetty, Service Workshop, Warehouse,
//   Residential Area, Unit Parking Lot) otomatis dapat section yang sesuai.
// - Zona custom (hasil "Add Zona") yang namanya mengandung salah satu keyword
//   ini (mis. user bikin "Jetty 2") ikut dapat section yang sama.
// - Zona yang tidak match apa pun (Residential Area, Unit Parking Lot, atau
//   nama custom yang tidak dikenali) tidak dapat tabel section — form tetap
//   fallback ke field description biasa, tidak ada yang rusak.
//
// Urutan array menentukan prioritas kalau ada lebih dari satu keyword yang
// match; keyword yang lebih spesifik taruh lebih dulu.

import { SurveySection } from "../../../types/iupSurvey";
import { getSectionByKey } from "./Surveyschema";

// ---------------------------------------------------------------------------
const ZONE_NAME_TO_SECTION_KEY: { keyword: string; sectionKey: string }[] = [
    { keyword: "jetty", sectionKey: "jetty" },
    { keyword: "eto", sectionKey: "eto" },
    { keyword: "efo", sectionKey: "efo" },
    { keyword: "barging", sectionKey: "bargingRoad" },
    { keyword: "mining road", sectionKey: "miningRoad" },
    { keyword: "haul", sectionKey: "haulingRoad" }, // cocok "MHR (Main Haul Road)"
    { keyword: "mhr", sectionKey: "haulingRoad" },
    { keyword: "workshop", sectionKey: "workshop" },
    { keyword: "warehouse", sectionKey: "warehouse" },
    { keyword: "pit", sectionKey: "pit" },
];

/**
 * getSurveySectionForZoneName
 * -----------------------------
 * Cari section schema yang cocok untuk nama zona tertentu. Return undefined
 * kalau tidak ada yang cocok (zona tetap bisa dipakai normal tanpa tabel survey).
 */
export function getSurveySectionForZoneName(zoneName: string): SurveySection | undefined {
    const normalized = zoneName.trim().toLowerCase();
    if (!normalized) return undefined;

    const match = ZONE_NAME_TO_SECTION_KEY.find((m) => normalized.includes(m.keyword));
    return match ? getSectionByKey(match.sectionKey) : undefined;
}