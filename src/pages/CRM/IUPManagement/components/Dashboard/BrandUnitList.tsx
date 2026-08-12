import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { LegendComponent, TooltipComponent } from "echarts/components";

import type { IupBrandUnit } from "../../types/iupDashboard";
import { formatNumber, toNumber } from "./dashboardUtils";

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

const CHART_COLORS = ["#0253a5", "#465fff", "#0ba5ec", "#12b76a", "#f79009", "#7a5af8"];

interface BrandUnitListProps {
    brandUnits: IupBrandUnit[];
}

export function BrandUnitList({ brandUnits }: BrandUnitListProps) {
    const sorted = useMemo(
        () =>
            brandUnits
                .filter((b) => !b.is_delete)
                .slice()
                .sort((a, b) => toNumber(b.iup_brand_unit_qty) - toNumber(a.iup_brand_unit_qty)),
        [brandUnits]
    );

    const totalQty = useMemo(() => sorted.reduce((sum, b) => sum + toNumber(b.iup_brand_unit_qty), 0), [sorted]);

    const chartOption = useMemo(() => {
        if (sorted.length === 0) return null;

        return {
            tooltip: {
                trigger: "item",
                valueFormatter: (value: number) => formatNumber(value),
            },
            legend: {
                orient: "vertical",
                right: 0,
                top: "middle",
                textStyle: { fontSize: 12, color: "#475467" },
            },
            color: CHART_COLORS,
            series: [
                {
                    name: "Brand Unit",
                    type: "pie",
                    radius: ["45%", "70%"],
                    center: ["38%", "50%"],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 6, borderColor: "#f9fafb", borderWidth: 2 },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 13, fontWeight: "bold" } },
                    data: sorted.map((brand) => ({
                        name: brand.iup_brand_unit_name,
                        value: toNumber(brand.iup_brand_unit_qty),
                    })),
                },
            ],
        };
    }, [sorted]);

    if (!chartOption) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-gray-500">
                Belum ada data unit/brand armada.
            </div>
        );
    }

    return (
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-primary-bold uppercase tracking-wide text-gray-500">
                    Brand Unit Breakdown
                </span>
                <span className="text-xs text-gray-500">Total {totalQty} unit</span>
            </div>
            <ReactECharts option={chartOption} style={{ height: "260px" }} notMerge />

            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                            <th className="py-2 pr-4 font-semibold font-secondary">Brand Unit</th>
                            <th className="py-2 pr-4 font-semibold font-secondary text-right">Qty</th>
                            <th className="py-2 font-semibold font-secondary text-right">Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sorted.map((brand, i) => {
                            const qty = toNumber(brand.iup_brand_unit_qty);
                            const sharePct = totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0;
                            return (
                                <tr key={brand.iup_brand_unit_id}>
                                    <td className="py-2 pr-4 font-primary-bold">
                                        <span className="inline-flex items-center gap-2">
                                            <span
                                                className="inline-block w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                            />
                                            {brand.iup_brand_unit_name}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 text-right text-gray-600">{formatNumber(qty)}</td>
                                    <td className="py-2 text-right text-gray-600">{sharePct}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
