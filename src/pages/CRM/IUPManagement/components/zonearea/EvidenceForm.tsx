import React, { useState } from 'react';
import Label from '@/components/form/Label';
import type { IupZonaSiteItem } from '../../types/iupmanagement';
import type { MasterZoneSiteSection } from '../../types/iupSurvey';
import Button from '@/components/ui/button/Button';
import EditableField from '@/components/form/editor/EditableField';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { LuX, LuPlus, LuCheck, LuTable2, LuEyeOff, LuEye, LuBookOpen, LuPenLine } from 'react-icons/lu';
import moment from 'moment';
import Input from '@/components/form/input/InputField';
import { ZoneFormErrors, ZoneFormState } from '../../hooks/useIupZoneSIte';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { sectionToHtmlTable } from './data/Sectiontohtmltable';
import DOMPurify from "dompurify";
import { Tooltip } from '@/components/ui/tooltip';
import { getMasterZoneSiteForName } from './data/zoneSurveySchemaMap';

interface EvidenceFormProps {
    zone?: IupZonaSiteItem;
    editingId: string | null;
    form: ZoneFormState;
    errors: ZoneFormErrors;
    submitting: boolean;
    onCreateGuide: (zone: IupZonaSiteItem) => void;
    onCreateGuideForNewZone: () => void;
    zoneSiteTemplates: MasterZoneSiteSection[];
    initialShowGuide?: boolean;
    updateField: <K extends keyof Omit<ZoneFormState, "fileLink">>(
        field: K,
        value: ZoneFormState[K]
    ) => void;
    updateFileLink: (idx: number, value: string) => void;
    addFileLinkRow: () => void;
    removeFileLinkRow: (idx: number) => void;
    submitForm: () => void;
    closeForm: () => void;
}

