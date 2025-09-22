import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "@/components/common/PageMeta";

export default function Home() {
    return (
        <>
        <PageMeta
            title="Motor Sights International - Dashboard"
            description="Motor Sights International - Dashboard"
            image="/motor-sights-international.png"
        />
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetrics />

            {/* <MonthlySalesChart /> */}
            </div>

            <div className="col-span-12 xl:col-span-5">
            {/* <MonthlyTarget /> */}
            </div>

            <div className="col-span-12">
            {/* <StatisticsChart /> */}
            </div>

            <div className="col-span-12 xl:col-span-5">
            <DemographicCard />
            </div>

        </div>
        </>
    );
}
