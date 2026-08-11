import { useParams } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";

// NOTE: adjust to the project's actual toast hook location.
// import { useToast } from "@/hooks/useToast";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";

// import { IupHeader } from "./components/IupHeader";
// import { OverviewMetrics } from "./components/OverviewMetrics";
// import { CustomerList } from "./components/CustomerList";
// import { BrandUnitList } from "./components/BrandUnitList";
// import { RkabHistory } from "./components/RkabHistory";
// import { ZonaSiteTabs } from "./components/ZonaSiteTabs";
// import { VisitHistoryTimeline } from "./components/VisitHistoryTimeline";
// import { SurveyLogList } from "./components/SurveyLogList";
import { useIupDashboard } from "./hooks/useIupDashboard";

export default function IupDashboard() {
    const { iupId } = useParams<{ iupId: string }>();
    const { data: iup, isLoading, error, refetch } = useIupDashboard(iupId);
    console.log(iup);
    // const { toast } = useToast();

    // const handleExport = () => {
    //     toast({ title: "Menyiapkan export…", description: "File akan diunduh sebentar lagi." });
    //     // wire to real export endpoint/service
    // };

    // if (isLoading) {
    //     return <DetailSkeleton />;
    // }

    // if (error || !iup) {
    //     return (
    //         <div className="max-w-md mx-auto mt-24 text-center">
    //             <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
    //             <p className="text-sm text-muted-foreground mb-4">
    //                 {error ?? "Data IUP tidak ditemukan."}
    //             </p>
    //             <Button variant="outline" onClick={refetch}>
    //                 <RefreshCw className="h-4 w-4 mr-1.5" />
    //                 Coba lagi
    //             </Button>
    //         </div>
    //     );
    // }

    return (
        <div className="max-w-[1280px] mx-auto px-6 pb-16">
            {/* <IupHeader iup={iup} onExport={handleExport} />

            <Section title="Overview">
                <OverviewMetrics iup={iup} />
            </Section>

            <Section title="RKAB History">
                <RkabHistory rkabHistory={iup.iup_rkab} />
            </Section>

            <Section title="Customers" subtitle={`${iup.customer_count} mitra terhubung`}>
                <CustomerList customers={iup.customers} />
            </Section>

            <Section title="Brand Unit">
                <BrandUnitList brandUnits={iup.iup_brand_unit} />
            </Section>

            <Section title="Zona Site" subtitle="Detail survei per area operasional">
                <ZonaSiteTabs zonaSites={iup.iup_zona_site} />
            </Section>

            <Section title="Visit History">
                <VisitHistoryTimeline visits={iup.iup_visit_history} />
            </Section>

            <Section title="Survey / Chat Log" subtitle="Sumber data mentah dari lapangan">
                <SurveyLogList logs={iup.iup_survey} />
            </Section> */}
        </div>
    );
}

function Section({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="pt-10">
            <div className="mb-4">
                <h2 className="text-lg font-bold">{title}</h2>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

// function DetailSkeleton() {
//     return (
//         <div className="max-w-[1280px] mx-auto px-6 pt-6 space-y-6">
//             <Skeleton className="h-10 w-2/3" />
//             <div className="grid grid-cols-4 gap-4">
//                 {Array.from({ length: 8 }).map((_, i) => (
//                     <Skeleton key={i} className="h-20" />
//                 ))}
//             </div>
//             <Skeleton className="h-64 w-full" />
//         </div>
//     );
// }
