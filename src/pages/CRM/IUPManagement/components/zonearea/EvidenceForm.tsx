import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import EditableField from '@/components/form/editor/EditableField';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { LuX, LuPlus, LuCheck } from 'react-icons/lu';
import moment from 'moment';

interface EvidenceFormProps {
    formData: any;
    onChangeField: (field: string, value: any) => void;
    onChangeFileLink: (idx: number, value: string) => void;
    onAddFileLink: () => void;
    onRemoveFileLink: (idx: number) => void;
    handleSubmit: () => void;
    isSubmitting?: boolean;
}

export const EvidenceForm: React.FC<EvidenceFormProps> = ({ formData, onChangeField, onChangeFileLink, onAddFileLink, onRemoveFileLink, isSubmitting, handleSubmit }) => {
    const handleDateChange = (name: string, value: string) => {
        onChangeField(name, value);
    };
    return (
        <div className="rounded-lg border bg-gray-50 border-slate-300 p-3 space-y-3 font-primary">
            <div>
                <Label>
                    Link File
                </Label>
                <div className="space-y-1.5">
                    {formData.fileLinks.map((link: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <input
                                placeholder="https://drive.google.com/..."
                                value={link}
                                className="bg-white flex-1 font-secondary h-11 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30"
                                onChange={(e) => onChangeFileLink(idx, e.target.value)}
                            />
                            {/* {link && ( */}
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-md font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onRemoveFileLink(idx)}
                            >
                                <LuX size={14} />
                            </Button>
                            {/* )} */}
                        </div>
                    ))}
                </div>
                <Button
                    onClick={onAddFileLink}
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
                    id="keterangan"
                    label="Keterangan"
                    value={formData.keterangan}
                    onChange={(value: string) => onChangeField('keterangan', value)}
                    placeholder="Catatan tambahan..."
                    disabled={isSubmitting}
                    // error={errors.keterangan}
                />
            </div>
            <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-4">
                <DatePickerField
                    name="iup_zona_site_date_last_survey"
                    label="Tanggal Kunjungan"
                    required
                    value={formData.iup_zona_site_date_last_survey}
                    // error={errors.iup_zona_site_date_last_survey}
                    onChange={handleDateChange}
                    parseValueToDate={(val) => moment(val, 'YYYY-MM-DD').isValid() ? moment(val, 'YYYY-MM-DD').toDate() : null}
                    convertDateToValue={(date) => moment(date).format('YYYY-MM-DD')}
                    formatDisplayValue={(val) => moment(val, 'YYYY-MM-DD').format('DD MMMM YYYY')}
                    formatReadOnlyValue={(date) => moment(date).format('DD MMMM YYYY')}
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
                <Button 
                    onClick={handleSubmit}
                    className="px-6 flex items-center gap-2 rounded-full"
                >
                    <LuCheck size={14} />
                    Simpan
                </Button>
            </div>
        </div>
    );
}