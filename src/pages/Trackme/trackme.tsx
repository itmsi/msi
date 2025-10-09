import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DateRangePicker } from 'react-date-range';
import { subDays, startOfMonth, subMonths, endOfMonth, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MdCalendarToday, MdExpandMore, MdLocationOn, MdBattery90, MdSignalCellularAlt, MdWifi, MdTableView, MdRefresh } from 'react-icons/md';
import GoogleMapReact from 'google-map-react';
import { apiGet } from '../../helpers/apiHelper';
import { formatDate, formatDateTime } from '../../helpers/generalHelper';
import Input from '../../components/form/input/InputField';
import CustomSelect from '../../components/form/select/CustomSelect';
import CustomDataTable from '../../components/ui/table/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Types for OwnTracks API
interface OwnTracksItem {
    id: number;
    user_id: string;
    device_id: string;
    type: string;
    lat: string;
    lon: string;
    alt: number;
    batt: number;
    acc: number;
    conn: string;
    received_at: string;
    created_at: string;
    updated_at: string;
}

interface OwnTracksPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface OwnTracksResponse {
    status: boolean;
    message: string;
    data: {
        items: OwnTracksItem[];
        pagination: OwnTracksPagination;
    };
}

interface OwnTracksFilters {
    page: number;
    limit: number;
    user_id: string;
    device_id: string;
    type: string;
    start_date: string;
    end_date: string;
}

