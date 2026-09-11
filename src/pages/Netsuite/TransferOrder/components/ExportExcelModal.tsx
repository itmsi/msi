import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { MdCheckCircle, MdDateRange, MdFileDownload, MdInfoOutline } from 'react-icons/md';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import Switch from '@/components/form/switch/Switch';
import { MAX_EXPORT_DAYS, useTransferOrderExport } from '../hooks/useTransferOrderExport';
import { subYears } from 'date-fns';

interface ExportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    statusOptions: { value: string; label: string }[];
}

const PRESETS = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 14 Days', days: 14 },
];

const ExportExcelModal: React.FC<ExportExcelModalProps> = ({ isOpen, onClose, statusOptions }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // react-date-range mengirim onChange dua kali untuk satu rentang:
    // klik pertama menetapkan tanggal awal, klik kedua tanggal akhir.
    // Kalender ditutup otomatis setelah klik kedua.
    const pickerClickRef = useRef(0);

    const {
        dateRange,
        startDate,
        endDate,
        dayCount,
        isRangeValid,
        statusName,
        setStatusName,
        includeChild,
        setIncludeChild,
        loading,
        error,
        result,
        applyPreset,
        handleRangeChange,
        submit,
        reset,
    } = useTransferOrderExport();

    // Klik di luar kalender ikut menutup kalender
    useEffect(() => {
        if (!showDatePicker) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDatePicker]);

    const handleTogglePicker = () => {
        pickerClickRef.current = 0;
        setShowDatePicker(prev => !prev);
    };

    const handleClose = () => {
        setShowDatePicker(false);
        reset();
        onClose();
    };

    const allStatusOptions = [{ value: '', label: 'All Status' }, ...statusOptions];

    const rangeLabel = startDate && endDate
        ? `${moment(startDate).format('DD MMM YYYY')} - ${moment(endDate).format('DD MMM YYYY')}`
        : 'Select date range';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Download Excel"
            description="Select a date range and filter the data you want to export"
            className="max-w-xl"
        >
            <div className="p-6 space-y-5 font-secondary">
                {/* Date Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Range <span className="text-red-500">*</span>
                    </label>

                    <div className="flex flex-wrap gap-2 mb-2">
                        {PRESETS.map(preset => (
                            <Button
                                key={preset.days}
                                type="button"
                                onClick={() => {
                                    applyPreset(preset.days);
                                    setShowDatePicker(false);
                                }}
                                size="sm"
                                className={`px-3 py-1 border font-sm ${dayCount === preset.days
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    <div ref={datePickerRef} className='flex relative'>
                        <div
                            className={`w-full px-3 py-2 border rounded-md cursor-pointer bg-white min-h-11 flex items-center justify-between ${isRangeValid ? 'border-gray-300' : 'border-red-300'
                                }`}
                            onClick={handleTogglePicker}
                        >
                            <div className="flex items-center gap-2">
                                <MdDateRange className="text-gray-400" />
                                <span className="text-gray-900">{rangeLabel}</span>
                            </div>
                            <span className={`text-xs font-medium ${isRangeValid ? 'text-gray-500' : 'text-red-600'}`}>
                                {dayCount} {dayCount === 1 ? 'day' : 'days'}
                            </span>
                        </div>

                        {showDatePicker && (
                            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden inline-block bg-white shadow-sm absolute top-full z-2">
                                <DateRange
                                    ranges={dateRange}
                                    onChange={(item: RangeKeyDict) => {
                                        const selection = item.selection;
                                        if (selection?.startDate && selection?.endDate) {
                                            handleRangeChange({
                                                startDate: selection.startDate,
                                                endDate: selection.endDate,
                                                key: 'selection',
                                            });
                                        }

                                        pickerClickRef.current += 1;
                                        if (pickerClickRef.current >= 2) {
                                            setShowDatePicker(false);
                                        }
                                    }}
                                    minDate={subYears(new Date(), 10)}
                                    moveRangeOnFirstSelection={false}
                                    rangeColors={['#3b82f6']}
                                />
                                <div className="flex justify-end px-3 py-2 border-t border-gray-200 bg-gray-50">
                                    <Button
                                        type="button"
                                        onClick={() => setShowDatePicker(false)}
                                        size="sm"
                                        className="px-4 py-1"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className={`mt-2 text-xs flex items-start gap-1 ${isRangeValid ? 'text-gray-500' : 'text-red-600'}`}>
                        <MdInfoOutline className="w-4 h-4 flex-none mt-px" />
                        {isRangeValid
                            ? `Maximum ${MAX_EXPORT_DAYS} days per download.`
                            : `Selected range is ${dayCount} days. Narrow it to ${MAX_EXPORT_DAYS} days or less to download.`}
                    </p>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <CustomSelect
                        id="export_status"
                        name="export_status"
                        options={allStatusOptions}
                        value={allStatusOptions.find(option => option.value === statusName) || allStatusOptions[0]}
                        onChange={(option) => setStatusName(option?.value || '')}
                        placeholder="All Status"
                        isClearable={false}
                        isSearchable={false}
                        className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Leave it as All Status to download every status.
                    </p>
                </div>

                {/* Include item details */}
                <div className="rounded-lg border border-gray-200 px-4 py-3">
                    <Switch
                        label="Include item details"
                        checked={includeChild}
                        onChange={setIncludeChild}
                        position="left"
                        className="w-full justify-between"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        {includeChild
                            ? 'The file contains one row per item, including quantity and line details.'
                            : 'The file contains one row per Transfer Order, without item details.'}
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-start gap-3">
                            <MdCheckCircle className="w-5 h-5 text-green-600 flex-none mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">Your file is ready</p>
                                <p className="text-xs text-green-700 mt-0.5 break-all">{result.fileName}</p>
                            </div>
                            <a
                                href={result.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={result.fileName}
                                className="flex-none inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                                <MdFileDownload size={18} />
                                Download
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200">
                <Button type="button" onClick={handleClose} variant="outline" size="sm">
                    {result ? 'Close' : 'Cancel'}
                </Button>
                <Button
                    type="button"
                    onClick={submit}
                    disabled={!isRangeValid || loading}
                    size="sm"
                    className={`flex items-center gap-2 ${(!isRangeValid || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <MdFileDownload size={18} />
                    {loading ? 'Preparing file...' : 'Process Download'}
                </Button>
            </div>
        </Modal>
    );
};

export default ExportExcelModal;
