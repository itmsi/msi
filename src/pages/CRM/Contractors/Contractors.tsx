import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { useContractors } from './hooks/useContractors';
import { Contractor } from './types/contractor';
import ContractorTable from './components/ContractorTable';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Input from '@/components/form/input/InputField';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useConfirmation } from '@/hooks/useConfirmation';
import { ContractorServices } from './services/contractorServices';

const Contractors: React.FC = () => {
    const navigate = useNavigate();
    const {
        // State
        contractors,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        // filters,
        // setFilters,
        
        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        // handleFilters,
        refetch,
        
        // Search functions
        handleKeyPress,
        handleClearSearch
    } = useContractors();

    const { showConfirmation, modalProps } = useConfirmation();


    const handleClearSearchLocal = () => {
        setSearchValue('');
        handleClearSearch();
    };
    const handleDelete = async (contractor: Contractor) => {
        const typeLabel = contractor.customer_name;
                
        const confirmed = await showConfirmation({
            title: `Delete ${typeLabel}`,
            message: `Are you sure you want to delete "${contractor.customer_name}"?\n\nType: ${typeLabel}\nCode: ${contractor.customer_name}\n\nThis action cannot be undone and will also delete all child territories.`,
            confirmText: `Delete ${typeLabel}`,
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await ContractorServices.deleteContractor(contractor.iup_customer_id);
            refetch();
        }
    };
    return (
        <>
            <PageMeta 
                title="Contractors - CRM" 
                description="Manage mining contractors and fleet"
                image="/motor-sights-international.png"
            />
            <div className="space-y-6">
                
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Contractors Management
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage mining contractors and their fleet information
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/crm/contractors/create')}
                                        className="flex items-center"
                                    >
                                        <MdAdd className="mr-2" />
                                        Add Contractor
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <Input 
                                type="text"
                                placeholder="Search by contractor name or customer code... (Press Enter to search)"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            {searchValue && (
                                <button
                                    onClick={handleClearSearchLocal}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-error-50 text-error-600 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <ContractorTable
                            contractors={contractors}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
                
                <ConfirmationModal {...modalProps} />
            </div>
        </>
    );
};

export default Contractors;