import type { ReactNode } from 'react';
import { formatTanggal } from '@/helpers/generalHelper';
import { InventoryAdjustmentItem } from '../types/inventoryAdjustment';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import Checkbox from '@/components/form/input/Checkbox';

interface InventoryAdjustmentFieldsProps {
    inventoryAdjustment: InventoryAdjustmentItem;
}

const FieldRow = ({ label, value }: { label: string; value?: ReactNode }) => (
    <div>
        <p className="mb-1.5 block text-sm text-gray-700">{label}</p>
        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{value ?? '-'}</p>
    </div>
);

const CheckboxRow = ({ label, checked }: { label: string; checked?: boolean | null }) => (
    <div className="flex justify-start items-center space-x-2">
        <div className="mt-1 min-h-10.5 flex items-center">
            <Checkbox checked={!!checked} disabled onChange={() => {}} />
        </div>
        <p className="block text-sm text-gray-700">{label}</p>
    </div>
);

// Pengelompokan & label field disamain persis dengan record Inventory Adjustment
// di UI NetSuite: Primary Information / Approval Information / Classification.
export default function InventoryAdjustmentFields({ inventoryAdjustment }: InventoryAdjustmentFieldsProps) {
    return (
        <div className="space-y-6 gap-2">
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <FieldRow label="Reference #" value={inventoryAdjustment.tranid} />
                        <FieldRow label="Customer" value={inventoryAdjustment.customer_display} />
                        <FieldRow label="Adjustment Account" value={inventoryAdjustment.account_display} />
                        <FieldRow label="Estimated Total Value" value={inventoryAdjustment.estimated_total_value} />
                    </div>
                    <div className="space-y-4">
                        <FieldRow label="Date" value={inventoryAdjustment.trandate ? formatTanggal(inventoryAdjustment.trandate) : undefined} />
                        <FieldRow label="Posting Period" value={inventoryAdjustment.postingperiod_display} />
                        <FieldRow label="Memo" value={inventoryAdjustment.memo} />
                    </div>
                    <div className="space-y-4">
                        <FieldRow label="Related Document Number" value={inventoryAdjustment.custbody_me_purchase_order_number} />
                        <FieldRow label="MSI - Related Cycle Count Number" value={inventoryAdjustment.custbody_msi_cycle_count_cumber} />
                        <CheckboxRow label="Opening Balance" checked={inventoryAdjustment.custbody_me_opening_balance} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Approval Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <FieldRow label="Created By" value={inventoryAdjustment.custbody_me_wf_created_by_display} />
                        <div>
                            <p className="mb-1.5 block text-sm text-gray-700">Approval Status</p>
                            {inventoryAdjustment.custbody_me_approval_status ? (
                                <StatusTypeBadge
                                    type={Number(inventoryAdjustment.custbody_me_approval_status) as 1 | 2 | 3}
                                    label={inventoryAdjustment.custbody_me_approval_status_display || undefined}
                                />
                            ) : (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">-</p>
                            )}
                        </div>
                        <FieldRow label="Next Approver" value={inventoryAdjustment.nextapprover} />
                    </div>
                    <div />
                    <div className="space-y-4 ">
                        <FieldRow label="Delegate Approver" value={inventoryAdjustment.custbody_me_delegate_approver_display} />
                        <CheckboxRow label="In Delegation" checked={inventoryAdjustment.custbody_me_wf_in_delegation} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <FieldRow label="Subsidiary" value={inventoryAdjustment.subsidiary_display} />
                        <FieldRow label="Department" value={inventoryAdjustment.department_display} />
                    </div>
                    <div className="space-y-4">
                        <FieldRow label="Class" value={inventoryAdjustment.class_display} />
                    </div>
                    <div className="space-y-4">
                        <FieldRow label="Adjustment Location" value={inventoryAdjustment.adj_location_display} />
                    </div>
                </div>
            </div>
        </div>
    );
}
