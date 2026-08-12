import {
    LuActivity,
    LuBoxes,
    LuClipboardList,
    LuLayers,
    LuRuler,
    LuTruck,
    LuUsers,
} from "react-icons/lu";
import { StatCard } from "@/pages/CRM/Customer/components/StatCard";

import type { IupDashboard } from "../../types/iupDashboard";
import { formatNumber, toNumber } from "./dashboardUtils";

interface OverviewMetricsProps {
    iup: IupDashboard;
}

function getLatestRkab(iup: IupDashboard) {
    if (!iup.iup_rkab.length) return null;
    return [...iup.iup_rkab].sort((a, b) => Number(b.iup_rkab_year) - Number(a.iup_rkab_year))[0];
}

function getTotalFleet(iup: IupDashboard): number {
    return iup.customers.reduce((sum, c) => sum + toNumber(c.number_of_fleet), 0);
}

function getBrandUnitSummary(iup: IupDashboard) {
    const active = iup.iup_brand_unit.filter((b) => !b.is_delete);
    return {
        totalQty: active.reduce((sum, b) => sum + toNumber(b.iup_brand_unit_qty), 0),
        brandCount: active.length,
    };
}

export function OverviewMetrics({ iup }: OverviewMetricsProps) {
    const latestRkab = getLatestRkab(iup);
    const totalFleet = getTotalFleet(iup);
    const brandUnit = getBrandUnitSummary(iup);
    // SK Berlaku s.d. card disabled — see commented StatCard below.
    // const skDaysLeft = daysUntil(iup.sk_end_date);
    // const skBadge =
    //     skDaysLeft !== null
    //         ? skDaysLeft < 0
    //             ? "Kedaluwarsa"
    //             : skDaysLeft < 365
    //                 ? `${skDaysLeft} hari lagi`
    //                 : undefined
    //         : undefined;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                title="IUP Area"
                value={`${formatNumber(iup.area_size_ha)}`}
                description="Ha"
                Icon={LuRuler}
                iconClassName="text-blue-600"
            />
            <StatCard
                title="Customers"
                value={iup.customer_count}
                description="mitra terhubung"
                Icon={LuUsers}
                iconClassName="text-green-600"
            />
            <StatCard
                title="Total Fleet"
                value={formatNumber(totalFleet)}
                description="unit armada"
                Icon={LuTruck}
                iconClassName="text-purple-600"
            />
            <StatCard
                title={latestRkab ? `RKAB ${latestRkab.iup_rkab_year}` : "RKAB"}
                value={latestRkab ? formatNumber(latestRkab.iup_rkab_current_production) : "-"}
                description={latestRkab ? `Target: ${formatNumber(latestRkab.iup_rkab_target_production)}` : undefined}
                Icon={LuClipboardList}
                iconClassName="text-blue-600"
            />
            <StatCard
                title="Activity Stage"
                value={iup.activity_stage || "-"}
                Icon={LuActivity}
                iconClassName="text-amber-600"
            />
            <StatCard
                title="Segmentation"
                value={iup.iup_segmentation_name || "-"}
                Icon={LuLayers}
                iconClassName="text-teal-600"
            />
            {/* <StatCard
                title="SK Berlaku s.d."
                value={formatDate(iup.sk_end_date)}
                description={skBadge}
                Icon={LuCalendarClock}
                iconClassName={skBadge && skDaysLeft !== null && skDaysLeft < 365 ? "text-warning-600" : "text-gray-500"}
            /> */}
            <StatCard
                title="Brand Unit"
                value={formatNumber(brandUnit.totalQty)}
                description={`${brandUnit.brandCount} brand · unit`}
                Icon={LuBoxes}
                iconClassName="text-indigo-600"
            />
        </div>
    );
}
