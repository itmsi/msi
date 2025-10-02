import React from 'react';

import TreeMenu from './Component/TreeMenu';

const PartCataloguePage: React.FC = () => {
    const handleItemSelect = (item: any) => {
        console.log('Selected item:', item);
    };

    return (
        <TreeMenu onItemSelect={handleItemSelect} />
    );
};

export default PartCataloguePage;