import React, { useState } from 'react';
import { LuX, LuPlus, LuCheck, LuChevronDown, LuChevronRight, LuTrash2 } from 'react-icons/lu';
import Button from '../../../../../components/ui/button/Button';
import { EvidenceForm } from './EvidenceForm';

export interface Evidence {
  iup_zona_site_date_last_survey: string;
  keterangan: string;
  fileLinks: string[];
}

export interface Zone {
  id: string;
  iup_zona_site_id?: string;
  name: string;
  evidence: Evidence;
}

interface ZoneAreaProps {
  zones: Zone[];
  onChange: (zones: Zone[]) => void;
  onSubmitZone: (zone: Zone) => void;
}

const EMPTY_EVIDENCE: Evidence = { iup_zona_site_date_last_survey: '', keterangan: '', fileLinks: [''] };

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

const ZoneArea: React.FC<ZoneAreaProps> = ({ zones, onChange, onSubmitZone }) => {

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showAddZone, setShowAddZone] = useState(false);
    const [newZoneName, setNewZoneName] = useState("");

    const updateZones = (next: Zone[]) => onChange(next);

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

    const removeZone = (zoneId: string) => {
        updateZones(zones.filter((z) => z.id !== zoneId));
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




    return (
        <div className="w-full rounded-2xl border border-slate-300">

            {/* Daftar zona */}
            <div className="divide-y divide-slate-300">
                {zones.map((zone) => {
                    const isOpen = !!expanded[zone.id]; // default tertutup

                return (
                    <div key={zone.id}>
                        {/* Zone header row */}
                        <div
                            className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} hover:bg-gray-400/40 transition-colors`}
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
                                    onClick={() => removeZone(zone.id)}
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
                                    handleSubmit={() => onSubmitZone(zone)}
                                />
                            </div>
                        )}
                    </div>
                );
                })}
            </div>

            {/* Tambah zona */}
            <div className="px-5 py-4 border-t bg-green-100">
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
        </div>
    );
};

export default ZoneArea;