export const EvidenceForm: React.FC<EvidenceFormProps> = ({
    zone,
    editingId,
    form,
    errors,
    submitting,
    updateField,
    updateFileLink,
    addFileLinkRow,
    removeFileLinkRow,
    submitForm,
    closeForm,
    onCreateGuide,
    onCreateGuideForNewZone,
    zoneSiteTemplates,
    initialShowGuide = false,
}) => {
    const [showGuide, setShowGuide] = useState(initialShowGuide);
    const matchedSection = getMasterZoneSiteForName(form.title, zoneSiteTemplates);
    return (
        <div className={`transition-all duration-200 ${!editingId ? ' border border-green-300' : ''}`}>
            <div className={`flex justify-between gap-2 px-12 pe-5 py-3 group-hover:text-white bg-primary hover:bg-primary text-white`}>
                <div className="flex min-w-0 gap-3">
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm block font-primary-bold">{editingId ? `Edit - ${form.title}` : "New Zone Site"}</p>
                        {editingId && <p className="block text-xs font-secondary">{moment(form.date).format('DD MMMM YYYY')}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-1.5">
                        {!zone?.guide && (matchedSection && editingId) &&
                            <PermissionGate permission={["guide"]}>
                                <Tooltip content={zone?.guide ? 'Edit Step Information' : 'Create Guide step information'}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => (zone ? onCreateGuide(zone) : onCreateGuideForNewZone())}
                                    disabled={submitting || (!zone && !form.title.trim())}
                                    className="rounded-full w-8 h-8 items-center py-1 gap-2 bg-warning-200 hover:text-gray-700 hover:bg-warning-200 ring-warning-500 hover:ring-warning-400 p-0 ring-1"
                                >
                                    <LuPenLine size={13} />
                                    {/* {zone?.guide ? 'Edit Guide' : 'Create Guide'} */}
                                </Button>
                                </Tooltip>
                            </PermissionGate>
                        }
                            {zone?.guide && (
                            <Tooltip content={`View the step Instructions for this zone ${form.title}`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full w-8 h-8 items-center py-1 gap-2 bg-warning-200 hover:text-gray-700 hover:bg-warning-200 ring-warning-500 hover:ring-warning-400 p-0 ring-1"
                                    onClick={() => setShowGuide((prev) => !prev)}
                                >
                                    {showGuide ? <LuEyeOff size={13} /> : <LuBookOpen size={13} />}
                                    {/* {showGuide ? 'Hide' : 'Show'} */}
                                </Button>
                            </Tooltip>
                            )}
                        </div>
                    <Button
                        variant="outline"
                        className="rounded-[50px] bg-transparent text-white py-1"
                        onClick={closeForm}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="relative px-10 py-4 space-y-3">
                <div>
                    <Label htmlFor="name" className="gap-1">
                        Zone Name
                    </Label>
                    <Input
                        id="name"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 placeholder:text-slate-600"
                        placeholder="Zone Title"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        hint={errors.title}
                        error={!!errors.title}
                    />
                </div>

                <div>
                    <Label>
                        Link File
                    </Label>
                    <div className="space-y-1.5">
                        {form.fileLink.map((link: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <input
                                    placeholder="https://drive.google.com/..."
                                    value={link}
                                    className="bg-white flex-1 font-secondary h-11 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30"
                                    onChange={(e) => updateFileLink(idx, e.target.value)}
                                />
                                {/* {link && ( */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-md font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeFileLinkRow(idx)}
                                >
                                    <LuX size={14} />
                                </Button>
                                {/* )} */}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={addFileLinkRow}
                        variant="transparent"
                        size="sm"
                        className="mt-1.5 flex items-center gap-1 text-xs hover:bg-transparent p-0 text-green-700"
                    >
                        <LuPlus size={12} />
                        Add file link
                    </Button>
                </div>

                {zone?.guide && showGuide && (
                    <div className="rounded-xl border p-4 border-blue-light-500 bg-blue-light-50 space-y-3" title={`Guide ${zone.iup_zona_site_name ?? ''}`}>
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="flex items-center gap-1 mb-1 text-sm font-semibold text-gray-800 font-secondary">
                                <LuBookOpen size={12} /> 
                                Guide for {zone.iup_zona_site_name ?? ''}
                            </h4>
                            <PermissionGate permission={["guide"]}>
                                <Tooltip content={zone?.guide ? 'Edit Step Information' : 'Create Guide step information'}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => (zone ? onCreateGuide(zone) : onCreateGuideForNewZone())}
                                    disabled={submitting || (!zone && !form.title.trim())}
                                    className="rounded-full items-center py-1 gap-2 bg-warning-200 hover:text-gray-700 hover:bg-warning-200 ring-warning-500 hover:ring-warning-400 ring-1"
                                >
                                    <LuPenLine size={13} />
                                    {zone?.guide ? 'Edit Instructions' : 'Create Instructions'}
                                </Button>
                                </Tooltip>
                            </PermissionGate>
                        </div>
                        
                        <div
                            className="reset-content min-h-0"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(zone.guide, {
                                    ADD_ATTR: ["style", "data-field-key", "data-survey-section", "contenteditable"],
                                }),
                            }}
                        ></div>
                    </div>
                )}
                {editingId && matchedSection && (
                    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-4 mb-3">
                        <h4 className="mb-0 text-sm font-semibold text-gray-800 font-secondary">
                            Auto-fill Remark Data
                        </h4>
                        <p className="text-xs text-slate-600">
                            Click "Insert Default Data" to add basic remark information. Click "Show Guide" to understand the meaning of each field in the default table.
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full items-center py-1 gap-2 bg-transparent hover:text-gray-700 hover:bg-blue-light-100 ring-blue-light-600 hover:ring-blue-light-400"
                                onClick={() => {
                                    const tableHtml = sectionToHtmlTable(
                                        matchedSection.title,
                                        matchedSection.sectionKey,
                                        matchedSection.field_data,
                                        form.surveyValues
                                    );
                                    updateField("description", `${form.description ?? ""}${tableHtml}`);
                                }}
                            >
                                <LuTable2 size={13} />
                                Insert default data
                            </Button>
                            {zone?.guide && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full items-center py-1 gap-2 bg-transparent hover:text-gray-700 hover:bg-blue-light-100 ring-blue-light-600 hover:ring-blue-light-400"
                                onClick={() => setShowGuide((prev) => !prev)}
                            >
                                {showGuide ? <LuEyeOff size={13} /> : <LuEye size={13} />}
                                {showGuide ? 'Hide Instructions' : 'View Instructions'}
                            </Button>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <EditableField
                        id="description"
                        label="Remarks"
                        value={form.description}
                        onChange={(value: string) => updateField('description', value)}
                        placeholder="Remarks..."
                        disabled={submitting}
                        editing={true}
                        showAction={false}
                        // error={errors.keterangan}
                    />
                </div>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                    <DatePickerField
                        name="date"
                        label="Visit Date"
                        required
                        value={form.date}
                        error={errors.date}
                        onChange={(_, value) => updateField("date", value)}
                        parseValueToDate={(val) => moment(val, 'YYYY-MM-DD').isValid() ? moment(val, 'YYYY-MM-DD').toDate() : null}
                        convertDateToValue={(date) => moment(date).format('YYYY-MM-DD')}
                        formatDisplayValue={(val) => moment(val, 'YYYY-MM-DD').format('DD MMMM YYYY')}
                        formatReadOnlyValue={(date) => moment(date).format('DD MMMM YYYY')}
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                    <PermissionGate permission={["create", "update"]}>
                        <Button 
                            onClick={submitForm}
                            disabled={submitting}
                            className="rounded-[50px] focus:ring-2 focus:ring-offset-2 py-2"
                        >
                            <LuCheck size={14} />
                            Save
                        </Button>
                    </PermissionGate>
                </div>
            </div>
        </div>
    );
}