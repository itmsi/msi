import { useCallback } from 'react';
import { MdOutlineSync } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import Button from '@/components/ui/button/Button';
import { getProfile, formatDateTime } from '@/helpers/generalHelper';
import { useFulfillment } from './hooks/useFulfillment';
import FilterSection, { FulfillmentFilterField } from './components/FilterSection';
import FulfillmentTable from './components/FulfillmentTable';

export default function Manage() {
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const {
        fulfillment,
        filters,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
        isSyncing,
        handleSync,
        handleSyncById,
    } = useFulfillment(profileSSOId);

    // Jembatan ke handleFilterChange milik hook yang menerima objek
    const handleFilterFieldChange = useCallback((field: FulfillmentFilterField, value: string) => {
        if (field === 'sort_order') {
            handleFilterChange({ sort_order: (value as 'asc' | 'desc') || 'desc' });
            return;
        }
        handleFilterChange({ [field]: value });
    }, [handleFilterChange]);

    return (
        <>
            <PageMeta
                title="Item Fulfillments - Motor Sights International"
                description="Manage Item Fulfillments - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <PageHeaderManage
                    title="Item Fulfillments"
                    subtitle="Manage Item Fulfillments"
                    actions={[
                        {
                            key: 'sync',
                            element: (
                                <Button
                                    onClick={() => handleSync()}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                    variant='outline'
                                >
                                    <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                    <div>
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                    </div>
                                </Button>
                            )
                        }
                    ]}
                />

                {syncInfo && (
                    <span className='block text-xs text-green-600 pe-6 text-end mb-0'>
                        Last Sync: {formatDateTime(syncInfo.created_at)} by {syncInfo.created_by_name}
                    </span>
                )}

                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4 mt-3">
                    <FilterSection
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onSearchKeyPress={handleKeyPress}
                        onClearSearch={handleClearSearch}
                        searchPlaceholder="Search fulfillment... (Press Enter)"
                        filters={filters}
                        onFilterChange={handleFilterFieldChange}
                        onClearFilters={handleClearFilters}
                        defaultOpen={activeFilterCount > 0}
                    />
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <FulfillmentTable
                            data={fulfillment}
                            loading={loading}
                            pagination={pagination}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowsPerPageChange}
                            onSyncById={handleSyncById}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
