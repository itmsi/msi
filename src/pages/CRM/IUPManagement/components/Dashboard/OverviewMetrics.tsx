import { Card, CardContent } from "@/components/ui/card";

import type { IupDetail } from "../types/iup.types";
import { daysUntil, formatDate, formatNumber, toNumber } from "../utils/format";

interface OverviewMetricsProps {
    iup: IupDetail;
}

function getLatestRkab(iup: IupDetail) {
    if (!iup.iup_rkab.length) return null;
    return [...iup.iup_rkab].sort((a, b) => Number(b.iup_rkab_year) - Number(a.iup_rkab_year))[0];
}

function getTotalFleet(iup: IupDetail): number {
    return iup.customers.reduce((sum, c) => sum + toNumber(c.number_of_fleet), 0);
}

export function OverviewMetrics({ iup }: OverviewMetricsProps) {
    const latestRkab = getLatestRkab(iup);
    const totalFleet = getTotalFleet(iup);
    const skDaysLeft = daysUntil(iup.sk_end_date);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="IUP Area" value={formatNumber(iup.area_size_ha)} unit="Ha" />
            <Metric label="Customers" value={iup.customer_count} unit="mitra" />
            <Metric label="Total Fleet" value={formatNumber(totalFleet)} unit="unit" />
            <Metric
                label={latestRkab ? `RKAB ${latestRkab.iup_rkab_year}` : "RKAB"}
                value={latestRkab ? formatNumber(latestRkab.iup_rkab_current_production) : "-"}
                unit={latestRkab ? `/ target ${formatNumber(latestRkab.iup_rkab_target_production)}` : undefined}
                highlight
            />
            <Metric label="Activity Stage" value={iup.activity_stage} />
            <Metric label="Segmentation" value={iup.iup_segmentation_name} />
            <Metric
                label="SK Berlaku s.d."
                value={formatDate(iup.sk_end_date)}
                badge={
                    skDaysLeft !== null
                        ? skDaysLeft < 0
                            ? "Kedaluwarsa"
                            : skDaysLeft < 365
                                ? `${skDaysLeft} hari lagi`
                                : undefined
                        : undefined
                }
                badgeTone={skDaysLeft !== null && skDaysLeft < 365 ? "warning" : undefined}
            />
            <Metric label="Sales PIC" value={iup.sales_pic.map((p) => p.name).join(", ") || "-"} />
        </div>
    );
}

interface MetricProps {
    label: string;
    value: string;
    unit?: string;
    highlight?: boolean;
    badge?: string;
    badgeTone?: "warning";
}

function Metric({ label, value, unit, highlight, badge, badgeTone }: MetricProps) {
    return (
        <Card className={highlight ? "bg-emerald-950 text-white border-emerald-950" : undefined}>
            <CardContent className="p-4">
                <div
                    className={
                        "text-[11px] uppercase tracking-wide font-semibold mb-1.5 " +
                        (highlight ? "text-emerald-400" : "text-muted-foreground")
                    }
                >
                    {label}
                </div>
                <div className="text-lg font-extrabold leading-tight truncate" title={value}>
                    {value}
                    {unit && (
                        <span
                            className={
                                "text-xs font-semibold ml-1 " + (highlight ? "text-emerald-400" : "text-muted-foreground")
                            }
                        >
                            {unit}
                        </span>
                    )}
                </div>
                {badge && (
                    <div
                        className={
                            "text-[11px] font-semibold mt-1 " +
                            (badgeTone === "warning" ? "text-amber-600" : "text-muted-foreground")
                        }
                    >
                        {badge}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
