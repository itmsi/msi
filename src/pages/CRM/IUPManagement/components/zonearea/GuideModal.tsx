import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import EditableField from '@/components/form/editor/EditableField';
import { LuLoaderCircle, LuTable2 } from 'react-icons/lu';
import { IupZonaSiteItem } from '../../types/iupmanagement';
import type { MasterZoneSiteSection } from '../../types/iupSurvey';
import { sectionToHtmlTable } from './data/Sectiontohtmltable';
import { parseSurveyTableFromHtml } from './data/Parsesurveytablefromhtml';
import { getMasterZoneSiteForName } from './data/zoneSurveySchemaMap';

interface GuideModalProps {
    zone: IupZonaSiteItem | null;
    value: string;
    onChange: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
    submitting?: boolean;
    zoneSiteTemplates: MasterZoneSiteSection[];
}

const GuideModal: React.FC<GuideModalProps> = ({
    zone,
    value,
    onChange,
    onClose,
    onSave,
    submitting = false,
    zoneSiteTemplates,
}) => {
    const matchedSection = zone ? getMasterZoneSiteForName(zone.iup_zona_site_name, zoneSiteTemplates) : undefined;

    const handleInsertTable = () => {
        if (!matchedSection) return;
        const existingValues = parseSurveyTableFromHtml(value);
        const tableHtml = sectionToHtmlTable(
            matchedSection.title,
            matchedSection.sectionKey,
            matchedSection.field_guide,
            existingValues
        );
        onChange(`${value ?? ""}${tableHtml}`);
    };

    return (
        <Modal
            isOpen={!!zone}
            onClose={submitting ? () => {} : onClose}
            showCloseButton={!submitting}
            title={`Step Information "${zone?.iup_zona_site_name ?? ''}"`}
            description="Write the guide for this zone."
            className="max-w-6xl m-4"
        >
            <div className="p-6 space-y-4">
                {matchedSection && (
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5">
                        <p className="text-xs text-slate-600">
                            Template tabel <span className="font-medium">{matchedSection.title}</span> tersedia untuk zona ini.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 text-xs shrink-0"
                            onClick={handleInsertTable}
                            disabled={submitting}
                        >
                            <LuTable2 size={13} />
                            Insert default data
                        </Button>
                    </div>
                )}
                <EditableField
                    id="zone-guide"
                    label="Guide"
                    value={value}
                    onChange={onChange}
                    placeholder="write the guide for this zone..."
                    disabled={submitting}
                    editing={true}
                    showAction={false}
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                    <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onSave} disabled={submitting}>
                        {submitting && <LuLoaderCircle size={14} className="animate-spin" />}
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default GuideModal;
