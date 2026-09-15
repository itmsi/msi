import { useCallback, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantManage } from './language/applicantManage';
import { useApplicant } from './hooks/useApplicant';
import FilterSection, { ApplicantFilterField } from './components/FilterSection';
import ApplicantTable from './components/ApplicantTable';
import CreateApplicantModal from './components/CreateApplicantModal';

export default function Manage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { langField } = useLanguage(applicantManage);

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
        fetchApplicants,
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

            <div className="space-y-3">
                <PageHeaderManage
                    title={langField('applicantForms')}
                    subtitle={langField('applicantFormsDescription')}
                    actions={[
                        {
                            key: 'create',
                            element: (
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd size={20} />
                                        <span>{langField('inviteApplicant')}</span>
                                    </Button>
                                </PermissionGate>
                            ),
                        },
                    ]}
                />

                <div className="bg-white shadow rounded-lg px-6 py-4">
                    <FilterSection
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onSearchKeyPress={handleKeyPress}
                        onClearSearch={handleClearSearch}
                        searchPlaceholder={langField('searchPlaceholder')}
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

            <CreateApplicantModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchApplicants}
            />
        </>
    );
}
