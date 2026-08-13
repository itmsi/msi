import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";

import type { IupRkabYear } from "../../types/iupDashboard";
import { formatNumber, toNumber } from "./dashboardUtils";

echarts.use([TooltipComponent, LegendComponent, GridComponent, BarChart, CanvasRenderer]);

interface RkabHistoryProps {
    rkabHistory: IupRkabYear[];
}

export function RkabHistory({ rkabHistory }: RkabHistoryProps) {
    const sorted = useMemo(
        () => [...rkabHistory].sort((a, b) => Number(a.iup_rkab_year) - Number(b.iup_rkab_year)),
        [rkabHistory]
    );

    const chartOption = useMemo(() => {
        if (sorted.length === 0) return null;

        return {
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                valueFormatter: (value: number) => formatNumber(value),
            },
            legend: { bottom: 0, left: "center", textStyle: { fontSize: 12, color: "#475467" } },
            grid: { left: 8, right: 8, top: 16, bottom: 36, containLabel: true },
            color: ["#fdb022", "#0253a5"],
            xAxis: {
                type: "category",
                data: sorted.map((year) => year.iup_rkab_year),
                axisLine: { lineStyle: { color: "#e4e7ec" } },
                axisLabel: { color: "#475467", fontSize: 12 },
            },
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { color: "#f2f4f7" } },
                axisLabel: {
                    color: "#475467",
                    fontSize: 11,
                    formatter: (value: number) => formatNumber(value),
                },
            },
            series: [
                {
                    name: "Target",
                    type: "bar",
                    barMaxWidth: 28,
                    itemStyle: { borderRadius: [4, 4, 0, 0] },
                    data: sorted.map((year) => toNumber(year.iup_rkab_target_production)),
                },
                {
                    name: "Actual",
                    type: "bar",
                    barMaxWidth: 28,
                    itemStyle: { borderRadius: [4, 4, 0, 0] },
                    data: sorted.map((year) => toNumber(year.iup_rkab_current_production)),
                },
            ],
        };
    }, [sorted]);

    if (!chartOption) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-gray-500">
                Belum ada histori RKAB.
            </div>
        );
    }

    return (
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
            <ReactECharts option={chartOption} style={{ height: "280px" }} notMerge />

            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                            <th className="py-2 pr-4 font-semibold font-secondary">Tahun</th>
                            <th className="py-2 pr-4 font-semibold font-secondary text-right">Target</th>
                            <th className="py-2 pr-4 font-semibold font-secondary text-right">Actual</th>
                            <th className="py-2 font-semibold font-secondary text-right">Capaian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sorted.map((year) => {
                            const target = toNumber(year.iup_rkab_target_production);
                            const current = toNumber(year.iup_rkab_current_production);
                            const achievedPct = target > 0 ? Math.round((current / target) * 100) : 0;
                            return (
                                <tr key={year.iup_rkab_id}>
                                    <td className="py-2 pr-4 font-primary-bold">{year.iup_rkab_year}</td>
                                    <td className="py-2 pr-4 text-right text-gray-600">{formatNumber(target)}</td>
                                    <td className="py-2 pr-4 text-right text-gray-600">{formatNumber(current)}</td>
                                    <td
                                        className={
                                            "py-2 text-right font-semibold font-secondary " +
                                            (achievedPct >= 100 ? "text-success-700" : "text-warning-600")
                                        }
                                    >
                                        {achievedPct}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
