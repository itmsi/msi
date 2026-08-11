import { Card, CardContent } from "@/components/ui/card";

import type { IupRkabYear } from "../types/iup.types";
import { formatNumber, toNumber } from "../utils/format";

interface RkabHistoryProps {
    rkabHistory: IupRkabYear[];
}

export function RkabHistory({ rkabHistory }: RkabHistoryProps) {
    if (rkabHistory.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                Belum ada histori RKAB.
            </div>
        );
    }

    const sorted = [...rkabHistory].sort(
        (a, b) => Number(a.iup_rkab_year) - Number(b.iup_rkab_year)
    );
    const maxValue = Math.max(
        ...sorted.map((r) => Math.max(toNumber(r.iup_rkab_target_production), toNumber(r.iup_rkab_current_production)))
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sorted.map((year) => {
                const target = toNumber(year.iup_rkab_target_production);
                const current = toNumber(year.iup_rkab_current_production);
                const achievedPct = target > 0 ? Math.round((current / target) * 100) : 0;
                const targetWidth = maxValue > 0 ? (target / maxValue) * 100 : 0;
                const currentWidth = maxValue > 0 ? (current / maxValue) * 100 : 0;

                return (
                    <Card key={year.iup_rkab_id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold">{year.iup_rkab_year}</span>
                                <span
                                    className={
                                        "text-xs font-semibold " +
                                        (achievedPct >= 100 ? "text-emerald-700" : "text-amber-600")
                                    }
                                >
                                    {achievedPct}% dari target
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                                        <span>Target</span>
                                        <span>{formatNumber(target)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-slate-300" style={{ width: `${targetWidth}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                                        <span>Actual</span>
                                        <span>{formatNumber(current)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-emerald-600" style={{ width: `${currentWidth}%` }} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
