import { ItemDetail } from '../types/items';

interface ItemFieldsProps {
    item: ItemDetail;
}

export default function ItemFields({ item }: ItemFieldsProps) {
    return (
        <div className="space-y-6 gap-2">
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Item ID</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{item.item_id || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Display Name</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{item.display_name || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
