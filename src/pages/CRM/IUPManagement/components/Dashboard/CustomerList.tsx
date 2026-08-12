import Avatar from "@/components/common/Avatar";
import Badge from "@/components/ui/badge/Badge";

import type { IupCustomer, IupCustomerRkab } from "../../types/iupDashboard";
import { formatNumber } from "./dashboardUtils";

interface CustomerListProps {
    customers: IupCustomer[];
}

function isRkabObject(rkab: IupCustomer["rkab"]): rkab is IupCustomerRkab {
    return typeof rkab === "object" && rkab !== null;
}

export function CustomerList({ customers }: CustomerListProps) {
    if (customers.length === 0) {
        return <EmptyState message="Belum ada customer yang terhubung dengan IUP ini." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customers.map((customer) => (
                <div
                    key={customer.iup_customer_id}
                    className="bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-start gap-3"
                >
                    <Avatar nama={customer.customer_name} size={36} fontSize={13} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-primary-bold text-sm truncate">{customer.customer_name}</span>
                            {customer.customer_code && (
                                <Badge variant="outline" color="light" size="sm">{customer.customer_code}</Badge>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {customer.contact_person ?? "Kontak belum tercatat"}
                            {customer.customer_phone ? ` · ${customer.customer_phone.split(",")[0].trim()}` : ""}
                        </div>

                        <div className="flex items-center gap-4 mt-2.5 text-xs">
                            <span>
                                <span className="text-gray-500">Fleet</span>{" "}
                                <span className="font-primary-bold">{formatNumber(customer.number_of_fleet)}</span>
                            </span>
                            <span>
                                <span className="text-gray-500">RKAB</span>{" "}
                                {isRkabObject(customer.rkab) ? (
                                    <span className="font-primary-bold">
                                        {formatNumber(customer.rkab.current_production)} / {formatNumber(customer.rkab.target_production)} ({customer.rkab.year})
                                    </span>
                                ) : (
                                    <span className="text-gray-500 italic">Belum diisi</span>
                                )}
                            </span>
                        </div>
                    </div>
                    <span className="shrink-0">
                        <Badge variant="light" color={customer.status === "active" ? "success" : "light"} size="sm">
                            {customer.status}
                        </Badge>
                    </span>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="border border-dashed rounded-lg p-8 text-center text-sm text-gray-500">
            {message}
        </div>
    );
}
