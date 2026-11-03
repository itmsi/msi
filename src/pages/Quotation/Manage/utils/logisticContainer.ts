import { IslandSelectOption } from '@/hooks/useIslandSelect';
import { IslandService } from '@/pages/Administration/Island/services/islandService';
import { getDepartmentId, getDepartmentName } from '@/helpers/generalHelper';

export const LOGISTIC_CONTAINER_DEPARTMENT = 'Logistic Countainer';
export const LOGISTIC_CONTAINER_ISLAND_ID = '9e9fec2b-a316-4c2b-a88e-2bde66a84218';
const LOGISTIC_CONTAINER_DEPARTMENT_ID = '9e9fec2b-a316-4c2b-a88e-2bde66a84218';

export const isLogisticContainerDepartment = (): boolean => {
    return [LOGISTIC_CONTAINER_DEPARTMENT, 'Logistic Container'].includes(getDepartmentName())
        || getDepartmentId() === LOGISTIC_CONTAINER_DEPARTMENT_ID;
};

// Nama pulau diambil dari API; kalau gagal, ID pulau tetap dipakai dengan label cadangan.
export const getLogisticContainerIslandOption = async (): Promise<IslandSelectOption> => {
    let label = LOGISTIC_CONTAINER_DEPARTMENT || 'Logistic Container';

    try {
        const response = await IslandService.getIslandById(LOGISTIC_CONTAINER_ISLAND_ID);
        label = response.data?.data?.island_name || label;
    } catch (error) {
        console.error('Error loading logistic container island:', error);
    }

    return { value: LOGISTIC_CONTAINER_ISLAND_ID, label };
};
