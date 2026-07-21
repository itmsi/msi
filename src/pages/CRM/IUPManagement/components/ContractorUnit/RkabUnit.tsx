import React from "react";
import BrandUnitSection from "./UnitSection";
import RkabSection from "./RKAB_SINGLE";

import { CustomerInfo } from '../../types/iupmanagement';
import CustomerInformation from "../CustomerInformation";
// import RkabSection from "./RkabSection";
interface RkabUnitProps {
    customers: CustomerInfo[];
}

const RkabUnit: React.FC<RkabUnitProps> = ({ customers }) => {


    return (
        <div className="space-y-8">

            {/* ===== Contractor Section ===== */}
            <CustomerInformation customers={customers} /> 
            {/* ===== Brand Unit Section ===== */}
            <BrandUnitSection />

            {/* ===== RKAB Section ===== */}
            <RkabSection />
        </div>
    );
}
export default RkabUnit;