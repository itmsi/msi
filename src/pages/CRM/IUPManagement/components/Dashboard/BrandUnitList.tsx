

interface BrandUnitListProps {
    brandUnits: IupBrandUnit[];
}

export function BrandUnitList({ brandUnits }: BrandUnitListProps) {
    const active = brandUnits.filter((b) => !b.is_delete);

    if (active.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                Belum ada data unit/brand armada.
            </div>
        );
    }

    const maxQty = Math.max(...active.map((b) => toNumber(b.iup_brand_unit_qty)));
    const totalQty = active.reduce((sum, b) => sum + toNumber(b.iup_brand_unit_qty), 0);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Brand Unit Breakdown
                    </span>
                    <span className="text-xs text-muted-foreground">Total {totalQty} unit</span>
                </div>
                <div className="space-y-3">
                    {active
                        .slice()
                        .sort((a, b) => toNumber(b.iup_brand_unit_qty) - toNumber(a.iup_brand_unit_qty))
                        .map((brand) => {
                            const qty = toNumber(brand.iup_brand_unit_qty);
                            const widthPct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
                            return (
                                <div key={brand.iup_brand_unit_id}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold">{brand.iup_brand_unit_name}</span>
                                        <span className="text-muted-foreground">{qty} unit</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-600"
                                            style={{ width: `${widthPct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </CardContent>
        </Card>
    );
}
