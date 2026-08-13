import type { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";

import type { IupDashboard } from "../../types/iupDashboard";
import { formatNumber } from "./dashboardUtils";

interface AreaInformationProps {
    iup: IupDashboard;
}

interface AreaInfoRow {
    label: string;
    value: string;
}

const columns: TableColumn<AreaInfoRow>[] = [
    {
        name: "",
        selector: (row) => row.label,
        cell: (row) => <span className="font-primary-bold text-gray-700">{row.label}</span>,
        width: "250px",
    },
    {
        name: "",
        selector: (row) => row.value,
        cell: (row) => <span className="text-gray-800">{row.value}</span>,
    },
];

export function AreaInformation({ iup }: AreaInformationProps) {
    // const iupColumns: TableColumn<IupItem>[] = [
    const rows: AreaInfoRow[] = [
        { label: "Lokasi Tambang", value: iup.mine_location || "-" },
        { label: "Luas Area", value: `${formatNumber(iup.area_size_ha)} Ha` },
        { label: "Provinsi", value: iup.province_name || "-" },
        { label: "Kabupaten", value: iup.regency_name || "-" },
        { label: "Zona IUP", value: iup.iup_zone_name || "-" },
        { label: "Area", value: iup.area_name || "-" },
        { label: "Group", value: iup.group_name || "-" },
        { label: "Pulau", value: iup.island_name || "-" },
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={rows}
            keyField="label"
            pagination={false}
            hideTableHead={true}
            striped={true}
            responsive={true}
            headerBackground="transparent"
        />
    );
}
