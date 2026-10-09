import { useEffect, useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantLabels } from '../language/applicantLabels';
import { formatBirthDate, parseApplicantDate, toApplicantDateValue } from '../utils/applicantForm';

interface PlaceDateOfBirthFieldProps {
    place: string;
    date: string;
    onPlaceChange: (place: string) => void;
    onDateChange: (date: string) => void;
    required?: boolean;
    hasError?: boolean;
}

const PlaceDateOfBirthField = ({
    place,
    date,
    onPlaceChange,
    onDateChange,
    required = false,
    hasError = false,
}: PlaceDateOfBirthFieldProps) => {
    const { langField } = useLanguage(applicantLabels);
    const [typedPlace, setTypedPlace] = useState(place);

    // Nilai yang disimpan di-trim, sedangkan input perlu mempertahankan spasi yang sedang diketik
    // ("Nusa " menuju "Nusa Tenggara"). Teks lokal hanya diganti kalau nilai berubah dari luar,
    // mis. data dimuat ulang setelah disimpan.
    useEffect(() => {
        if (typedPlace.trim() !== place.trim()) setTypedPlace(place);
    }, [place, typedPlace]);

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
                    value={typedPlace}
                    placeholder={langField('placeOfBirth')}
                    error={hasError}
                    onChange={(e) => {
                        setTypedPlace(e.target.value);
                        onPlaceChange(e.target.value.trim());
                    }}
                />
            </div>

            <DatePickerField
                name="date_of_birth"
                label={langField('dateOfBirth')}
                required={required}
                value={date}
                placeholder={langField('dateOfBirth')}
                onChange={(_, nextDate) => onDateChange(nextDate)}
                parseValueToDate={parseApplicantDate}
                convertDateToValue={toApplicantDateValue}
                formatDisplayValue={formatBirthDate}
            />
        </div>
    );
};

export default PlaceDateOfBirthField;
