import '../../../components/map/lib/leaflet';
import { useIupTerritory } from './hooks/useIUPTerritory';
import 'leaflet/dist/leaflet.css';
import IUPMap from './components/IUPMap';
import { LoadingOverlay } from '@/components/common/Loading';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { MdAdd } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import { useNavigate } from 'react-router';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

export default function IUPDashboard() {
    const navigate = useNavigate();

    const {
        iupTerritories,
        loading,
        error,
        handleDeleteConfirmation,
        handleDelete,
        showDeleteModal,
        selectedIup,
        cancelDelete
    } = useIupTerritory();

    return (
        <div className="iup-dashboard ">
            <PageHeaderManage
                title="Map IUP"
                subtitle="Manage IUP and related information"
                actions={[
                    {
                    key: 'create',
                    element: (
                        <Button
                            onClick={() => navigate('/crm/iup/create')}
                            className="flex items-center gap-2"
                        >
                            <MdAdd size={20} />
                            <span>Create IUP</span>
                        </Button>
                    )}
                ]}
            />
            {error && (
                <div style={{ background: '#fdecea', color: '#b71c1c', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                    Gagal memuat data: {error}
                </div>
            )}
            {loading && <LoadingOverlay message="Memuat data IUP..." />}
            <IUPMap
                iupList={iupTerritories ? iupTerritories : []}
                handleDeleteItem={handleDeleteConfirmation}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={() => handleDelete(selectedIup!)}
                title="Hapus Data"
                message="Apakah Anda yakin ingin menghapus data hauling price ini?"
                confirmText="Hapus"
                type="danger"
            />
        </div>
    );
}
