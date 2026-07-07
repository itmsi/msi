import React from 'react';
import { useLocation } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import LoadingSpinner from '@/components/common/Loading';
import { useIupEdit } from './hooks/useIupEdit';
import PageHeader from '@/components/common/PageHeader';
import IUPMapForm from './components/IUPMapForm';
import IUPForm from './components/IUPForm';
import FormActions from '@/components/form/FormActions';
import type { GeoData } from './types/iupterritory';
import 'leaflet/dist/leaflet.css';

const EditIup: React.FC = () => {
    const location = useLocation();
    const listRoute = `/crm/iup${location.search}`;
    
    const {
        isLoading,
        isSubmitting,
        formData,
        errors,
        handleSelectChange,
        handleSubmit
    } = useIupEdit();

    const handleGeoChange = (geo: GeoData) => {
        handleSelectChange('iup_latitude', geo.pin ? String(geo.pin.lat) : '');
        handleSelectChange('iup_longitude', geo.pin ? String(geo.pin.lng) : '');
    };

    const latitudeTersedia = formData.iup_latitude !== null && formData.iup_latitude !== '';
    const longitudeTersedia = formData.iup_longitude !== null && formData.iup_longitude !== '';
    const latitude = latitudeTersedia ? Number(formData.iup_latitude) : NaN;
    const longitude = longitudeTersedia ? Number(formData.iup_longitude) : NaN;
    const initialGeo = Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { pin: { lat: latitude, lng: longitude } }
        : undefined;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }
    return (
        <>
            <PageMeta
                title={`Edit IUP${formData.company_name ? ` — ${formData.company_name}` : ''} | Netsuite`}
                description="Edit Netsuite IUP"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50">
                <div className="mx-auto px-0">
                    <PageHeader
                        title={`Edit IUP${formData.company_name ? ` — ${formData.company_name}` : ''}`}
                        backPath={listRoute}
                        subtitle={"Update the company information or drag the pin to adjust the IUP location."}
                    />

                    <div className="space-y-6">
                        <IUPForm
                            formData={formData}
                            errors={errors}
                            onSelectChange={handleSelectChange}
                        />
                        <IUPMapForm initialGeo={initialGeo} onChange={handleGeoChange} />
                        <FormActions
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            cancelRoute={listRoute}
                            submitText="Update IUP"
                            submittingText="Updating"
                        />
                    </div> 

                </div>
            </div>
        </>
    );
};

export default EditIup;