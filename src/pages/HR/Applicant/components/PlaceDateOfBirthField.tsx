import { useEffect, useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantLabels } from '../language/applicantLabels';
import {
    buildPlaceDateOfBirth,
    formatBirthDate,
    parseApplicantDate,
    parsePlaceDateOfBirth,
    toApplicantDateValue,
} from '../utils/applicantForm';

interface PlaceDateOfBirthFieldProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    hasError?: boolean;
}

const PlaceDateOfBirthField = ({ value, onChange, required = false, hasError = false }: PlaceDateOfBirthFieldProps) => {
    const { langField } = useLanguage(applicantLabels);
    const { place: parsedPlace, date } = parsePlaceDateOfBirth(value);
    const [place, setPlace] = useState(parsedPlace);

    // Nilai gabungan di-trim saat dibangun, sedangkan input perlu mempertahankan spasi yang
    // sedang diketik. Teks lokal hanya diganti kalau nilai berubah dari luar (mis. data dimuat ulang).
    useEffect(() => {
        if (buildPlaceDateOfBirth(place, date) !== value.trim()) setPlace(parsedPlace);
    }, [value, place, date, parsedPlace]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
                <Label htmlFor="place_of_birth">
                    {langField('placeOfBirth')} {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id="place_of_birth"
                    name="place_of_birth"
                    autoComplete="off"
                    value={place}
                    placeholder={langField('placeOfBirth')}
                    error={hasError}
                    onChange={(e) => {
                        setPlace(e.target.value);
                        onChange(buildPlaceDateOfBirth(e.target.value, date));
                    }}
                />
            </div>

            <DatePickerField
                name="date_of_birth"
                label={langField('dateOfBirth')}
                required={required}
                value={date}
                placeholder={langField('dateOfBirth')}
                onChange={(_, nextDate) => onChange(buildPlaceDateOfBirth(place, nextDate))}
                parseValueToDate={parseApplicantDate}
                convertDateToValue={toApplicantDateValue}
                formatDisplayValue={formatBirthDate}
            />
        </div>
    );
};

export default PlaceDateOfBirthField;
