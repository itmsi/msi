import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'react-date-range';
import { format } from 'date-fns';
import { MdCalendarToday } from 'react-icons/md';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';
import IupContractorSelect from '@/components/form/select/IupContractorSelect';
import { handleDecimalInput } from '@/helpers/generalHelper';
import { FormState } from '../types/calculator';
import { PERIODE_OPTIONS } from '../utils/kalkulasiHelper';

interface Props {
    form: FormState;
    iupValue: { value: string; label: string } | null;
    contractorValue: { value: string; label: string } | null;
    onIupChange: (iup: { value: string; label: string } | null) => void;
    onContractorChange: (contractor: { value: string; label: string; customer_name?: string } | null) => void;
    onUpdate: (partial: Partial<FormState>) => void;
}

export default function SeksiInfoDasar({ form, iupValue, contractorValue, onIupChange, onContractorChange, onUpdate }: Props) {
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
                setShowCalendar(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleNumericInput(field: keyof FormState, e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/[^0-9.,]/g, '');
        onUpdate({ [field]: raw });
    }

    const tanggalLabel = form.effectiveDate ? format(form.effectiveDate, 'dd/MM/yyyy') : 'Pilih tanggal...';

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-medium text-gray-800">Basic Informations</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IupContractorSelect
                    className="md:col-span-2"
                    layout="horizontal"
                    gridCols="grid-cols-1 md:grid-cols-2"
                    iupValue={iupValue}
                    iupLabel="IUP Selection"
                    iupRequired={true}
                    contractorValue={contractorValue}
                    contractorLabel="Contractor"
                    contractorRequired={true}
                    onIupChange={onIupChange}
                    onContractorChange={onContractorChange}
                />

                <div>
                    <Label>Periode Harga</Label>
                    <CustomSelect
                        placeholder="Pilih periode..."
                        value={PERIODE_OPTIONS.find(o => o.value === form.periodeHarga) ?? null}
                        options={PERIODE_OPTIONS}
                        isClearable={false}
                        isSearchable={false}
                        onChange={opt => onUpdate({ periodeHarga: opt?.value ?? '' })}
                    />
                </div>

                <div>
                    <Label>Tanggal Efektif</Label>
                    <div className="relative" ref={calendarRef}>
                        <button
                            type="button"
                            className="font-secondary h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-left text-sm shadow-theme-xs hover:border-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 flex items-center justify-between"
                            onClick={() => setShowCalendar(v => !v)}
                        >
                            <span className={form.effectiveDate ? 'text-gray-800' : 'text-gray-400'}>
                                {tanggalLabel}
                            </span>
                            <MdCalendarToday className="h-4 w-4 text-gray-400 shrink-0" />
                        </button>
                        {showCalendar && (
                            <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
                                <Calendar
                                    date={form.effectiveDate ?? new Date()}
                                    onChange={(date: Date) => {
                                        onUpdate({ effectiveDate: date });
                                        setShowCalendar(false);
                                    }}
                                    color="#0253a5"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="tonasePerRitase">Tonase per Unit (ton)</Label>
                    <Input
                        id="tonasePerRitase"
                        type="text"
                        placeholder=""
                        value={form.tonasePerRitase}
                        onChange={e => handleNumericInput('tonasePerRitase', e)}
                    />
                </div>

                <div>
                    <Label htmlFor="jarakHaul">Jarak Haul (km PP)</Label>
                    <Input
                        id="jarakHaul"
                        type="text"
                        placeholder=""
                        value={form.jarakHaul}
                        onChange={e => handleNumericInput('jarakHaul', e)}
                    />
                </div>

                <div>
                    <Label htmlFor="shift_per_hari">Shift per Hari</Label>
                    <Input
                        id="shift_per_hari"
                        type="text"
                        placeholder=""
                        value={form.shift_per_hari}
                        onChange={e => handleDecimalInput(
                            e.target.value,
                            (val) => onUpdate({ shift_per_hari: val }),
                            () => onUpdate({ shift_per_hari: '' }),
                            true, 7, 4
                        )}
                    />
                </div>

                <div>
                    <Label htmlFor="ritase_per_shift">Ritase per Shift</Label>
                    <Input
                        id="ritase_per_shift"
                        type="text"
                        placeholder=""
                        value={form.ritase_per_shift}
                        onChange={e => handleDecimalInput(
                            e.target.value,
                            (val) => onUpdate({ ritase_per_shift: val }),
                            () => onUpdate({ ritase_per_shift: '' }),
                            true, 7, 4
                        )}
                    />
                </div>

                <div>
                    <Label htmlFor="fuel_consumption">Fuel L/km</Label>
                    <Input
                        id="fuel_consumption"
                        type="text"
                        placeholder=""
                        value={form.fuel_consumption}
                        onChange={e => handleDecimalInput(
                            e.target.value,
                            (val) => onUpdate({ fuel_consumption: val }),
                            () => onUpdate({ fuel_consumption: '' }),
                            true, 9, 4
                        )}
                    />
                </div>

                <div>
                    <Label htmlFor="idle_factor">Idle Factor (%)</Label>
                    <Input
                        id="idle_factor"
                        type="text"
                        placeholder=""
                        value={form.idle_factor}
                        onChange={e => handleDecimalInput(
                            e.target.value,
                            (val) => onUpdate({ idle_factor: val }),
                            () => onUpdate({ idle_factor: '' }),
                            true, 9, 4
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
