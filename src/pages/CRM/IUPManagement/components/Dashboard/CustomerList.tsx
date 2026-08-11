import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { IupCustomer, IupCustomerRkab } from "../types/iup.types";
import { formatNumber, getInitials } from "../utils/format";

interface CustomerListProps {
    customers: IupCustomer[];
}

function isRkabObject(rkab: IupCustomer["rkab"]): rkab is IupCustomerRkab {
    return typeof rkab === "object" && rkab !== null;
}

export function CustomerList({ customers }: CustomerListProps) {
    if (customers.length === 0) {
        return (
            <EmptyState message="Belum ada customer yang terhubung dengan IUP ini." />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customers.map((customer) => (
                <Card key={customer.iup_customer_id}>
                    <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {getInitials(customer.customer_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm truncate">{customer.customer_name}</span>
                                {customer.customer_code && (
                                    <Badge variant="outline" className="text-[10px]">
                                        {customer.customer_code}
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {customer.contact_person ?? "Kontak belum tercatat"}
                                {customer.customer_phone ? ` · ${customer.customer_phone.split(",")[0].trim()}` : ""}
                            </div>

                            <div className="flex items-center gap-4 mt-2.5 text-xs">
                                <span>
                                    <span className="text-muted-foreground">Fleet</span>{" "}
                                    <span className="font-semibold">{formatNumber(customer.number_of_fleet)}</span>
                                </span>
                                <span>
                                    <span className="text-muted-foreground">RKAB</span>{" "}
                                    {isRkabObject(customer.rkab) ? (
                                        <span className="font-semibold">
                                            {formatNumber(customer.rkab.current_production)} /{" "}
                                            {formatNumber(customer.rkab.target_production)} ({customer.rkab.year})
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground italic">Belum diisi</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"} className="capitalize flex-shrink-0">
                            {customer.status}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}
