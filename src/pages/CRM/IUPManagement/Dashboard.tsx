import React from "react";
import { LuTriangleAlert, LuRefreshCw } from "react-icons/lu";

import Button from "@/components/ui/button/Button";
import LoadingSpinner from "@/components/common/Loading";

import { IupHeader } from "./components/Dashboard/IupHeader";
import { AreaInformation } from "./components/Dashboard/AreaInformation";
import { CriteriaInformation } from "./components/Dashboard/CriteriaInformation";
// import { OverviewMetrics } from "./components/Dashboard/OverviewMetrics";
// import { CustomerList } from "./components/Dashboard/CustomerList";
// import { BrandUnitList } from "./components/Dashboard/BrandUnitList";
// import { RkabHistory } from "./components/Dashboard/RkabHistory";
import { ZonaSiteList } from "./components/Dashboard/ZonaSiteList";
// import { VisitHistoryTimeline } from "./components/Dashboard/VisitHistoryTimeline";
// import { SurveyLogList } from "./components/Dashboard/SurveyLogList";
import { useIupDashboard } from "./hooks/useIupDashboard";

export default function IupDashboard() {
    const { data, isLoading, error, refetch } = useIupDashboard();

    if (isLoading) {
        return (
            <div className="bg-white w-full rounded-2xl border border-slate-300 min-h-60 flex items-center justify-center relative">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white w-full rounded-2xl border border-slate-300 min-h-60 flex flex-col items-center justify-center text-center px-6">
                <LuTriangleAlert size={32} className="text-warning-500 mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                    {error ?? "Data IUP tidak ditemukan."}
                </p>
                <Button type="button" variant="outline" onClick={refetch} startIcon={<LuRefreshCw size={16} />}>
                    Coba lagi
                </Button>
            </div>
        );
    }

    return (<>
        <div className="space-y-6">
            <IupHeader iup={data} />

            <Section title="IUP Criteria Information">
                <CriteriaInformation iup={data} />
            </Section>

            <Section title="IUP Area Information">
                <AreaInformation iup={data} />
            </Section>


            {/* <Section title="Overview">
            <OverviewMetrics iup={data} />
        </Section> */}

            {/* <Section title="RKAB History">
            <RkabHistory rkabHistory={data.iup_rkab} />
        </Section> */}

            {/* <Section title="Customers" subtitle={`${data.customer_count} mitra terhubung`}>
            <CustomerList customers={data.customers} />
        </Section> */}

            {/* <Section title="Brand Unit">
            <BrandUnitList brandUnits={data.iup_brand_unit} />
        </Section> */}

            <Section title="Zona Site">
                <ZonaSiteList zonaSites={data.iup_zona_site} />
            </Section>

            {/* <Section title="Visit History">
            <VisitHistoryTimeline visits={data.iup_visit_history} />
        </Section>

        <Section title="Survey / Chat Log" subtitle="Sumber data mentah dari lapangan">
            <SurveyLogList logs={data.iup_survey} />
        </Section> */}
        </div>
    </>);
}

function Section({
    title,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (

        <div className="w-full rounded-2xl border border-slate-300 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-300 bg-[#0253a5]">
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide text-white">{title}</h2>
                    </div>
                </div>
            </div>


            <div className="font-secondary">
                {children}
            </div>
        </div>
    );
}
