import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MdClear, MdExpandLess, MdExpandMore, MdFilterListAlt, MdSearch } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { useItems } from './hooks/useItems';
import ItemsTable from './components/ItemsTable';
import FilterSection from './components/FilterSection';

const Manage = () => {
    const location = useLocation();

    const {
        items,
        filters,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleItemTypeChange,
        handleKeyPress,
        handleClearSearch,
    } = useItems();

    const handlePageChangeAman = useCallback((halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        if (halamanBaru === halamanSaatIni) return;
        handlePageChange(halamanBaru);
    }, [pagination?.page, handlePageChange]);

    const handleRowsPerPageAman = useCallback((limitBaru: number, halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        const limitSaatIni = pagination?.limit || 10;
        if (limitBaru === limitSaatIni && halamanBaru === halamanSaatIni) return;
        handleRowsPerPageChange(limitBaru, halamanBaru);
    }, [pagination?.page, pagination?.limit, handleRowsPerPageChange]);

    const params = new URLSearchParams(location.search);
    const filterKeys = ['item_type'];

    // Mengecek apakah minimal salah satu key di atas ada di URL
    const hasActiveFilter = filterKeys.some(key => params.has(key) && params.get(key) !== '');

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(hasActiveFilter ? true : false);
    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    const handleClearFilters = () => {
        handleItemTypeChange('');
    };

    const SearchAndFilters = useMemo(() => {
        return (<>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                id='search'
                                type="text"
                                placeholder="Search Items... (Press Enter)"
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
                    </div>
                </div>
                <div className="flex items-center">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={filters.sort_order ? {
                            value: filters.sort_order,
                            label: filters.sort_order === 'asc' ? 'Ascending' : 'Descending'
                        } : null}
                        onChange={(selectedOption) =>
                            handleFilterChange({ sort_order: (selectedOption?.value as 'asc' | 'desc') || 'desc' })
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
                        className="h-10.5 px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 relative"
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
                    filterItemType={filters.item_type[0] || ''}
                    onFilterChange={(field, value) => {
                        if (field === 'item_type') handleItemTypeChange(value);
                    }}
                    onClearFilters={handleClearFilters}
                />
            )}
        </>);
    }, [searchValue, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, handleItemTypeChange, showAdvancedFilters, handleToggleFilter, filters]);

    return (
        <>
            <PageMeta
                title="Netsuite Items - Motor Sights International"
                description="Manage NetSuite Items - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg mb-3">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Netsuite Items
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    List of NetSuite Inventory and Non-inventory Items
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4 mt-3">
                    {SearchAndFilters}
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <ItemsTable
                            items={items}
                            loading={loading}
                            pagination={pagination}
                            onChangePage={handlePageChangeAman}
                            onChangeRowsPerPage={handleRowsPerPageAman}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Manage;
