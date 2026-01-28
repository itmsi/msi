import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdClear, MdExpandLess, MdExpandMore, MdFilterListAlt, MdSearch } from 'react-icons/md';
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
import CustomSelect from '@/components/form/select/CustomSelect';
import FilterSection from './components/FilterSection';

const Contractors: React.FC = () => {
    const navigate = useNavigate();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const {
        // State
        contractors,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        sortOrder,
        setSortOrder,
        statusFilter,
        setStatusFilter,
        segmentationFilter,
        setSegmentationFilter,
        // mineTypeFilter,
        setMineTypeFilter,
        
        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        refetch,
        
        // Search functions
        handleKeyPress,
        handleClearSearch
    } = useContractors();

    const { showConfirmation, modalProps } = useConfirmation();

    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    const handleClearFilters = () => {
        setSortOrder('');
        setStatusFilter('');
        setSegmentationFilter('');
        setMineTypeFilter('');
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

    const SearchAndFilters = useMemo(() => { 
        return (
        <>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search by customer name, contractor... (Press Enter to search)"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchValue && (
                            <button
                                onClick={() => {
                                    setSearchValue('');
                                    handleClearSearch();
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <CustomSelect
                    id="sort_order"
                    name="sort_order"
                    value={sortOrder ? {
                        value: sortOrder,
                        label: sortOrder === 'asc' ? 'Ascending' : 'Descending'
                    } : null}
                    onChange={(selectedOption) =>
                        handleFilterChange('sort_order', selectedOption?.value || '')
                    }
                    options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' }
                    ]}
                    placeholder="Order by"
                    isClearable={false}
                    isSearchable={false}
                    className="w-full"
                />
            </div>
            
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleToggleFilter}
                    className="h-[42px] px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300"
                    size="sm"
                >
                    <MdFilterListAlt className="w-4 h-4 mr-2" />
                    Filter
                    {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                </Button>
            </div>
        </div>
        
        {showAdvancedFilters && (
            <FilterSection
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />
        )}
        </>
    
    )}, [searchValue, statusFilter, segmentationFilter, sortOrder, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, showAdvancedFilters, handleClearFilters]);
    
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

                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
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