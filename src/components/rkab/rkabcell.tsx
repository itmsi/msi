import React from "react";

interface RkabCellProps {
    year: number;
    target: number;
    current: number;
}

export function RkabCell({ year, target, current }: RkabCellProps) {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const isComplete = current >= target;

  // Warna progress bar mengikuti tingkat pencapaian
  const barColor = isComplete
        ? "bg-emerald-500"
        : percentage >= 50
        ? "bg-amber-500"
        : "bg-red-400";

    return (
        <div className="min-w-[180px]">
            {/* Baris atas: tahun + status persentase */}
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-800">{year}</span>
                <span
                    className={`text-xs font-medium ${
                        isComplete ? "text-emerald-600" : "text-slate-500"
                    }`}
                >
                    {Math.round(percentage)}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-1.5">
                <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Baris bawah: current / target */}
            <div className="flex items-baseline gap-1 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                    {current.toLocaleString("id-ID")}
                </span>
                <span>/</span>
                <span>{target.toLocaleString("id-ID")} target</span>
            </div>
        </div>
    );
}

export default RkabCell;