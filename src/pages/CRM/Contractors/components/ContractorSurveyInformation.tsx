import { Accordion } from '@/components/ui/accordion';
import { AccordionItemData } from '@/components/ui/accordion/types';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import React from 'react';

const ContractorSurveyInformation: React.FC = () => {
    
    const dataAccordion: AccordionItemData[] = [
        {
            id: '1',
            judul: 'ROA Revisited',
            konten: <p>Ini adalah konten ROA Revisited...</p>
        },
        {
            id: '2',
            judul: 'Survey Method',
            konten: <p>Ini adalah konten Survey Method...</p>
        },
        {
            id: '3',
            judul: 'MAP',
            konten: (
            <div>
                <FileUpload
                    id="product_image"
                    name="product_image"
                    label="Foto Produk"
                    accept="image/jpeg,image/jpg,image/png"
                    icon="image"
                    acceptedFormats={['jpg', 'jpeg', 'png']}
                    maxSize={5}
                    multiple={true}
                    existingImageUrl={[
                        '/images/image-weecom-1.png', 
                        '/images/image-weecom-2.png'
                    ]}
                    onFileChange={() => {}}
                    validationError={''}
                    disabled={false}
                    description="Format: JPG, JPEG, PNG - Maksimal 5MB"
                    showPreview={true}
                    previewSize="lg"
                    colLength={4}
                />
            </div>)
        },
        {
            id: '4', 
            judul: 'Current ROA',
            konten: (
                <div>
                    <p>Ini adalah konten Current ROA...</p>
                </div>
            )
        },
        {
            id: '5',
            judul: 'New ROA',
            konten: <p>Ini adalah konten New ROA...</p>
        },
        {
            id: '6',
            judul: 'New ROA',
            konten: <p>Ini adalah konten New ROA...</p>,
            // disabled: true // Item ini tidak bisa dibuka
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg leading-6 font-primary-bold text-gray-900">Solution Information</h2>
                    </div>
                </div>
            </div>
            <div className="p-6 font-secondary">
                <Accordion
                    items={dataAccordion}
                    allowMultiple={true}
                    defaultOpenItems={['1']}
                    onItemToggle={(itemId, isOpen) => {
                        console.log(`Item ${itemId} is now ${isOpen ? 'open' : 'closed'}`);
                    }}
                />
            </div>

        </div>
    );
};

export default ContractorSurveyInformation;