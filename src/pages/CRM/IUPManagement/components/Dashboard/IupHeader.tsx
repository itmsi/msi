import { MapPin, Download, MoreHorizontal } from "lucide-react";

// NOTE: swap these for the project's actual reusable UI kit
// (e.g. shadcn/ui) — kept as named imports so this file only needs
// its import paths updated, not its JSX, once wired to the real kit.
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { IupDetail } from "../types/iup.types";

interface IupHeaderProps {
    iup: IupDetail;
    onExport: () => void;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
    aktif: "default",
    nonaktif: "destructive",
};

export function IupHeader({ iup, onExport }: IupHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-6 py-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-extrabold tracking-tight">{iup.iup_name}</h1>
                    <Badge variant="outline">{iup.iup_code}</Badge>
                    <Badge variant={statusVariant[iup.iup_status] ?? "secondary"} className="capitalize">
                        {iup.iup_status}
                    </Badge>
                    <Badge variant="secondary">{iup.permit_type}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                        {iup.mine_location}, {iup.regency_name}, {iup.province_name}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-1.5" />
                    Export
                </Button>
                <Button variant="outline" size="icon" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
