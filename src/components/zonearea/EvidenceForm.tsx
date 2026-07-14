import Input from '@/components/form/input/InputField';
import { LuMapPin, LuUser, LuLink2, LuX, LuPlus, LuCheck } from 'react-icons/lu';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import EditableField from '../form/editor/EditableField';
import { DatePickerField } from '../datepicker/DatePickerField';
import { convertDateToTanggal, formatDate, formatTanggal, parseTanggalToDate } from '@/helpers/generalHelper';

interface EvidenceFormProps {
    formData: any;
    onChangeField: (field: string, value: any) => void;
    onChangeFileLink: (idx: number, value: string) => void;
    onAddFileLink: () => void;
    onRemoveFileLink: (idx: number) => void;
    onSave?: () => void;
    isSubmitting?: boolean;
    errors?: { [key: string]: string };
}

export const EvidenceForm: React.FC<EvidenceFormProps> = ({ formData, onChangeField, onChangeFileLink, onAddFileLink, onRemoveFileLink, onSave, isSubmitting, errors }) => {
    const handleDateChange = (name: string, value: string) => {
        onChangeField(name, value);
    };
    return (
        <div className="rounded-lg border bg-gray-50 border-slate-300 p-3 space-y-3">

            <div>
                <Label>
                    Nama Sales
                </Label>
                <Input
                    placeholder="Nama sales yang input"
                    className="bg-white"
                    value={formData.salesName}
                    onChange={(e) => onChangeField("salesName", e.target.value)}
                />
            </div>

            <div>
                <Label>
                    Link File
                </Label>
                <div className="space-y-1.5">
                    {formData.fileLinks.map((link: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <Input
                                placeholder="https://drive.google.com/..."
                                value={link}
                                className="bg-white"
                                onChange={(e) => onChangeFileLink(idx, e.target.value)}
                            />
                            {link && (
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-md font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onRemoveFileLink(idx)}
                            >
                                <LuX size={14} />
                            </Button>
                            )}
                        </div>
                    ))}
                </div>
                <Button
                    onClick={onAddFileLink}
                    variant="outline"
                    size="sm"
                    className="mt-1.5 flex items-center gap-1 text-xs hover:bg-green-100"
                >
                    <LuPlus size={12} />
                    Tambah link file
                </Button>
            </div>
            <div>
                <DatePickerField
                    name="iup_zona_site_date_last_survey"
                    label="Tanggal Kunjungan"
                    required
                    value={formData.iup_zona_site_date_last_survey}
                    error={errors.iup_zona_site_date_last_survey}
                    onChange={handleDateChange}
                    parseValueToDate={parseTanggalToDate}
                    convertDateToValue={convertDateToTanggal}
                    formatDisplayValue={formatTanggal}
                    formatReadOnlyValue={(date) => formatDate(date.toISOString())}
                />
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

            {onSave && (
                <div className="flex items-center gap-2 pt-1">
                    <Button onClick={onSave}>
                        <LuCheck size={14} />
                        Simpan
                    </Button>
                </div>
            )}
        </div>
    );
}