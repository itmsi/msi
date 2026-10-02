import { useCallback } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { useActivity } from './hooks/useActivity';
import FilterSection, { ActivityFilterField } from './components/FilterSection';
import ActivityTable from './components/ActivityTable';

const TYPE_DATA_OPTIONS = [
    { value: 'apps', label: 'APPS' },
    { value: 'netsuite', label: 'netsuite' },
];

const CLIENT_OPTIONS = [
    { value: '', label: 'All Clients' },
    { value: 'ITI', label: 'ITI' },
    { value: 'MSI', label: 'MSI' },
];

export default function Manage() {
    const {
        activities,
        filters,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        handleFilterChange,
        handleDateRangeChange,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        handleClearSearch,
        handleClearFilters,
    } = useActivity();

    const handleFilterFieldChange = useCallback((field: ActivityFilterField, value: string) => {
        if (field === 'sort_order') {
            handleFilterChange({ sort_order: value === 'asc' ? 'asc' : 'desc' });
            return;
        }

        handleFilterChange({ [field]: value });
    }, [handleFilterChange]);

    return (
        <>
            <PageMeta
                title="Activity Logs | Netsuite"
                description="Netsuite integration activity logs - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-3">
                <PageHeaderManage
                    title="Activity Logs"
                    subtitle="Monitor integration requests and responses between systems"
                />

                <div className="bg-white shadow rounded-lg px-6 py-4">
                    <FilterSection
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onSearch={handleSearch}
                        onClearSearch={handleClearSearch}
                        searchPlaceholder="Search endpoint or payload..."
                        filters={filters}
                        typeDataOptions={TYPE_DATA_OPTIONS}
                        clientOptions={CLIENT_OPTIONS}
                        onFilterChange={handleFilterFieldChange}
                        onDateRangeChange={handleDateRangeChange}
                        onClearFilters={handleClearFilters}
                        defaultOpen={activeFilterCount > 0}
                    />
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <ActivityTable
                            data={activities}
                            loading={loading}
                            pagination={pagination}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowsPerPageChange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
