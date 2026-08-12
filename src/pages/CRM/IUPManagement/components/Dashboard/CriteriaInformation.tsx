import type { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";

import type { IupDashboard } from "../../types/iupDashboard";
import { formatNumber } from "./dashboardUtils";

interface CriteriaInformationProps {
    iup: IupDashboard;
}

interface CriteriaRow {
    label: string;
    value: string;
}

const columns: TableColumn<CriteriaRow>[] = [
    {
        name: "",
        selector: (row) => row.label,
        cell: (row) => <span className="font-primary-bold text-gray-700">{row.label}</span>,
        width: "220px",
    },
    {
        name: "",
        selector: (row) => row.value,
        cell: (row) => <span className="text-gray-800">{row.value}</span>,
        wrap: true,
        grow: 2,
    },
];

export function CriteriaInformation({ iup }: CriteriaInformationProps) {
    const sortedRkab = [...iup.iup_rkab].sort(
        (a, b) => Number(b.iup_rkab_year) - Number(a.iup_rkab_year)
    );

    const rkabRows: CriteriaRow[] = sortedRkab.flatMap((r) => [
        { label: `RKAB ${r.iup_rkab_year}`, value: `${formatNumber(r.iup_rkab_target_production)} ton (target)` },
        { label: `${r.iup_rkab_year} Actual Production`, value: `${formatNumber(r.iup_rkab_current_production)} ton` },
    ]);

    const activeBrands = iup.iup_brand_unit.filter((b) => !b.is_delete);
    const brandUnitValue =
        activeBrands.length > 0
            ? activeBrands.map((b) => `${b.iup_brand_unit_name} (${formatNumber(b.iup_brand_unit_qty)} unit)`).join(", ")
            : "-";

    const rows: CriteriaRow[] = [
        { label: "IUP Name", value: iup.iup_name || "-" },
        { label: "Group and Zone", value: `${iup.group_name || "-"} / ${iup.iup_zone_name || "-"}` },
        ...rkabRows,
        { label: "Existing Unit Brand", value: brandUnitValue },
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={rows}
            keyField="label"
            pagination={false}
            hideTableHead={true}
            headerBackground="transparent"
            customStyles={{
                tableWrapper: {
                    style: { width: "100%", minWidth: "0" },
                },
            }}
        />
    );
}
