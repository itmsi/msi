import { MdAdd, MdClear, MdSearch } from 'react-icons/md';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { useIupManagement } from './hooks/useIUPManagement';
import { IupItem } from './types/iupmanagement';
import { FaRegBuilding, FaUsers } from 'react-icons/fa';
import { BsBuildingCheck } from "react-icons/bs";
import Badge from '@/components/ui/badge/Badge';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useNavigate } from 'react-router';
import {  formatDateTime } from '@/helpers/generalHelper';
import { useEffect, useMemo, useState } from 'react';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';
import { SegmentSelectOption } from './components/IupInformtionsFormFields';

export default function ManageIUPManagement() {
    
    const navigate = useNavigate();
    const {
        // State
        iup,
        loading,
        error,
        pagination,
        summary,
        searchValue,
        sortOrder,
        sortModify,
        setSearchValue,
        statusFilter,
        segmentationFilter,
        // setStatusFilter,
        // fetchIup,

        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        // handleFilters,
        
        // Filter actions
        handleFilterChange,
        // handleSearch,
        
        // Search functions
        // executeSearch,
        handleKeyPress,
        handleClearSearch,
    } = useIupManagement();

    const {
        segementationOptions,
        inputValue: segmentationInputValue,
        handleInputChange: handleSegmentationInputChange,
        pagination: segmentationPagination,
        handleMenuScrollToBottom: handleSegmentationMenuScrollToBottom,
        initializeOptions: initializeSegementationOptions
    } = useSegementationSelect();

    useEffect(() => {
        initializeSegementationOptions();
    }, [initializeSegementationOptions]);

    // Segmentation states
    const [selectedSegment, setSelectedSegment] = useState<SegmentSelectOption | null>(null);
    
    // Sync selectedSegment with segmentationFilter
    useEffect(() => {
        if (segmentationFilter && segmentationFilter.trim() !== '') {
            const matchingSegment = segementationOptions.find(option => option.value === segmentationFilter);
            if (matchingSegment && selectedSegment?.value !== segmentationFilter) {
                setSelectedSegment(matchingSegment);
            }
        } else if (!segmentationFilter && selectedSegment !== null) {
            setSelectedSegment(null);
        }
    }, [segmentationFilter, segementationOptions, selectedSegment]);
    // Definisi kolom untuk DataTable
    const iupColumns: TableColumn<IupItem>[] = [
        {
            name: 'IUP Name',
            selector: row => row.iup_name,
            wrap: true,
            width: '300px',
        },
        {
            name: 'Island',
            selector: row => row.island_name,
            wrap: true,
            width: '150px',
        },
        {
            name: 'Group',
            selector: row => row.group_name,
            wrap: true,
            center: true,
        },
        {
            name: 'Area',
            selector: row => row.area_name,
            center: true,
            wrap: true,
        },
        {
            name: 'IUP Zone',
            selector: row => row.iup_zone_name,
            width: '200px',
            wrap: true,
        },
        {
            name: 'Segmentation',
            selector: row => row.segmentation_name,
            width: '150px',
            wrap: true,
        },
        {
            name: 'Contractors',
            selector: row => row.contractor_count,
            center: true,
            cell: (row) => (
                <Badge
                    color='info'
                >
                    {row.contractor_count} Company
                </Badge>
            ),
            width: '200px'
        },
        {
            name: 'Status',
            selector: row => row.iup_status,
            cell: (row) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    row.iup_status === 'aktif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {row.iup_status === 'aktif' ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '120px',
            wrap: true,
        },
        {
            name: 'Updated By',
            selector: row => row.updated_by_name,
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row?.updated_by_name || '-'}
                    </div>
                    <div className="block text-sm text-gray-500">{`${formatDateTime(row.updated_at)}`}</div>
                </div>
            ),
            width: '200px'
        },
    ];

    const STATUS_OPTIONS = [
        { value: '', label: 'All Status' },
        { value: 'aktif', label: 'Active' },
        { value: 'non aktif', label: 'Inactive' }
    ];
    
    const MODIFY_OPTIONS = [
        { value: '', label: 'All Modify' },
        { value: 'updated_at', label: 'Updated' },
        { value: 'created_at', label: 'Created' }
    ];
    
    const SearchAndFilters = useMemo(() => {
        
        return (
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-8 gap-6">
            <div className="relative md:col-span-3">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                    type="text"
                    placeholder="Search IUP Name... (Press Enter to search)"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                />
                {searchValue && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        type="button"
                    >
                        <MdClear className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            <CustomAsyncSelect
                placeholder="Select Segmentation..."
                value={selectedSegment}
                defaultOptions={segementationOptions}
                loadOptions={handleSegmentationInputChange}
                onMenuScrollToBottom={() => {
                    handleSegmentationMenuScrollToBottom();
                }}
                isLoading={segmentationPagination.loading}
                noOptionsMessage={() => "No segments found"}
                loadingMessage={() => segementationOptions.length > 0 ? "Loading segments..." : ""}
                isSearchable={true}
                isClearable={true}
                inputValue={segmentationInputValue}
                className="w-full md:col-span-2"
                onInputChange={(inputValue) => {
                    handleSegmentationInputChange(inputValue);
                }}
                onChange={(option: any) => {
                    setSelectedSegment(option);
                    handleFilterChange('segmentation', option?.value || '');
                }}
            />
            
            <CustomSelect
                value={STATUS_OPTIONS.find(option => option.value === statusFilter) || null}
                onChange={(option) => handleFilterChange('status', option?.value || '')}
                options={STATUS_OPTIONS}
                placeholder="Filter by Status"
                className="w-full"
                isClearable={false}
                isSearchable={false}
            />
            
            <CustomSelect
                value={MODIFY_OPTIONS.find(option => option.value === sortModify) || null}
                onChange={(option) => handleFilterChange('sort_by', option?.value || '')}
                options={MODIFY_OPTIONS}
                placeholder="Sort by Field"
                className="w-full"
                isClearable={false}
                isSearchable={false}
            />
            
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
        </div>
    );
    }, [searchValue, statusFilter, segmentationFilter, sortOrder, sortModify, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, segementationOptions]);
    
    return (
        <>
            <PageMeta 
                title="Manage IUP Management - Motor Sights International" 
                description="Manage IUP Management - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    IUP Management
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage IUP (Izin Usaha Pertambangan) and their configurations
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/crm/iup-management/create')}
                                        className="flex items-center"
                                    >
                                        <MdAdd className="mr-2" />
                                        Add IUP
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaRegBuilding className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-600">Total IUPs</p>
                                    <p className="text-2xl font-bold text-blue-900">{summary.total_iup.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <BsBuildingCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-600">Active IUPs</p>
                                    <p className="text-2xl font-bold text-green-900">{summary.total_iup_aktif.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">                        
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaUsers className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-purple-600">Contractors</p>
                                    <p className="text-2xl font-bold text-purple-900">{summary.total_contractor.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">                        
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <FaUsers className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-yellow-600">IUPs with Contractors</p>
                                    <p className="text-2xl font-bold text-yellow-900">{summary.total_iup_have_contractor.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">                        
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FaUsers className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-orange-600">IUPs no Contractors</p>
                                    <p className="text-2xl font-bold text-orange-900">{summary.total_iup_no_contractor.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white shadow rounded-lg">
                    {SearchAndFilters}
                </div>
                
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <CustomDataTable
                            columns={iupColumns}
                            data={iup}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination?.total || 0}
                            paginationPerPage={pagination?.limit || 10}
                            paginationDefaultPage={pagination?.page || 1}
                            paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowsPerPageChange}
                            fixedHeader={true}
                            fixedHeaderScrollHeight="625px"
                            responsive
                            highlightOnHover
                            striped={false}
                            noDataComponent={
                            <div className="text-center py-8">
                                <FaRegBuilding className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No IUP data found</p>
                                <p className="text-sm text-gray-400">
                                    {searchValue ? 'Try adjusting your search' : 'Start by adding your first template'}
                                </p>
                            </div>
                            }
                            persistTableHead
                            borderRadius="8px"
                            onRowClicked={(row) => navigate(`/crm/iup-management/edit/${row.iup_id}`)}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {/* <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete IUP"
                message={`Are you sure you want to delete "${deleteItemData?.iup_name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => {
                    // TODO: Implement delete functionality
                    console.log('Delete IUP:', deleteItemData);
                    closeDeleteConfirmation();
                }}
                onCancel={closeDeleteConfirmation}
                variant="danger"
            /> */}

        </>
    );
};