import React, { useState } from 'react';
import { LuX, LuPlus, LuCheck, LuChevronDown, LuChevronRight, LuTrash2 } from 'react-icons/lu';
import Button from '../../../../../components/ui/button/Button';
import { EvidenceForm } from './EvidenceForm';
import LoadingSpinner from '@/components/common/Loading';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useIupZoneSIte } from '../../hooks/useIupZoneSIte';

export interface Evidence {
    iup_zona_site_date_last_survey: string;
    iup_zona_site_description: string;
    iup_zona_site_name?: string;
    fileLinks: string[];
}

export interface Zone {
    id: string;
    iup_zona_site_id?: string;
    name: string;
    evidence: Evidence;
}

const EMPTY_EVIDENCE: Evidence = { iup_zona_site_date_last_survey: '', iup_zona_site_description: '', iup_zona_site_name: '', fileLinks: [''] };

export const DEFAULT_ZONES: Zone[] = [
    "PIT (Area Tambang)",
    "MHR (Main Haul Road)",
    "ETO (Exportable Transit Ore)",
    "EFO (Exportable From Ore)",
    "Jetty (Dermaga Muat)",
    "Service Workshop",
    "Warehouse",
    "Residential Area",
    "Unit Parking Lot",
].map((name, i) => ({ id: `zone-${i}`, name, evidence: { ...EMPTY_EVIDENCE, fileLinks: [''] } }));

let idCounter = 1000;
const genId = (prefix: string) => `${prefix}-${idCounter++}`;

const ZoneArea: React.FC = () => {
    const {
        zones,
        updateZones,
        removeZone,
        isLoading,
        handleSubmitZone,
        handleConfirmDeleted,
        confirmDelete, 
        setConfirmDelete,
        isSubmitting,
        zoneErrors,
    } = useIupZoneSIte();

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showAddZone, setShowAddZone] = useState(false);
    const [newZoneName, setNewZoneName] = useState("");
    

    const toggleZone = (zoneId: string) => {
        setExpanded((prev) => ({ ...prev, [zoneId]: !prev[zoneId] }));
    };

    const addZone = () => {
        const name = newZoneName.trim();
        if (!name) return;
        updateZones([...zones, { id: genId('zone'), name, evidence: { ...EMPTY_EVIDENCE, fileLinks: [''] } }]);
        setNewZoneName('');
        setShowAddZone(false);
    };

    // ---- Evidence (langsung update field di zona terkait) ----
    const updateEvidenceField = (zoneId: string, field: string, value: string) => {
        updateZones(
            zones.map((z) =>
                z.id === zoneId ? { ...z, evidence: { ...z.evidence, [field]: value } } : z
            )
        );
    };

    const updateFileLink = (zoneId: string, idx: number, value: string) => {
        updateZones(
            zones.map((z) => {
                if (z.id !== zoneId) return z;
                const links = [...z.evidence.fileLinks];
                links[idx] = value;
                return { ...z, evidence: { ...z.evidence, fileLinks: links } };
            })
        );
    };

    const addFileLinkRow = (zoneId: string) => {
        updateZones(
            zones.map((z) =>
                z.id === zoneId
                ? { ...z, evidence: { ...z.evidence, fileLinks: [...z.evidence.fileLinks, ''] } }
                : z
            )
        );
    };

    const removeFileLinkRow = (zoneId: string, idx: number) => {
        updateZones(
            zones.map((z) => {
                if (z.id !== zoneId) return z;
                const links = z.evidence.fileLinks.filter((_, i) => i !== idx);
                return { ...z, evidence: { ...z.evidence, fileLinks: links.length ? links : [''] } };
            })
        );
    };

    if (isLoading) {
        return <div className="bg-white w-full rounded-2xl border border-slate-300 min-h-60 flex items-center justify-center relative">
            <LoadingSpinner />
        </div>;
    }


    return (
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">Zona &amp; Evidence</h2>
                    </div>
                    {/* <span className="text-xs text-slate-500">{zones.length} zona</span> */}
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    Daftar area yang perlu disurvey oleh tim di lapangan sebagai acuan data
                    dan dokumentasi riset Izin Usaha Pertambangan (IUP).
                </p>
            </div>

            {/* Daftar zona */}
            <div className="divide-y divide-slate-300">
                {zones.map((zone) => {
                    const isOpen = !!expanded[zone.id];
                    return (
                        <div key={zone.id}>
                            {/* Zone header row */}
                            <div
                                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
                                onClick={() => toggleZone(zone.id)}
                            >
                                {isOpen ? (
                                    <LuChevronDown size={16} className={`${isOpen ? 'text-white' : 'text-slate-500'} shrink-0`} />
                                ) : (
                                    <LuChevronRight size={16} className={`${isOpen ? 'text-white' : 'text-slate-500'} shrink-0`}  />
                                )}
                                <span className="flex-1 text-sm font-medium">{zone.name}</span>
                                <div onClick={(e) => e.stopPropagation()} title="Hapus zona">
                                    <Button
                                        variant="transparent"
                                        onClick={() => removeZone(zone)}
                                        className={`p-1 rounded hover:bg-red-500/10 hover:text-red-400 transition-colors ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`}
                                    >
                                        <LuTrash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="px-5 py-4">
                                    <EvidenceForm
                                        formData={zone.evidence}
                                        onChangeField={(field, value) => updateEvidenceField(zone.id, field, value)}
                                        onChangeFileLink={(idx, value) => updateFileLink(zone.id, idx, value)}
                                        onAddFileLink={() => addFileLinkRow(zone.id)}
                                        onRemoveFileLink={(idx) => removeFileLinkRow(zone.id, idx)}
                                        handleSubmit={() => handleSubmitZone(zone)}
                                        isSubmitting={isSubmitting}
                                        errors={zoneErrors?.[zone.id]}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tambah zona */}
            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl ">
                {showAddZone ? (
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addZone()}
                        placeholder="Nama zona baru..."
                        className="flex-1 bg-white border border-slate-500 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                    />
                    <Button
                        variant="outline"
                        onClick={addZone}
                        className="p-2 rounded-md text-sm font-medium transition-colors relative text-green-600 hover:text-green-700 hover:bg-red-50"
                    >
                        <LuCheck size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowAddZone(false);
                            setNewZoneName("");
                        }}
                        className="p-2 rounded-md text-sm font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <LuX size={16} />
                    </Button>
                </div>
                ) : (
                <button
                    type="button"
                    onClick={() => setShowAddZone(true)}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Tambah Zona
                </button>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleConfirmDeleted}
                title={`Confirm delete ${confirmDelete.name ?? ''}`}
                message="Are you sure you want to delete this zone? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isSubmitting}
                size="md"
                showIcon={false}
            />
        </div>
    );
};

export default ZoneArea;