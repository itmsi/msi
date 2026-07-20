import React, { useEffect, useState } from "react";
import {
    LuX,
    LuPlus,
    LuCheck,
    LuLoaderCircle,
    LuLocate,
} from "react-icons/lu";
import { VisitFormErrors, VisitFormState } from "../../hooks/useIupVisit";
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { DatePickerField } from "@/components/datepicker/DatePickerField";
import moment from "moment";
import { useEmployeeSelect } from "@/pages/QuotationITI/hooks/useEmployeeSelect";
import CustomAsyncSelect from "@/components/form/select/CustomAsyncSelect";
import EditableField from "@/components/form/editor/EditableField";
import { formatDate } from "@/helpers/generalHelper";

export interface VisitFormProps {
    editingId: string | null;
    form: VisitFormState;
    errors: VisitFormErrors;
    submitting: boolean;
    updateField: <K extends keyof Omit<VisitFormState, "imageLinks">>(
        field: K,
        value: VisitFormState[K]
    ) => void;
    updateImageLink: (idx: number, value: string) => void;
    addImageLinkRow: () => void;
    removeImageLinkRow: (idx: number) => void;
    fillCurrentLocation: () => void;
    submitForm: () => void;
    closeForm: () => void;
}
const errorInputCls =
  "w-full bg-red-100 border border-red-500/60 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 placeholder:text-slate-600";
const fieldCls = (hasError?: string) => (hasError && errorInputCls);

const VisitForm: React.FC<VisitFormProps> = ({
    editingId,
    form,
    errors,
    submitting,
    updateField,
    updateImageLink,
    addImageLinkRow,
    removeImageLinkRow,
    submitForm,
    fillCurrentLocation,
    closeForm,
}) => {
    const {
        employeeOptions,
        pagination: employeePagination,
        inputValue: employeeInputValue,
        setActiveSales,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions
    } = useEmployeeSelect();

    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    useEffect(() => {
        setActiveSales(true);
        initializeEmployeeOptions();
    }, [initializeEmployeeOptions]);

    useEffect(() => {
        if (form.employeeId && form.employeeName) {
            setSelectedEmployee({
                value: form.employeeId,
                label: form.employeeName,
            });
        } else {
            setSelectedEmployee(null);
        }
    }, [form.employeeId, form.employeeName]);
    
    return (
        <div className={`transition-all duration-200 ${!editingId ? ' border border-green-300' : ''}`}>
            <div className={`flex justify-between gap-2 px-12 py-3 group-hover:text-white bg-primary hover:bg-primary text-white`}>
                <div className="flex flex-col min-w-0">
                    <p className="text-sm block font-primary-bold">{editingId ? `Edit ${form.title}` : "New Visit"}</p>
                    {editingId && <p className="block text-xs font-secondary">{formatDate(form.date)}</p>}
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
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        className={fieldCls(errors.title)}
                        placeholder="Visit Title"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        hint={errors.title}
                        error={!!errors.title}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor="phoneNumber">
                            Phone Number
                        </Label>
                        <Input
                            id="phoneNumber"
                            className={fieldCls(errors.phoneNumber)}
                            placeholder="08..."
                            value={form.phoneNumber}
                            onChange={(e) => updateField("phoneNumber", e.target.value)}
                            hint={errors.phoneNumber}
                        />
                    </div>
                    <div>
                        <Label>Sales</Label>
                        <CustomAsyncSelect
                            placeholder="Select employee..."
                            value={selectedEmployee}
                            error={errors.employeeId}
                            defaultOptions={employeeOptions}
                            loadOptions={handleEmployeeInputChange}
                            onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                            isLoading={employeePagination.loading}
                            noOptionsMessage={() => "No employees found"}
                            loadingMessage={() => "Loading employees..."}
                            isSearchable={true}
                            inputValue={employeeInputValue}
                            onInputChange={(inputValue) => {
                                handleEmployeeInputChange(inputValue);
                            }}
                            onChange={(option: any) => {
                                setSelectedEmployee(option);
                                updateField('employeeId', option?.value || '');
                            }}
                        />
                        {errors.employeeId && (
                            <span className="text-sm text-red-500">{errors.employeeId}</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <Label htmlFor="latitude">
                            Latitude
                        </Label>
                        <Input
                            id="latitude"
                            className={fieldCls(errors.latitude)}
                            placeholder="-2.9761"
                            value={form.latitude}
                            onChange={(e) => updateField("latitude", e.target.value)}
                            hint={errors.latitude}
                        />
                    </div>
                    <div>
                        <Label htmlFor="longitude" className="gap-1">
                            Longitude
                        </Label>
                        <Input
                            id="longitude"
                            className={fieldCls(errors.longitude)}
                            placeholder="104.7754"
                            value={form.longitude}
                            onChange={(e) => updateField("longitude", e.target.value)}
                            hint={errors.longitude}
                        />
                    </div>
                    <div className="flex items-end justify-start gap-1">
                        <Button
                            variant="outline"
                            onClick={fillCurrentLocation}
                            className="text-blue-400 hover:text-blues-300 p-3.5"
                            >
                            <LuLocate size={15} />
                        </Button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="imageLinks" className="gap-1">
                        Link File
                    </Label>
                    <div className="space-y-1.5">
                        {form.imageLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <input
                                    id={`imageLink-${idx}`}
                                    placeholder="https://drive.google.com/..."
                                    value={link}
                                    className="bg-white flex-1 font-secondary h-11 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30"
                                    onChange={(e) => updateImageLink(idx, e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => removeImageLinkRow(idx)}
                            className="rounded-md font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LuX size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                    {errors.imageLinks && <p className="mt-1 text-[11px] text-red-400">{errors.imageLinks}</p>}
                    <Button
                        onClick={addImageLinkRow}
                        variant="transparent"
                        size="sm"
                        className="mt-1.5 flex items-center gap-1 text-xs hover:bg-transparent p-0 text-green-700"
                    >
                        <LuPlus size={12} />
                        Tambah link file
                    </Button>
                </div>

                <div>
                    <EditableField
                        id="history-description"
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
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
                    <DatePickerField
                        name="iup_zona_site_date_last_survey"
                        label="Visit Date"
                        required
                        value={form.date}
                        error={errors.date}
                        onChange={(value) => updateField("date", value)}
                        parseValueToDate={(val) => moment(val, 'YYYY-MM-DD').isValid() ? moment(val, 'YYYY-MM-DD').toDate() : null}
                        convertDateToValue={(date) => moment(date).format('YYYY-MM-DD')}
                        formatDisplayValue={(val) => moment(val, 'YYYY-MM-DD').format('DD MMMM YYYY')}
                        formatReadOnlyValue={(date) => moment(date).format('DD MMMM YYYY')}
                    />
                </div>
                
                <div className="flex items-center justify-end gap-2 pt-1">
                    
                    <Button
                        variant="outline"
                        className="rounded-[50px] py-2"
                        onClick={closeForm}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={submitForm}
                        disabled={submitting}
                        className="rounded-[50px] focus:ring-2 focus:ring-offset-2 py-2"
                    >
                        {submitting ? <LuLoaderCircle size={14} className="animate-spin" /> : <LuCheck size={14} />}
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VisitForm;