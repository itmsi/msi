
interface ZonaSiteTabsProps {
    zonaSites: IupZonaSite[];
}

export function ZonaSiteTabs({ zonaSites }: ZonaSiteTabsProps) {
    const [activeId, setActiveId] = useState(zonaSites[0]?.iup_zona_site_id);

    if (zonaSites.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                Belum ada zona site yang disurvei.
            </div>
        );
    }

    const active = zonaSites.find((z) => z.iup_zona_site_id === activeId) ?? zonaSites[0];

    return (
        <div>
            <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-muted w-fit overflow-x-auto max-w-full">
                {zonaSites.map((zone) => (
                    <button
                        key={zone.iup_zona_site_id}
                        type="button"
                        onClick={() => setActiveId(zone.iup_zona_site_id)}
                        className={
                            "text-xs font-semibold px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors " +
                            (zone.iup_zona_site_id === active.iup_zona_site_id
                                ? "bg-emerald-950 text-white"
                                : "text-muted-foreground hover:text-foreground")
                        }
                    >
                        {zone.iup_zona_site_name}
                        {!zone.iup_zona_site_description && !zone.iup_zona_site_date_last_survey && (
                            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 align-middle" />
                        )}
                    </button>
                ))}
            </div>

            <div className="border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">{active.iup_zona_site_name}</h3>
                    <Badge variant="outline">
                        Survei terakhir: {formatDate(active.iup_zona_site_date_last_survey)}
                    </Badge>
                </div>

                {active.summary_response_ai && (
                    <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-1.5 mb-1.5 text-emerald-800 text-xs font-bold">
                            <Sparkles className="h-3.5 w-3.5" />
                            Ringkasan AI
                        </div>
                        <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-line">
                            {active.summary_response_ai}
                        </p>
                    </div>
                )}

                {active.iup_zona_site_description ? (
                    <div
                        className="prose prose-sm max-w-none [&_table]:border [&_td]:border [&_td]:p-2 [&_td]:text-xs"
                        // eslint-disable-next-line react/no-danger -- product decision: render survey HTML as-is
                        dangerouslySetInnerHTML={{ __html: active.iup_zona_site_description }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        Belum ada deskripsi survei untuk zona ini.
                    </p>
                )}
            </div>
        </div>
    );
}
