import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdEdit, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { useAccessoriesEdit } from "./hooks/useAccessoriesEdit";

export default function EditAccessories() {
    const { form, errors, loading, fetching, handleChange, handleSubmit, handleBack } = useAccessoriesEdit();
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
                        <div className="md:col-span-3 p-8 relative space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    Basic Information
                                </h2>
                            
                                <div>
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

                                <div>
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

                                <div>
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

                                <div>
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

                                <div>
                                    <Label htmlFor="accessory_region">Region</Label>
                                    <Input
                                        id="accessory_region"
                                        name="accessory_region"
                                        type="text"
                                        value={form.accessory_region}
                                        onChange={(e) => handleChange('accessory_region', e.target.value)}
                                        placeholder="Masukkan region"
                                    />
                                </div>

                                <div>
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
                            
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
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