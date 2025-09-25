import PageMeta from '@/components/common/PageMeta';
import PowerBiForm from './Component/PowerBiForm';

export default function CreatePowerBi() {
    return (
    <>
        <PageMeta
            title="Create Power BI - Motor Sights International"
            description="Create Power BI - Motor Sights International"
            image="/motor-sights-international.png"
        />
        <PowerBiForm mode="create" />
    </>
);
}