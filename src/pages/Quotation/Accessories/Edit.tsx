import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdEdit, MdKeyboardArrowLeft, MdSave, MdAdd, MdDelete } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { useAccessoriesEdit } from "./hooks/useAccessoriesEdit";
import CustomAsyncSelect from "@/components/form/select/CustomAsyncSelect";
import CustomDataTable from "@/components/ui/table/CustomDataTable";

export default function EditAccessories() {
    const { 
        form, 
        errors, 
        loading, 
        fetching, 
        selectedIsland,
        islandOptions,
        islandInputValue,
        islandPagination,
        handleChange, 
        handleSubmit, 
        handleBack,
        handleIslandChange,
        handleAddIsland,
        handleUpdateQuantity,
        handleRemoveIsland,
        handleIslandInputChange,
        handleIslandMenuScrollToBottom
    } = useAccessoriesEdit();
    if (fetching) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <PageMeta 
                title="Edit Accessory | MSI" 
                description="Edit data accessory"
                image=""
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Accessory</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="lg:col-span-1 p-8 relative space-y-8">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 col-span-2">
                                    Basic Information
                                </h2>
                            
                                <div className="col-span-2">
                                    <Label htmlFor="accessory_part_number">
                                        MSI Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="accessory_part_number"
                                        name="accessory_part_number"
                                        type="text"
                                        value={form.accessory_part_number}
                                        onChange={(e) => handleChange('accessory_part_number', e.target.value)}
                                        error={!!errors.accessory_part_number}
                                        placeholder="Masukkan MSI Code"
                                    />
                                    {errors.accessory_part_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.accessory_part_number}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="accessory_part_name">
                                        Part Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="accessory_part_name"
                                        name="accessory_part_name"
                                        type="text"
                                        value={form.accessory_part_name}
                                        onChange={(e) => handleChange('accessory_part_name', e.target.value)}
                                        error={!!errors.accessory_part_name}
                                        placeholder="Masukkan part name"
                                    />
                                    {errors.accessory_part_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.accessory_part_name}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="accessory_brand">Brand</Label>
                                    <Input
                                        id="accessory_brand"
                                        name="accessory_brand"
                                        type="text"
                                        value={form.accessory_brand}
                                        onChange={(e) => handleChange('accessory_brand', e.target.value)}
                                        placeholder="Masukkan brand"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="accessory_specification">Specification</Label>
                                    <Input
                                        id="accessory_specification"
                                        name="accessory_specification"
                                        type="text"
                                        value={form.accessory_specification}
                                        onChange={(e) => handleChange('accessory_specification', e.target.value)}
                                        placeholder="Masukkan specification"
                                    />
                                </div>

                                {/* <div className="col-span-2">
                                    <Label htmlFor="accessory_region">Region</Label>
                                    <Input
                                        id="accessory_region"
                                        name="accessory_region"
                                        type="text"
                                        value={form.accessory_region}
                                        onChange={(e) => handleChange('accessory_region', e.target.value)}
                                        placeholder="Masukkan region"
                                    />
                                </div> */}

                                <div className="col-span-2">
                                    <Label htmlFor="accessory_remark">Remark</Label>
                                    <Input
                                        id="accessory_remark"
                                        name="accessory_remark"
                                        type="text"
                                        value={form.accessory_remark}
                                        onChange={(e) => handleChange('accessory_remark', e.target.value)}
                                        placeholder="Masukkan remark"
                                    />
                                </div>
                            </div>
                            
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 mx-3 hidden lg:block"></div>
                        </div>
                        
                        <div className="lg:col-span-2 p-8 lg:ps-0 relative">
                            <div className="space-y-8">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Island Assignment</h2>
                                
                                {/* Island selection info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 text-sm">ℹ</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium">Island Selection</p>
                                            <p className="mt-1">Select which island this accessory is available on. This will determine the availability and pricing for quotations.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Add Island Section */}
                                <div>
                                    <Label>Add Island</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <CustomAsyncSelect
                                                placeholder="Select Island to add..."
                                                value={selectedIsland}
                                                defaultOptions={islandOptions}
                                                loadOptions={handleIslandInputChange}
                                                onMenuScrollToBottom={handleIslandMenuScrollToBottom}
                                                isLoading={islandPagination.loading}
                                                noOptionsMessage={() => "No islands found"}
                                                loadingMessage={() => "Loading islands..."}
                                                isSearchable={true}
                                                inputValue={islandInputValue}
                                                onInputChange={(inputValue) => {
                                                    handleIslandInputChange(inputValue);
                                                }}
                                                onChange={(option: any) => {
                                                    handleIslandChange(option);
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleAddIsland}
                                            disabled={!selectedIsland}
                                            className="px-4 flex items-center gap-2 rounded-lg"
                                        >
                                            <MdAdd size={16} />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Islands Table */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-4">
                                        Selected Islands ({form.accessories_island_detail.length})
                                    </h3>
                                    
                                    {form.accessories_island_detail.length > 0 ? (
                                        <CustomDataTable
                                            columns={[
                                                {
                                                    name: 'Island Name',
                                                    selector: (row: any) => row.island_name,
                                                    cell: (row: any) => (
                                                        <span className="font-medium">{row.island_name}</span>
                                                    )
                                                },
                                                {
                                                    name: 'Quantity',
                                                    selector: (row: any) => row.accessories_island_detail_quantity,
                                                    cell: (row: any) => (
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={row.accessories_island_detail_quantity}
                                                            onChange={(e) => {
                                                                const quantity = parseInt(e.target.value) || 1;
                                                                handleUpdateQuantity(row.island_id, quantity);
                                                            }}
                                                            className="w-20"
                                                        />
                                                    )
                                                },
                                                {
                                                    name: 'Actions',
                                                    cell: (row: any) => (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveIsland(row.island_id)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                        >
                                                            <MdDelete size={16} />
                                                        </Button>
                                                    ),
                                                    ignoreRowClick: true,
                                                    allowOverflow: true,
                                                    button: true
                                                }
                                            ]}
                                            data={form.accessories_island_detail}
                                            loading={false}
                                            pagination={false}
                                        />
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <div className="text-gray-400 mb-2">
                                                <MdAdd size={48} className="mx-auto mb-2" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No islands added</p>
                                            <p className="text-gray-400 text-sm">Select an island from the dropdown above to add it</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={loading}
                                className="px-6 rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <MdSave className="mr-2" />
                                        Update Accessory
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}