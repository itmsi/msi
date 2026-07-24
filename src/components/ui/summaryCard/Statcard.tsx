import { IconType } from "react-icons";
export type StatCardColor =
    | "blue"
    | "green"
    | "purple"
    | "yellow"
    | "orange"
    | "red"
    | "indigo"
    | "pink"
    | "teal"
    | "cyan"
    | "emerald"
    | "sky"
    | "amber"
    | "rose"
    | "gray";

const colorClasses: Record<
    StatCardColor,
    { iconBg: string; iconText: string; labelText: string; valueText: string }
> = {
    blue: {
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        labelText: "text-blue-600",
        valueText: "text-blue-900",
    },
    green: {
        iconBg: "bg-green-100",
        iconText: "text-green-600",
        labelText: "text-green-600",
        valueText: "text-green-900",
    },
    purple: {
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        labelText: "text-purple-600",
        valueText: "text-purple-900",
    },
    yellow: {
        iconBg: "bg-yellow-100",
        iconText: "text-yellow-600",
        labelText: "text-yellow-600",
        valueText: "text-yellow-900",
    },
    orange: {
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
        labelText: "text-orange-600",
        valueText: "text-orange-900",
    },
    red: {
        iconBg: "bg-red-100",
        iconText: "text-red-600",
        labelText: "text-red-600",
        valueText: "text-red-900",
    },
    indigo: {
        iconBg: "bg-indigo-100",
        iconText: "text-indigo-600",
        labelText: "text-indigo-600",
        valueText: "text-indigo-900",
    },
    pink: {
        iconBg: "bg-pink-100",
        iconText: "text-pink-600",
        labelText: "text-pink-600",
        valueText: "text-pink-900",
    },
    teal: {
        iconBg: "bg-teal-100",
        iconText: "text-teal-600",
        labelText: "text-teal-600",
        valueText: "text-teal-900",
    },
    cyan: {
        iconBg: "bg-cyan-100",
        iconText: "text-cyan-600",
        labelText: "text-cyan-600",
        valueText: "text-cyan-900",
    },
    emerald: {
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-600",
        labelText: "text-emerald-600",
        valueText: "text-emerald-900",
    },
    sky: {
        iconBg: "bg-sky-100",
        iconText: "text-sky-600",
        labelText: "text-sky-600",
        valueText: "text-sky-900",
    },
    amber: {
        iconBg: "bg-amber-100",
        iconText: "text-amber-600",
        labelText: "text-amber-600",
        valueText: "text-amber-900",
    },
    rose: {
        iconBg: "bg-rose-100",
        iconText: "text-rose-600",
        labelText: "text-rose-600",
        valueText: "text-rose-900",
    },
    gray: {
        iconBg: "bg-gray-100",
        iconText: "text-gray-600",
        labelText: "text-gray-600",
        valueText: "text-gray-900",
    },
};

export interface StatCardProps {
    // Opsional: kalau tidak diisi, card tampil tanpa kotak ikon di kiri
    icon?: IconType;
    label: string;
    value: string | number;
    color: StatCardColor;
    // Override untuk wrapper terluar (mis. tambah col-span, margin, dst)
    className?: string;
    // Override lebih detail per-bagian, semua opsional
    classNames?: {
        iconWrapper?: string;
        icon?: string;
        label?: string;
        value?: string;
    };
}

export default function StatCard({
    icon: Icon,
    label,
    value,
    color,
    className,
    classNames,
}: StatCardProps) {
    const classes = colorClasses[color];

    return (
        <div
            className={`bg-white overflow-hidden shadow rounded-lg${
                className ? ` ${className}` : ""
            }`}
        >
            <div className="p-5">
                <div className="flex items-center">
                    {Icon && (
                        <div
                            className={`p-2 rounded-lg ${classes.iconBg}${
                                classNames?.iconWrapper ? ` ${classNames.iconWrapper}` : ""
                            }`}
                        >
                            <Icon
                                className={`w-5 h-5 ${classes.iconText}${
                                    classNames?.icon ? ` ${classNames.icon}` : ""
                                }`}
                            />
                        </div>
                    )}
                    <div className={Icon ? "ml-3" : ""}>
                        <p
                            className={`text-sm font-medium ${classes.labelText}${
                                classNames?.label ? ` ${classNames.label}` : ""
                            }`}
                        >
                            {label}
                        </p>
                        <p
                            className={`text-2xl font-bold ${classes.valueText}${
                                classNames?.value ? ` ${classNames.value}` : ""
                            }`}
                        >
                            {value.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}