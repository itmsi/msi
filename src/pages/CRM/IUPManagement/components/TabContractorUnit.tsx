import React, { useState } from 'react';
import ZoneArea from '@/pages/CRM/IUPManagement/components/zonearea/ZoneArea';
import { GiMineTruck } from 'react-icons/gi';
import { MdAdd } from 'react-icons/md';
import { RkabSection, UnitsSection } from '../../Contractors/components';
import Button from '@/components/ui/button/Button';
import UnitCardCustom from './UnitCardCustom';



const TabContractorUnit: React.FC = ({formData}) => {
        const [validationErrors, setValidationErrors] = useState<any>({});
    const handleChange = (_updatedZones: any[]) => {
        // zones tersimpan di state parent jika diperlukan
    };
    const handleAddRkab = () => {}
    const handleRemoveRkab = () => {}
    const handleRkabChange = () => {}
    const handleAddUnit = () => {}
    const handleRemoveUnit = () => {}
    const handleUnitChange = () => {}
    const brandPagination = {}
    const brandInputValues = {}
    const handleUnitBrandInputChange = () => {}
    const handleBrandMenuScrollToBottom = () => {}
    const handleBrandSelect = () => {}

    return (<>
    {/* RKAB Management */}
        <RkabSection
            rkabEntries={formData?.iup_customers?.properties || []}
            errors={validationErrors}
            onAddRkab={handleAddRkab}
            onRemoveRkab={handleRemoveRkab}
            onRkabChange={handleRkabChange}
        />

        {/* Units Management */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Units</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddUnit}
                    className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Add Unit
                </Button>
            </div>

            {formData?.units?.length === 0 || !formData?.units ? (
                <div className="text-gray-500 text-center py-8">
                    No units added yet. Click "Add Unit" to get started.
                </div>
            ) : (
                <div className="space-y-4">
                    {formData?.units.map((unit, index) => (
                        <UnitCardCustom
                            key={index}
                            unit={unit}
                            index={index}
                            errors={validationErrors}
                            onChange={(field, value) => handleUnitChange(index, field, value)}
                            onRemove={() => handleRemoveUnit(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    </>
        
    );
}
export default TabContractorUnit;