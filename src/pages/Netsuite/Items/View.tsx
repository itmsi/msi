import { ReactNode, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MdLocationOn, MdOutlineSell, MdQrCode2 } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/button/Button';
import { useItemDetail } from './hooks/useItemDetail';
import ItemFields from './components/ItemFields';
import LocationTab from './components/tabs/LocationTab';
import SerialNumberTab from './components/tabs/SerialNumberTab';
import TierPriceTab from './components/tabs/TierPriceTab';

type TabType = 'location' | 'serial_number' | 'tier_price';

const TABS: { key: TabType; label: string; icon: ReactNode }[] = [
    { key: 'location', label: 'Location', icon: <MdLocationOn /> },
    { key: 'serial_number', label: 'Serial Number', icon: <MdQrCode2 /> },
    { key: 'tier_price', label: 'Tier Prices', icon: <MdOutlineSell /> },
];

const View = () => {
    const { internalId } = useParams<{ internalId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Query string list dibawa saat navigasi dari Manage agar filter tidak hilang
    const listSearch = (location.state as { from?: string } | null)?.from || '';
    const backToList = () => navigate(`/netsuite/items${listSearch}`);

    const { item, loading, error } = useItemDetail(internalId);
    const [activeTab, setActiveTab] = useState<TabType>('location');

    // Spinner hanya untuk load pertama, supaya refetch detail tidak me-remount tab
    if (loading && !item) {
        return (
            <div className="flex justify-center items-center h-64 bg-white shadow rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Item not found'}</h3>
                <Button onClick={backToList} variant="outline">Back to List</Button>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Item ${item.display_name} - Motor Sights International`}
                description="View Item details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title={`Item Details`}
                    backPath={backToList}
                    subtitle={`${item?.display_name || '-'}`}
                    actions={item.type ? (
                        <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                            {item.type}
                        </span>
                    ) : null}
                />

                <ItemFields item={item} />

                {/* Tab Navigation — style sama seperti tab di Fulfillment View.tsx */}
                <div>
                    <div className="border-b border-gray-200 overflow-auto">
                        <nav className="flex space-x-2 overflow-auto">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-25 font-medium text-md transition-colors flex items-center justify-center gap-2 ${activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm">
                        {activeTab === 'location' && <LocationTab netsuiteItemId={internalId} />}
                        {activeTab === 'serial_number' && <SerialNumberTab netsuiteItemId={internalId} />}
                        {activeTab === 'tier_price' && <TierPriceTab netsuiteItemId={internalId} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default View;
