import React from 'react';
import RkabUnit from './ContractorUnit/RkabUnit';
import { CustomerInfo } from '../types/iupmanagement';
interface CustomerInformationProps {
    customers: CustomerInfo[];
}
const TabContractorUnit: React.FC<CustomerInformationProps> = ({ customers }) => {
    return (
        <RkabUnit customers={customers} />
    );
};

export default TabContractorUnit;