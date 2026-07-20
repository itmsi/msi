import React from 'react';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import EditableField from '@/components/form/editor/EditableField';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { LuX, LuPlus, LuCheck } from 'react-icons/lu';
import moment from 'moment';
import Input from '@/components/form/input/InputField';
import { ZoneFormErrors, ZoneFormState } from '../../hooks/useIupZoneSIte';

interface EvidenceFormProps {
    editingId: string | null;
    form: ZoneFormState;
    errors: ZoneFormErrors;
    submitting: boolean;
    updateField: <K extends keyof Omit<ZoneFormState, "imageLinks">>(
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
}) => {
    return (
        <div className={`transition-all duration-200 ${!editingId ? ' border border-green-300' : ''}`}>
            <div className={`flex justify-between gap-2 px-12 py-3 group-hover:text-white bg-primary hover:bg-primary text-white`}>
                <div className="flex flex-col min-w-0">
                    <p className="text-sm block font-primary-bold">{editingId ? `Edit ${form.title}` : "New Visit"}</p>
                    {editingId && <p className="block text-xs font-secondary">{moment(form.date).format('DD MMMM YYYY')}</p>}
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
                        onChange={(value: string) => updateField('date', value)}
                        parseValueToDate={(val) => moment(val, 'YYYY-MM-DD').isValid() ? moment(val, 'YYYY-MM-DD').toDate() : null}
                        convertDateToValue={(date) => moment(date).format('YYYY-MM-DD')}
                        formatDisplayValue={(val) => moment(val, 'YYYY-MM-DD').format('DD MMMM YYYY')}
                        formatReadOnlyValue={(date) => moment(date).format('DD MMMM YYYY')}
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                    <Button 
                        onClick={submitForm}
                        disabled={submitting}
                        className="rounded-[50px] focus:ring-2 focus:ring-offset-2 py-2"
                    >
                        <LuCheck size={14} />
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}