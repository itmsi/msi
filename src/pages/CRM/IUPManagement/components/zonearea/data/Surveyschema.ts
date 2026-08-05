

// ---------------------------------------------------------------------------
// SURVEY_SCHEMA — mirror 1:1 dari sheet "General Site Information" →
// "SITE VISIT SURVEY REPORT". Field, label, dan urutan sengaja dibuat sama
// persis dengan sheet supaya user merasa familiar.
//
// Catatan asumsi (sesuaikan kalau perlu):
// - Field "...Picture" / "...Map" di sheet berupa gambar/sketsa — untuk versi
//   web ini diperlakukan sebagai link file (konsisten dengan pola Zone Evidence
//   yang sudah ada), bukan upload gambar langsung.
// - Blok "Contractor 1/2/3" di sheet berbentuk tabel berulang (repeatable).
//   Untuk versi awal ini dibuat 3 slot tetap sesuai sheet; kalau ke depan
//   butuh jumlah kontraktor dinamis, bagian ini perlu dipisah jadi tipe field
//   baru ("repeater"), bukan field statis seperti sekarang.
// ---------------------------------------------------------------------------

import { SurveySection } from "../../../types/iupSurvey";

export const SURVEY_SCHEMA: SurveySection[] = [
    {
        sectionKey: "general",
        title: "General Site Information",
        fields: [
        { key: "locationSiteInSurvey", label: "Location Site In Survey", type: "text" },
        { key: "surveyor", label: "Surveyor", type: "textarea", placeholder: "1. Nama surveyor\n2. Nama surveyor" },
        { key: "surveyDate", label: "Date", type: "text", placeholder: "24 Juli 2026" },
        ],
    },
    {
        sectionKey: "iupCriteria",
        title: "IUP Criteria Information",
        fields: [
        { key: "iupName", label: "IUP Name", type: "text" },
        {
            key: "investmentStatus",
            label: "Investment Status",
            type: "select",
            options: [
            { label: "PMDN (100% Indonesia)", value: "PMDN (100% Indonesia)" },
            { label: "PMA (Indonesia >50%)", value: "PMA (Indonesia >50%)" },
            { label: "PMA (Indonesia < 50%, Chinese Owned)", value: "PMA (Indonesia < 50%, Chinese Owned)" },
            { label: "PMA (Indonesia < 50%, Non-Chinese Owned)", value: "PMA (Indonesia < 50%, Non-Chinese Owned)" },
            ],
        },
        { key: "groupAndZone", label: "Group and Zone", type: "text", placeholder: "G2/3" },
        { key: "rkab2026", label: "RKAB 2026", type: "number", unit: "MT" },
        {
            key: "haulingRoadDistanceStatus",
            label: "Hauling Road Distance",
            type: "select",
            options: [
            { label: "I have information", value: "I have information" },
            { label: "No information yet", value: "No information yet" },
            ],
        },
        { key: "haulingRoadDistanceDetail", label: "Hauling Road Distance (Detail)", type: "text", placeholder: "4,4 KM (PIT to JETTY)" },
        { key: "rkab2025", label: "RKAB 2025", type: "number", unit: "MT" },
        { key: "actualProduction2025", label: "2025 Actual Production", type: "number", unit: "MT" },
        { key: "numberOfContractorCriteria", label: "Number of Contractor", type: "number" },
        {
            key: "existingUnitBrand",
            label: "Existing Unit Brand",
            type: "select",
            options: [
            { label: "Japanese/European Brand", value: "Japanese/European Brand" },
            { label: "Truck-only Principals", value: "Truck-only Principals" },
            { label: "Combination", value: "Combination" },
            ],
        },
        ],
    },
    {
        sectionKey: "iupArea",
        title: "IUP Area Information",
        fields: [
        { key: "iupDetailedAddress", label: "IUP Detailed Address", type: "textarea" },
        { key: "distanceFromPort", label: "Distance from Port", type: "text" },
        { key: "distanceFromAirport", label: "Distance from Airport", type: "text" },
        { key: "distanceFromCapitalCity", label: "Distance from Capital City", type: "text" },
        { key: "totalWidthAreaIup", label: "Total Width Area IUP", type: "text", unit: "Ha" },
        { key: "totalAreaMining", label: "Total Area Mining", type: "text", unit: "Ha" },
        { key: "totalAreaExplore", label: "Total Area Explore", type: "text", unit: "Ha" },
        ],
    },
    {
        sectionKey: "iupStructure",
        title: "IUP Structure",
        fields: [
        { key: "iupStructureName", label: "IUP", type: "text" },
        {
            key: "hasContractor",
            label: "Contractor",
            type: "select",
            options: [
            { label: "Yes, they have transportation contractor", value: "Yes, they have transportation contractor" },
            { label: "No, they do not have transportation contractor on site", value: "No, they do not have transportation contractor on site" },
            ],
        },
        { key: "numberOfContractorStructure", label: "Number of Contractor", type: "number" },
        { key: "contractor1Name", label: "Contractor 1 — Nama", type: "text" },
        { key: "contractor1WorkingScope", label: "Contractor 1 — Working Scope", type: "text" },
        { key: "contractor1SubContractor", label: "Contractor 1 — Sub Contractor", type: "text" },
        { key: "contractor1Quota", label: "Contractor 1 — Quota", type: "text" },
        { key: "contractor2Name", label: "Contractor 2 — Nama", type: "text" },
        { key: "contractor2WorkingScope", label: "Contractor 2 — Working Scope", type: "text" },
        { key: "contractor2SubContractor", label: "Contractor 2 — Sub Contractor", type: "text" },
        { key: "contractor2Quota", label: "Contractor 2 — Quota", type: "text" },
        { key: "contractor3Name", label: "Contractor 3 — Nama", type: "text" },
        { key: "contractor3WorkingScope", label: "Contractor 3 — Working Scope", type: "text" },
        { key: "contractor3SubContractor", label: "Contractor 3 — Sub Contractor", type: "text" },
        { key: "contractor3Quota", label: "Contractor 3 — Quota", type: "text" },
        ],
    },
    {
        sectionKey: "jetty",
        title: "Jetty Information",
        fields: [
        { key: "jettyPictureLink", label: "Jetty Picture (Link Foto)", type: "text", placeholder: "https://..." },
        { key: "jettyAreaHa", label: "Jetty Area Size", type: "number", unit: "Ha" },
        { key: "bargePerWeek", label: "Barge per Week", type: "number" },
        { key: "avgBargeSize", label: "Average Barge Size", type: "number" },
        { key: "theoreticalBargedAmount", label: "Theoretical Barged Amount", type: "number" },
        { key: "numberOfJettySlot", label: "Number of Jetty Slot", type: "number" },
        { key: "bargingTonnage", label: "Barging Tonnage", type: "text", unit: "ton" },
        { key: "bargingDaily", label: "Barging Daily", type: "text" },
        { key: "bargingMonthly", label: "Barging Monthly", type: "number" },
        { key: "bargingYearly", label: "Barging Yearly", type: "number" },
        { key: "ritaseDaily", label: "Ritase Daily", type: "text" },
        { key: "ritaseMonthly", label: "Ritase Monthly", type: "number" },
        { key: "ritaseYearly", label: "Ritase Yearly", type: "number" },
        { key: "jettyInfrastructure", label: "Infrastructure", type: "textarea" },
        ],
    },
    {
        sectionKey: "bargingRoad",
        title: "Barging Road Information",
        fields: [
        { key: "bargingRoadMapLink", label: "Barging Road Map (Link Foto)", type: "text", placeholder: "https://..." },
        { key: "bargingRoadDistance", label: "Distance", type: "number", unit: "KM" },
        { key: "bargingRoadBridge", label: "Bridge", type: "number" },
        { key: "bargingRoadBearingCapacity", label: "Road Bearing Capacity", type: "text" },
        { key: "bargingRoadMaintenanceUnit", label: "Maintenance Unit", type: "text" },
        { key: "bargingRoadUnitOperating", label: "Number of Unit Operating", type: "text" },
        { key: "bargingRoadBridgeMaxLoad", label: "Bridge Max Load", type: "number" },
        { key: "bargingRoadSlope", label: "Slope", type: "text", unit: "%" },
        ],
    },
    {
        sectionKey: "efo",
        title: "EFO Information",
        fields: [
        { key: "efoName", label: "EFO Name", type: "text" },
        { key: "efoAreaHa", label: "EFO Area", type: "number", unit: "Ha" },
        { key: "efoDistanceToJetty", label: "Distance to Jetty", type: "text" },
        { key: "efoLoadingPoints", label: "Number of Loading Points", type: "number" },
        { key: "efoLoaderUnit", label: "Number of Loader Unit", type: "number" },
        { key: "efoCapacity", label: "EFO Capacity", type: "number", unit: "ton" },
        { key: "efoWaterPond", label: "Water Pond", type: "text" },
        { key: "efoUnloadingPoints", label: "Number of Unloading Point", type: "number" },
        ],
    },
    {
        sectionKey: "haulingRoad",
        title: "Hauling Road Information",
        fields: [
        { key: "haulingRoadMapLink", label: "Hauling Road Map (Link Foto)", type: "text", placeholder: "https://..." },
        { key: "haulingRoadDistance", label: "Distance", type: "text", unit: "KM" },
        { key: "haulingRoadBridge", label: "Bridge", type: "number" },
        { key: "haulingRoadBearingCapacity", label: "Road Bearing Capacity", type: "text" },
        { key: "haulingRoadMaintenanceUnit", label: "Maintenance Unit", type: "text" },
        { key: "haulingRoadUnitOperating", label: "Number of Unit Operating", type: "text" },
        { key: "haulingRoadBridgeMaxLoad", label: "Bridge Max Load", type: "number" },
        { key: "haulingRoadSlope", label: "Slope", type: "text", unit: "%" },
        ],
    },
    {
        sectionKey: "eto",
        title: "ETO Information",
        fields: [
        { key: "etoName", label: "ETO Name", type: "text" },
        { key: "etoAreaHa", label: "ETO Area", type: "number", unit: "Ha" },
        { key: "etoDistanceToEfo", label: "Distance to EFO", type: "text" },
        { key: "etoLoadingPoints", label: "Number of Loading Points", type: "text" },
        { key: "etoLoaderUnit", label: "Number of Loader Unit", type: "number" },
        { key: "etoCapacity", label: "ETO Capacity", type: "text", unit: "ton" },
        { key: "etoWaterPond", label: "Water Pond", type: "text" },
        { key: "etoUnloadingPoints", label: "Number of Unloading Point", type: "number" },
        ],
    },
    {
        sectionKey: "miningRoad",
        title: "Mining Road Information",
        fields: [
        { key: "miningRoadMapLink", label: "Mining Road Map (Link Foto)", type: "text", placeholder: "https://..." },
        { key: "miningRoadDistance", label: "Distance", type: "text", unit: "KM" },
        { key: "miningRoadBridge", label: "Bridge", type: "number" },
        { key: "miningRoadBearingCapacity", label: "Road Bearing Capacity", type: "text" },
        { key: "miningRoadMaintenanceUnit", label: "Maintenance Unit", type: "text" },
        { key: "miningRoadUnitOperating", label: "Number of Unit Operating", type: "text" },
        { key: "miningRoadBridgeMaxLoad", label: "Bridge Max Load", type: "number" },
        { key: "miningRoadSlope", label: "Slope", type: "text", unit: "%" },
        ],
    },
    {
        sectionKey: "pit",
        title: "PIT Information",
        fields: [
        { key: "numberOfPit", label: "Number of Pit", type: "text", placeholder: "2 (Pit 5 dan Pit 100)" },
        { key: "pitProductionCapability", label: "Production Capability", type: "text", unit: "ton" },
        { key: "pitDistanceToEto", label: "Distance to ETO", type: "text" },
        { key: "pitLoadingPoint", label: "Number of Loading Point", type: "text" },
        { key: "pitCutOffGrade", label: "Cut off Grade / COG", type: "number" },
        ],
    },
    {
        sectionKey: "workshop",
        title: "Workshop Information",
        fields: [
        { key: "workAreaArrangement", label: "Work Area Arrangement", type: "text", placeholder: "Mixed, 1.5 Ha" },
        { key: "clearWorkflowAvailable", label: "Clear Workflow Available", type: "textarea" },
        { key: "workshopRepairArea", label: "Repair Area", type: "text" },
        { key: "workshopMaintenanceArea", label: "Maintenance Area", type: "text" },
        { key: "numberOfBays", label: "Number of Bays", type: "number" },
        { key: "workshopRemarks", label: "Remarks", type: "textarea" },
        { key: "fabricationArea", label: "Fabrication Area", type: "text" },
        { key: "totalMechanics", label: "Total Mechanics", type: "text" },
        ],
    },
    {
        sectionKey: "warehouse",
        title: "Warehouse Information",
        fields: [
        { key: "warehouseTotalArea", label: "Total Area", type: "number", unit: "m²" },
        { key: "warehouseDistanceToWorkshop", label: "Distance to Workshop", type: "text" },
        { key: "warehouseLayoutType", label: "Layout Type", type: "text", placeholder: "Rack System" },
        { key: "warehouseSketchAttached", label: "Sketch Attached (Link)", type: "text", placeholder: "https://..." },
        { key: "warehouseLengthWidth", label: "Length × Width", type: "text", placeholder: "4 m × 3 m" },
        { key: "warehouseDistanceToPitEto", label: "Distance to PIT / ETO", type: "text" },
        { key: "warehouseAreaDivision", label: "Area Division", type: "text" },
        ],
    },
    {
        sectionKey: "production",
        title: "Production Information",
        fields: [
        { key: "avgTonaseUnit", label: "Average Tonase Unit", type: "text", placeholder: "24 ton - 26 Ton" },
        { key: "productionDistance", label: "Distance", type: "text" },
        { key: "cycleTime", label: "Cycle Time", type: "text", placeholder: "40 - 50 Minutes" },
        { key: "gradeHaulingRoad", label: "Grade Hauling Road", type: "number" },
        { key: "haulingRoadCapacity", label: "Hauling Road Capacity", type: "text", placeholder: "2 Ways" },
        { key: "haulingRoadMaterial", label: "Hauling Road Material", type: "text" },
        { key: "haulingDistance", label: "Hauling Distance", type: "text" },
        { key: "roadMaintenance", label: "Road Maintenance", type: "text" },
        { key: "compacted", label: "Compacted", type: "text" },
        { key: "roadWidth", label: "Width", type: "textarea" },
        { key: "uphill", label: "Uphill", type: "text" },
        { key: "downhill", label: "Downhill", type: "text" },
        { key: "portal", label: "Portal", type: "number" },
        { key: "driverTraining", label: "Driver Training", type: "textarea" },
        ],
    },
    {
        sectionKey: "otherRemarks",
        title: "Other Remarks",
        fields: [
        { key: "onSiteRoadCondition", label: "On-site Road Condition", type: "textarea" },
        { key: "catatan", label: "Catatan", type: "textarea", placeholder: "Minta logo cust, foto unit, foto tanjakan, ..." },
        ],
    },
];

export const getSectionByKey = (sectionKey: string): SurveySection | undefined =>
SURVEY_SCHEMA.find((s) => s.sectionKey === sectionKey);