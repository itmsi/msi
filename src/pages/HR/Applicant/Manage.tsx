import { useCallback } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { useApplicant } from './hooks/useApplicant';
import FilterSection, { ApplicantFilterField } from './components/FilterSection';
import ApplicantTable from './components/ApplicantTable';

export default function Manage() {
    const {
        applicants,
        filters,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        handleFilterChange,
        handlePageChange,
        handleRowsPerPageChange,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
        handleCopyLink,
    } = useApplicant();

    const handleFilterFieldChange = useCallback((field: ApplicantFilterField, value: string) => {
        if (field === 'sort_order') {
            handleFilterChange({ sort_order: value === 'asc' ? 'asc' : 'desc' });
            return;
        }

        handleFilterChange({ is_completed: value === 'true' || value === 'false' ? value : '' });
    }, [handleFilterChange]);

    return (
        <>
            <PageMeta
                title="Applicants - Motor Sights International"
                description="Monitor applicant forms - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                <PageHeaderManage
                    title="Formulir Pelamar"
                    subtitle="Pantau formulir pelamar yang masuk sebelum membuka detailnya"
                />

                <div className="bg-white shadow rounded-lg px-6 py-4 mt-3">
                    <FilterSection
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onSearchKeyPress={handleKeyPress}
                        onClearSearch={handleClearSearch}
                        searchPlaceholder="Cari nama, email, posisi, atau kota... (tekan Enter)"
                        filters={filters}
                        onFilterChange={handleFilterFieldChange}
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

                        <ApplicantTable
                            data={applicants}
                            loading={loading}
                            pagination={pagination}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowsPerPageChange}
                            onCopyLink={handleCopyLink}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
