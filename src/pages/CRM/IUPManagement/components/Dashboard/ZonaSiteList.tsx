import DOMPurify from "dompurify";
import { RICH_CONTENT_SANITIZE_CONFIG } from "@/helpers/sanitizeConfig";
import moment from "moment";
import type { TableColumn } from "react-data-table-component";
import { LuLink2, LuSparkles } from "react-icons/lu";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";

import type { IupZonaSite } from "../../types/iupDashboard";

interface ZonaSiteListProps {
    zonaSites: IupZonaSite[];
}

const columns: TableColumn<IupZonaSite>[] = [
    {
        name: "",
        selector: (zone) => zone.iup_zona_site_name,
        cell: (zone) => (
            <div className={`text-slate-600 py-3`}>
                <p className="flex-1 text-sm font-primary-bold">{zone.iup_zona_site_name}</p>
                <p className="flex-1 text-xs font-secondary">{moment(zone.iup_zona_site_date_last_survey).format("DD MMMM YYYY")}</p>
            </div>
        ),
        width: "250px",
    },
    {
        name: "",
        selector: (zone) => zone.iup_zona_site_id,
        cell: (zone) => <ZonaSiteDetail zone={zone} />,
        wrap: true,
        minWidth: "400px",
        grow: 2,
    },
];

export function ZonaSiteList({ zonaSites }: ZonaSiteListProps) {
    if (zonaSites.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-gray-500">
                Belum ada zona site yang disurvei.
            </div>
        );
    }

    return (
        <CustomDataTable
            columns={columns}
            data={zonaSites}
            keyField="iup_zona_site_id"
            pagination={false}
            hideTableHead={true}
            headerBackground="transparent"
            striped={true}
            responsive={true}
            customStyles={{
                tableWrapper: {
                    style: { width: "100%", minWidth: "0" },
                },
                cells: {
                    style: {
                        alignItems: "start",
                    },
                },
            }}
        />
    );
}

function ZonaSiteDetail({ zone }: { zone: IupZonaSite }) {
    return (
        <div className="py-3 w-full">
            {zone.summary_response_ai && (
                <div className="mb-3 p-3.5 rounded-lg bg-blue-light-50 border border-blue-light-200">
                    <div className="flex items-center gap-1.5 mb-1.5 text-primary text-xs font-primary-bold">
                        <LuSparkles size={14} />
                        Ringkasan AI
                    </div>

                    <div className="px-4 pt-3">
                        <MarkdownText content={zone.summary_response_ai} />
                    </div>
                </div>
            )}

            {zone.iup_zona_site_description ? (
                <div className="max-w-full overflow-x-auto">
                    <div
                        className="reset-content prose prose-sm max-w-none [&_table]:border [&_td]:border [&_td]:p-2 [&_td]:text-xs [&_img]:max-w-full [&_img]:h-auto"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(zone.iup_zona_site_description, RICH_CONTENT_SANITIZE_CONFIG) }}
                    />
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">
                    Belum ada deskripsi survei untuk zona ini.
                </p>
            )}

            {zone.iup_zona_site_file && zone.iup_zona_site_file.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {zone.iup_zona_site_file.map((file, i) => (
                        <a
                            key={i}
                            href={file.file_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border border-blue-200 rounded-md font-medium"
                        >
                            <LuLink2 size={11} />
                            File {i + 1}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
