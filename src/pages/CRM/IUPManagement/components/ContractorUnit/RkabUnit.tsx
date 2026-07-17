import React from "react";
import { useIupRkabUnit } from "../../hooks/useIupRkabUnit";
import BrandUnitSection from "./UnitSection";
import RkabSection from "./RkabSection";
import ContractorSection from "./ContractorSection";
import FormActions from "@/components/form/FormActions";
import { LoadingSpinner } from "@/components/common/Loading";

const RkabUnit: React.FC = () => {
    const {
        brandUnits,
        rkabs,
        brandUnitErrors,
        rkabErrors,
        loading,
        submitting,
        addBrandUnit,
        removeBrandUnit,
        updateBrandUnit,
        addRkab,
        removeRkab,
        updateRkab,
        handleSubmit,

        contractors,
        contractorErrors,
        addContractor,
        removeContractor,
        updateContractor,
    } = useIupRkabUnit();

    if (loading) {
        return(
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}

            {/* ===== Brand Unit Section ===== */}
            <BrandUnitSection
                brandUnits={brandUnits}
                brandUnitErrors={brandUnitErrors}
                addBrandUnit={addBrandUnit}
                removeBrandUnit={removeBrandUnit}
                updateBrandUnit={updateBrandUnit}
            />

            {/* ===== RKAB Section ===== */}
            <RkabSection
                rkabs={rkabs}
                rkabErrors={rkabErrors}
                addRkab={addRkab}
                removeRkab={removeRkab}
                updateRkab={updateRkab}
            />

            {/* ===== Contractor Section ===== */}
            <ContractorSection
                contractors={contractors}
                contractorErrors={contractorErrors}
                addContractor={addContractor}
                removeContractor={removeContractor}
                updateContractor={updateContractor}
            />

            
            <FormActions
                submitText={submitting ? 'Updating...' : 'Save'}
                cancelRoute="/crm/iup-management"
                onSubmit={handleSubmit}
                isSubmitting={submitting}
            />
        </div>
    );
}
export default RkabUnit;