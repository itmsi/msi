import React from 'react';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import EditableField from '@/components/form/editor/EditableField';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { LuCheck } from 'react-icons/lu';
import moment from 'moment';
import Input from '@/components/form/input/InputField';
import { SurveyFormErrors, SurveyFormState } from '../../hooks/useIupSurvey';

interface SurveyFormProps {
    editingId: string | null;
    form: SurveyFormState;
    errors: SurveyFormErrors;
    submitting: boolean;
    updateField: <K extends keyof Omit<SurveyFormState, "fileLink">>(
        field: K,
        value: SurveyFormState[K]
    ) => void;
    // updateFileLink: (idx: number, value: string) => void;
    // addFileLinkRow: () => void;
    // removeFileLinkRow: (idx: number) => void;
    submitForm: () => void;
    closeForm: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
    editingId,
    form,
    errors,
    submitting,
    updateField,
    // updateFileLink,
    // addFileLinkRow,
    // removeFileLinkRow,
    submitForm,
    closeForm,
}) => {
    console.log(errors)
    return (
        <div className={`transition-all duration-200 ${!editingId ? ' border border-green-300' : ''}`}>
            <div className={`flex justify-between gap-2 px-12 py-3 group-hover:text-white bg-primary hover:bg-primary text-white`}>
                <div className="flex flex-col min-w-0">
                    <p className="text-sm block font-primary-bold">{editingId ? `Edit ${form.userName}` : "New Survey"}</p>
                    {editingId && <p className="block text-xs font-secondary">{moment(form.chatDate).format('DD MMMM YYYY')}</p>}
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
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                    <div>
                        <Label htmlFor="name" className="gap-1">
                            User Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            className={`px-3 py-2 text-sm placeholder:text-slate-600`}
                            placeholder="User name"
                            value={form.userName}
                            onChange={(e) => updateField("userName", e.target.value)}
                            hint={errors.userName}
                            error={!!errors.userName}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone-number" className="gap-1">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone-number"
                            className={`px-3 py-2 text-sm placeholder:text-slate-600`}
                            placeholder="08..."
                            value={form.userPhone}
                            onChange={(e) => updateField("userPhone", e.target.value)}
                            hint={errors.userPhone}
                            error={!!errors.userName}
                        />
                    </div>
                </div>
                <div>
                    <EditableField
                        id="description"
                        label="Remarks"
                        value={form.description ?? ''}
                        onChange={(value: string) => updateField('description', value)}
                        placeholder="Remarks..."
                        disabled={submitting}
                        editing={true}
                        showAction={false}
                        // error={errors.keterangan}
                    />
                </div>
                <div>
                    <Label>
                        Link File 
                    </Label>
                    <div className="flex items-center gap-1.5">
                        <input
                            placeholder="https://drive.google.com/..."
                            value={form.sourceLink}
                            className="bg-white flex-1 font-secondary h-11 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30"
                            onChange={(e) => updateField("sourceLink", e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                    <DatePickerField
                        name="date"
                        label="Visit Date"
                        required
                        value={form.chatDate || ''}
                        error={errors.chatDate}
                        onChange={(_, value) => updateField("chatDate", value)}
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