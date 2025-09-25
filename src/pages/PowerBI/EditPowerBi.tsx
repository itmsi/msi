import { useParams } from "react-router-dom";
import PowerBiForm from './Component/PowerBiForm';
import PageMeta from "@/components/common/PageMeta";

export default function EditPowerBi() {
    const { id } = useParams<{ id: string }>();
    
    return (
    <>
        <PageMeta
            title="Edit Power BI - Motor Sights International"
            description="Edit Power BI - Motor Sights International"
            image="/motor-sights-international.png"
        />
        <PowerBiForm mode="edit" dashboardId={id} />
    </>
);
}