// TrackMeDateRangePicker Component
interface TrackMeDateRangePickerProps {
    onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const TrackMeDateRangePicker: React.FC<TrackMeDateRangePickerProps> = ({ onDateRangeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState({
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
        key: 'selection'
    });
    const [tempRange, setTempRange] = useState({
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
        key: 'selection'
    });
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleRangeChange = (ranges: any) => {
        const selection = ranges.selection;
        setTempRange(selection);
        // Don't call onDateRangeChange here anymore
    };

    const handleDateRangeApply = () => {
        setSelectedRange(tempRange);
        onDateRangeChange(tempRange.startDate, tempRange.endDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempRange(selectedRange); // Reset temp range to last applied range
        setIsOpen(false);
    };

    const handlePredefinedRangeClick = (range: { startDate: Date; endDate: Date }) => {
        const newRange = {
            startDate: range.startDate,
            endDate: range.endDate,
            key: 'selection'
        };
        setSelectedRange(newRange);
        onDateRangeChange(range.startDate, range.endDate);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatDateRange = () => {
        return `${format(selectedRange.startDate, 'dd MMM yyyy', { locale: id })} - ${format(selectedRange.endDate, 'dd MMM yyyy', { locale: id })}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-hidden focus:ring-3:text-white/30 h-11"
            >
                <div className="flex items-center">
                    <MdCalendarToday className="w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                        {formatDateRange()}
                    </span>
                </div>
                <MdExpandMore className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="flex">
                        {/* Predefined ranges */}
                        {/* <div className="w-48 p-2 border-r border-gray-200">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Quick Select
                            </div>
                            {predefinedRanges.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePredefinedRangeClick(item.range)}
                                    className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div> */}
                        
                        {/* Date picker */}
                        <div>
                            <DateRangePicker
                                ranges={[tempRange]}
                                onChange={handleRangeChange}
                                locale={id}
                                maxDate={new Date()}
                                staticRanges={[]}
                                inputRanges={[]}
                                // moveRangeOnFirstSelection={false}
                                // editableDateInputs={true}
                                // showMonthAndYearPickers={false}
                                // showDateDisplay={false}
                                // months={2}
                                // direction="horizontal"
                            />
                            <div className="flex justify-end gap-2 p-2 border-t border-gray-200 bg-gray-50">
                                <button 
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                    onClick={handleDateRangeApply}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyA6fII2yLHDBXnLoB3vO8EM6mfMJAvVh7g';

// Function to generate color based on user_id
const getUserColor = (userId: string): string => {
    const colors = [
        '#ef4444', // red-500
        '#3b82f6', // blue-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#8b5cf6', // violet-500
        '#ec4899', // pink-500
        '#06b6d4', // cyan-500
        '#84cc16', // lime-500
        '#f97316', // orange-500
        '#6366f1', // indigo-500
        '#14b8a6', // teal-500
        '#eab308', // yellow-500
    ];
    
    // Handle null, undefined, or empty user_id
    if (!userId || userId.length === 0) {
        return colors[0]; // Return default color (red)
    }
    
    // Create a simple hash from user_id
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get color index
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
};

// Map Marker Component
interface MapMarkerProps {
    lat: number;
    lng: number;
    text?: string;
    item: OwnTracksItem;
    onClick?: (item: OwnTracksItem) => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ item, onClick }) => {
    const markerColor = getUserColor(item.user_id);
    
    return (
        <div 
            className="relative cursor-pointer group"
            onClick={() => onClick?.(item)}
        >
            <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{ backgroundColor: markerColor }}
            ></div>
            {/* Tooltip */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div>{item.user_id.split('/')[2] || item.user_id}</div>
                <div>{formatDateTime(item.received_at)}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
            </div>
        </div>
    );
};

// CSS untuk customize date picker
const datePickerStyles = `
    .rdrCalendarWrapper {
        font-size: 13px;
    }
    .rdrDateRangePickerWrapper {
        display: inline-block;
    }
    .rdrStaticRange {
        border: 0;
        cursor: pointer;
        display: block;
        outline: 0;
        border-bottom: 1px solid #eff2f7;
        padding: 0;
        background: #fff;
    }
    .rdrStaticRangeLabel {
        display: block;
        font-size: 14px;
        font-weight: 400;
        color: #33415c;
        padding: 10px 20px;
        text-align: left;
    }
    .rdrStaticRange:hover .rdrStaticRangeLabel, 
    .rdrStaticRange:focus .rdrStaticRangeLabel {
        color: #1f2937;
        background: #f9fafb;
    }
    .rdrSelected .rdrStaticRangeLabel {
        color: #3b82f6;
        font-weight: 600;
        background: #eff6ff;
    }
    .rdrDayToday .rdrDayNumber span:after {
        background: #3b82f6;
    }
    .rdrDayStartEdge, .rdrDayEndEdge, .rdrDayInRange {
        color: #fff;
    }
    .rdrDayStartEdge, .rdrDayEndEdge {
        background: #3b82f6;
    }
    .rdrDayInRange {
        background: #dbeafe;
        color: #1e40af;
    }
    .rdrStartEdge, .rdrEndEdge, .rdrInRange {
        background: #3b82f6;
    }
`;

export default function TrackMe() {
    // Date range state
    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: subDays(new Date(), 7),
        endDate: new Date()
    });

    // Helper function to format date to local ISO string
    const formatToLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // View mode state
    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [selectedItem, setSelectedItem] = useState<OwnTracksItem | null>(null);

    // OwnTracks data state
    const [ownTracksData, setOwnTracksData] = useState<OwnTracksItem[]>([]);
    const [pagination, setPagination] = useState<OwnTracksPagination>({
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    
    // Local input states for debouncing
    const [userIdInput, setUserIdInput] = useState('');
    const [deviceIdInput, setDeviceIdInput] = useState('');
    
    // Debounced values
    const debouncedUserId = useDebounce(userIdInput, 500);
    const debouncedDeviceId = useDebounce(deviceIdInput, 500);
    

    // Initialize filters with proper date format
    const [filters, setFilters] = useState<OwnTracksFilters>(() => {
        const startDate = subDays(new Date(), 7);
        const endDate = new Date();
        
        return {
            page: 1,
            limit: 100,
            user_id: '',
            device_id: '',
            type: '',
            start_date: formatToLocalDate(startDate) + 'T00:00:00+07:00',
            end_date: formatToLocalDate(endDate) + 'T23:59:59+07:00'
        };
    });

    // Type options for filter
    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'location', label: 'Location' },
        { value: 'waypoints', label: 'Waypoints' },
        { value: 'geofences', label: 'Geofences' },
        { value: 'transitions', label: 'Transitions' }
    ];

    // Fetch OwnTracks data
    const API_BASE_URL = import.meta.env.VITE_API_TRACK_BASE_URL;
    const fetchOwnTracksData = useCallback(async (filterParams?: Partial<OwnTracksFilters>) => {
        setIsLoading(true);
        try {
            const allParams = { ...filters, ...filterParams };
            
            // Always include required parameters and date range (default 7 days)
            const params: Record<string, any> = {
                page: allParams.page,
                limit: allParams.limit,
                start_date: allParams.start_date,
                end_date: allParams.end_date
            };
            
            // Only include optional filter parameters if they have values
            if (allParams.user_id && allParams.user_id.trim() !== '') {
                params.user_id = allParams.user_id;
            }
            if (allParams.device_id && allParams.device_id.trim() !== '') {
                params.device_id = allParams.device_id;
            }
            if (allParams.type && allParams.type !== '') {
                params.type = allParams.type;
            }
            
            const response = await apiGet<OwnTracksResponse>(`${API_BASE_URL}/owntracks`, params);
            
            if (response.data.status) {
                setOwnTracksData(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                console.error('Failed to fetch owntracks data:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching owntracks data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const handleDateRangeChange = (startDate: Date, endDate: Date) => {
        setSelectedDateRange({ startDate, endDate });
        
        const newFilters = {
            ...filters,
            start_date: formatToLocalDate(startDate) + 'T00:00:00+07:00',
            end_date: formatToLocalDate(endDate) + 'T23:59:59+07:00',
            page: 1
        };
        setFilters(newFilters);
        fetchOwnTracksData(newFilters);
    };

    // Handle filter changes
    const handleFilterChange = (key: keyof OwnTracksFilters, value: string | number) => {
        const newFilters = {
            ...filters,
            [key]: value,
            page: key !== 'page' ? 1 : Number(value) // Reset to page 1 when changing filters
        };
        setFilters(newFilters);
        fetchOwnTracksData(newFilters);
    };

    // Effect for debounced user_id changes
    useEffect(() => {
        if (filters.user_id !== debouncedUserId) {
            const newFilters = {
                ...filters,
                user_id: debouncedUserId,
                page: 1 // Reset to page 1 when filtering
            };
            setFilters(newFilters);
            fetchOwnTracksData(newFilters);
        }
    }, [debouncedUserId]);

    // Effect for debounced device_id changes
    useEffect(() => {
        if (filters.device_id !== debouncedDeviceId) {
            const newFilters = {
                ...filters,
                device_id: debouncedDeviceId,
                page: 1 // Reset to page 1 when filtering
            };
            setFilters(newFilters);
            fetchOwnTracksData(newFilters);
        }
    }, [debouncedDeviceId]);

    // Handle page change
    const handlePageChange = (page: number) => {
        handleFilterChange('page', page);
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (newPerPage: number) => {
        handleFilterChange('limit', newPerPage);
    };

    // Format coordinates
    const formatCoordinates = (lat: string, lon: string) => {
        return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lon).toFixed(6)}`;
    };

    // Get connection type display
    const getConnectionDisplay = (conn: string) => {
        const connectionTypes: { [key: string]: { label: string; icon: React.ReactNode; color: string } } = {
            'w': { label: 'WiFi', icon: <MdWifi className="w-4 h-4" />, color: 'text-green-600' },
            'm': { label: 'Mobile', icon: <MdSignalCellularAlt className="w-4 h-4" />, color: 'text-blue-600' },
            'o': { label: 'Offline', icon: <MdSignalCellularAlt className="w-4 h-4" />, color: 'text-gray-400' }
        };
        
        const connInfo = connectionTypes[conn] || { label: conn.toUpperCase(), icon: null, color: 'text-gray-600' };
        
        return (
            <div className={`flex items-center gap-1 ${connInfo.color}`}>
                {connInfo.icon}
                <span className="text-xs">{connInfo.label}</span>
            </div>
        );
    };

    // Get battery level display
    const getBatteryDisplay = (batt: number) => {
        const batteryColor = batt > 50 ? 'text-green-600' : batt > 20 ? 'text-yellow-600' : 'text-red-600';
        return (
            <div className={`flex items-center gap-1 ${batteryColor}`}>
                <MdBattery90 className="w-4 h-4" />
                <span className="text-xs">{batt}%</span>
            </div>
        );
    };

    // Table columns
    const columns: TableColumn<OwnTracksItem>[] = [
        // {
        //     name: 'Type',
        //     selector: row => row.type,
        //     cell: (row) => (
        //         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        //             {row.type}
        //         </span>
        //     )
        // },
        // {
        //     name: 'Location',
        //     selector: row => `${row.lat}, ${row.lon}`,
        //     cell: (row) => (
        //         <div className="flex items-center gap-1">
        //             <MdLocationOn className="w-4 h-4 text-red-500" />
        //             <div className="text-xs">
        //                 <div>{formatCoordinates(row.lat, row.lon)}</div>
        //                 <div className="text-gray-500">Alt: {row.alt}m</div>
        //             </div>
        //         </div>
        //     )
        // },
        {
            name: 'User',
            selector: row => row.user_id,
            cell: (row) => {
                const userColor = getUserColor(row.user_id);
                return (
                    <div className="flex items-center gap-2 text-xs">
                        <div 
                            className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: userColor }}
                        ></div>
                        <div>
                            {/* <div className="font-medium">{row.user_id || row.user_id}</div> */}
                            <div className="font-medium">{row.user_id.split('/')[2] || row.user_id}</div>
                            {/* <div className="text-gray-500">{row.device_id}</div> */}
                        </div>
                    </div>
                );
            }
        },
        {
            name: 'Battery',
            selector: row => row.batt,
            center: true,
            cell: (row) => getBatteryDisplay(row.batt)
        },
        {
            name: 'Connection',
            selector: row => row.conn,
            center: true,
            cell: (row) => getConnectionDisplay(row.conn)
        },
        // {
        //     name: 'Accuracy',
        //     selector: row => row.acc,
        //     center: true,
        //     cell: (row) => (
        //         <span className="text-xs">{row.acc}m</span>
        //     )
        // },
        {
            name: 'Received At',
            selector: row => row.received_at,
            cell: (row) => (
                <span className="text-xs">{formatDateTime(row.received_at)}</span>
            )
        }
    ];

    // Calculate map center from data points
    const getMapCenter = () => {
        if (ownTracksData.length === 0) {
            return { lat: -6.2088, lng: 106.8456 }; // Default to Jakarta
        }
        
        const lats = ownTracksData.map(item => parseFloat(item.lat));
        const lngs = ownTracksData.map(item => parseFloat(item.lon));
        
        return {
            lat: lats.reduce((a, b) => a + b, 0) / lats.length,
            lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
        };
    };

    // Get unique users for legend
    const getUniqueUsers = () => {
        const uniqueUsers = Array.from(new Set(ownTracksData.map(item => item.user_id)));
        return uniqueUsers.map(userId => ({
            userId,
            color: getUserColor(userId),
            displayName: userId.split('/')[2] || userId
        }));
    };

    // Handle marker click
    const handleMarkerClick = (item: OwnTracksItem) => {
        setSelectedItem(item);
    };

    // Initial data fetch
    useEffect(() => {
        // Format dates to local timezone for initial load
        const formatToLocalDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const initialFilters = {
            ...filters,
            start_date: formatToLocalDate(selectedDateRange.startDate) + 'T00:00:00+07:00',
            end_date: formatToLocalDate(selectedDateRange.endDate) + 'T23:59:59+07:00'
        };
        setFilters(initialFilters);
        fetchOwnTracksData(initialFilters);
    }, []); // Empty dependency array for initial load only
    
    return (
        <div className="p-6 min-h-screen">
            {/* Custom styles for date picker */}
            <style>{datePickerStyles}</style>
            
            <div className="mb-6">
                
                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow mb-6 px-6 py-6">
                    <div className="border-b border-gray-200 mb-5 pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Track Me - OwnTracks Data
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Monitor and visualize location data from OwnTracks
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Date Range Picker */}
                        {/* <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <TrackMeDateRangePicker onDateRangeChange={handleDateRangeChange} />
                        </div> */}
                        
                        {/* Type Filter */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <CustomSelect
                                options={typeOptions}
                                value={typeOptions.find(option => option.value === filters.type) || typeOptions[0]}
                                onChange={(option) => handleFilterChange('type', option?.value || '')}
                                placeholder="Select type"
                                isClearable={false}
                                isSearchable={false}
                            />
                        </div> */}
                        
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* User ID Filter */}
                        <div>
                            <Input
                                type="text"
                                placeholder="Filter by user"
                                value={userIdInput}
                                onChange={(e) => setUserIdInput(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <TrackMeDateRangePicker onDateRangeChange={handleDateRangeChange} />
                        </div>

                        {/* View Toggle & Refresh Button */}
                        <div className="flex items-end gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-100 rounded-md p-1 h-[47px]">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded text-md transition-colors ${
                                        viewMode === 'table'
                                            ? 'bg-white text-primary shadow-sm font-primary-bold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <MdTableView className="w-4 h-4" />
                                    Table
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded text-md transition-colors ${
                                        viewMode === 'map'
                                            ? 'bg-white text-primary shadow-sm font-primary-bold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <MdLocationOn className="w-4 h-4" />
                                    Map
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Content Area - Table or Map */}
                {viewMode === 'table' ? (
                    /* Data Table */
                    <div className="bg-white rounded-r-md rounded-l-md font-secondary">
                        
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <MdTableView className="w-6 h-6" /> Table View
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {pagination.total} list items found
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <CustomDataTable
                                columns={columns}
                                data={ownTracksData}
                                loading={isLoading}
                                pagination
                                paginationServer
                                paginationTotalRows={pagination.total}
                                paginationPerPage={pagination.limit}
                                paginationDefaultPage={pagination.page}
                                paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleRowsPerPageChange}
                                fixedHeader={true}
                                fixedHeaderScrollHeight="600px"
                                responsive
                                highlightOnHover
                                striped
                                noDataComponent={
                                    <div className="text-center py-8">
                                        <MdLocationOn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No tracking data found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                ) : (
                    /* Google Map */
                    <div className="bg-white rounded-r-md rounded-l-md font-secondary">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <MdLocationOn className="w-5 h-5 text-red-500" />
                                        Location Map View
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {ownTracksData.length} location points on map
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="h-200 w-full rounded-lg overflow-hidden border border-gray-200">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full bg-gray-50">
                                        <MdRefresh className="w-8 h-8 text-gray-400 animate-spin" />
                                        <span className="ml-2 text-gray-500">Loading map data...</span>
                                    </div>
                                ) : ownTracksData.length > 0 ? (
                                    <GoogleMapReact
                                        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
                                        center={getMapCenter()}
                                        defaultZoom={13}
                                        options={{
                                            fullscreenControl: true,
                                            zoomControl: true,
                                            mapTypeControl: true,
                                            streetViewControl: true,
                                        }}
                                    >
                                        {ownTracksData.map((item) => (
                                            <MapMarker
                                                key={item.id}
                                                lat={parseFloat(item.lat)}
                                                lng={parseFloat(item.lon)}
                                                item={item}
                                                onClick={handleMarkerClick}
                                            />
                                        ))}
                                    </GoogleMapReact>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-gray-50">
                                        <div className="text-center">
                                            <MdLocationOn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No location data to display</p>
                                            <p className="text-sm text-gray-400">Try adjusting your filters</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* User Legend */}
                            {ownTracksData.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">User Legend</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {getUniqueUsers().map((user, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                                                    style={{ backgroundColor: user.color }}
                                                ></div>
                                                <span className="text-sm text-gray-700">{user.displayName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Selected Item Info */}
                            {selectedItem && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-blue-900">Selected Location</h4>
                                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600">User:</span>
                                                    <span className="ml-1 font-medium">{selectedItem?.user_id.split('/')[2] || selectedItem.user_id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Device:</span>
                                                    <span className="ml-1 font-medium">{selectedItem.device_id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Coordinates:</span>
                                                    <span className="ml-1 font-medium">{formatCoordinates(selectedItem.lat, selectedItem.lon)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Battery:</span>
                                                    <span className="ml-1 font-medium">{selectedItem.batt}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Accuracy:</span>
                                                    <span className="ml-1 font-medium">{selectedItem.acc}m</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Time:</span>
                                                    <span className="ml-1 font-medium">{formatDateTime(selectedItem.received_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}