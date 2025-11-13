import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    MdSearch, 
    MdBarChart, 
    MdAccountBalance, 
    MdPeople, 
    MdInventory, 
    MdVerified, 
    MdTrendingUp
} from 'react-icons/md';
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { HiSpeakerphone } from "react-icons/hi";
import { useDashboardView } from '../../hooks/powerbi/usePowerBI';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { PowerBIDashboard } from '@/types/powerbi';
import Input from '@/components/form/input/InputField';
import PageMeta from '@/components/common/PageMeta';

const DashboardPowerBI = () => {
    // Local state for immediate UI feedback
    const [activeTab, setActiveTab] = useState<string>('');
    
    const {
        loading,
        loadingMore,
        dashboards,
        pagination,
        categoryOptions,
        filters,
        handleOpenDashboard,
        loadMoreDashboards,
        handleSearchChange,
        handleCategoryChange,
    } = useDashboardView();

    // Custom category change handler with immediate UI feedback
    const handleCategoryChangeImmediate = (categoryId: string) => {
        // Update local state for immediate UI feedback
        setActiveTab(categoryId);
        
        // Call the hook handler which will trigger API call
        handleCategoryChange(categoryId);
    };

    // Check if there are more pages to load
    const hasMore = pagination ? pagination.page < (pagination.totalPages || 0) : false;

    // Initialize infinite scroll
    const { loadingRef } = useInfiniteScroll({
        hasMore,
        loading: loadingMore,
        onLoadMore: loadMoreDashboards,
        threshold: 200
    });

    // Status Badge dengan icon category-specific
    const StatusBadge = ({ category, text = true }: { category: string, text?: boolean }) => {
        const getBadgeStyle = (category: string) => {
            switch (category) {
                case 'Purchasing':
                    return {
                        icon: <LuChartNoAxesCombined className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-blue-100 text-blue-800 border border-blue-200'
                    };
                case 'HCCA':
                    return {
                        icon: <FaMagnifyingGlassChart className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-green-100 text-green-800 border border-green-200'
                    };
                case 'Process Excellence':
                    return {
                        icon: <MdAccountBalance className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-purple-100 text-purple-800 border border-purple-200'
                    };
                case 'Customs & Supply Chain':
                    return {
                        icon: <MdPeople className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-orange-100 text-orange-800 border border-orange-200'
                    };
                case 'ETI':
                    return {
                        icon: <MdInventory className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    };
                case 'Order Management':
                    return {
                        icon: <MdVerified className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-teal-100 text-teal-800 border border-teal-200'
                    };
                case 'Marketing Report':
                    return {
                        icon: <HiSpeakerphone className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-pink-100 text-pink-800 border border-pink-200'
                    };
                case 'Operations Report':
                    return {
                        icon: <MdTrendingUp className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                    };
                default:
                    return {
                        icon: <MdBarChart className={`${text ? 'h-3 w-3' : 'h-5 w-5'}`} />,
                        className: 'bg-gray-100 text-gray-800 border border-gray-200'
                    };
            }
        };

        const { icon, className } = getBadgeStyle(category);

        return (
            <span className={`inline-flex items-center gap-1 ${text ? 'px-2 py-1' : 'p-1'} rounded-md text-xs font-medium ${className}`}>
                {icon}
                {text && category}
            </span>
        );
    };

    // Dashboard Card Component
    const DashboardCard = ({ dashboard, index = 0 }: { dashboard: PowerBIDashboard, index?: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * .05, duration: 0.1, ease: "easeOut" }}
            className="bg-white rounded-lg shadow-sm break-inside-avoid mb-4 bg-gray-200 p-5 rounded-lg group hover:shadow-lg hover:bg-[#0253a5] hover:text-white transition duration-300 overflow-hidden"
            // className="bg-white rounded-lg shadow-sm break-inside-avoid mb-4 bg-gray-200 p-5 rounded-lg group hover:shadow-lg hover:bg-[#0253a5] hover:text-white transition duration-300 overflow-hidden lg:h-[250px] hover:bg-linear-to-r/srgb hover:from-indigo-500 hover:to-teal-400"
        >
            <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 
                            className="text-md lg:text-sm font-normal font-primary-bold text-gray-900 group-hover:text-white leading-tight mb-2 cursor-pointer" 
                            onClick={() => handleOpenDashboard(dashboard.link)}
                        >
                            {dashboard.title}
                        </h3>
                    </div>
                    <div 
                        className="flex gap-2 ml-2"
                    >
                        <StatusBadge category={dashboard.category_name} text={false} />
                    </div>
                </div>
                
                {/* Description */}
                <p 
                    className=" xs:text-[10px] lg:text-xs text-gray-600 mb-4 group-hover:text-white"
                >
                    {dashboard.description}
                </p>

                {/* Category Badge */}
                <div onClick={() => handleOpenDashboard(dashboard.link)} className='cursor-pointer'                >
                    <StatusBadge category={dashboard.category_name} />
                </div>
            </div>
        </motion.div>
    );
    
    return (
    <>
        <PageMeta
            title="Dashboard Power BI - Motor Sights International"
            description="Dashboard Power BI - Motor Sights International"
            image="/motor-sights-international.png"
        />
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                        Power BI Dashboard
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and view your Power BI dashboards
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 flex justify-center">
                <div className="relative lg:w-30/60 w-full">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <MdSearch />
                    </div>
                    <Input
                        placeholder="Search dashboards..."
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 rounded-2xl shadow-none border-0 border-b border-[#fff] shadow-xl"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="p-4 flex w-auto flex-wrap justify-center">
                <div className="inline-flex overflow-x-auto gap-2 bg-gray-100 border border-gray-100 p-1 rounded-lg">
                    {categoryOptions.length > 0 && (
                    <button
                        onClick={() => handleCategoryChangeImmediate('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors transition duration-300 font-secondary min-w-[180px] ${
                            activeTab === '' || filters.category_id === ''
                                ? 'bg-white text-gray-800 font-medium' 
                                : 'text-gray-400 hover:bg-gray-300'
                        }`}
                    >
                        All Categories
                    </button>
                    )}
                    {categoryOptions.filter(option => option.value !== '').map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleCategoryChangeImmediate(option.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium font-secondary transition-colors transition duration-300 min-w-[180px] ${
                                activeTab === option.value || filters.category_id === option.value
                                    ? 'bg-white text-gray-800 font-medium' 
                                    : 'text-gray-400 hover:bg-gray-300'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[...Array(10)].map((_, index) => (
                        <div 
                            key={index} 
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                        >
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-3" />
                                <div className="h-3 bg-gray-200 rounded mb-2" />
                                <div className="h-3 bg-gray-200 rounded mb-4" />
                                <div className="h-6 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dashboard Grid */}
            <AnimatePresence mode='sync'>
                {!loading && (
                    <>
                        <motion.div 
                            className="columns-1 md:columns-3 lg:columns-4 gap-4 pt-4"
                            key="list"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            // variants={formVariants}
                            transition={{ duration: .1 }}
                        >
                            {dashboards.map((dashboard, index) => (
                                <DashboardCard 
                                    key={index}
                                    dashboard={dashboard} 
                                    index={index}
                                />
                            ))}
                        </motion.div>
                        {/* Infinite Scroll Loading Trigger */}
                        <div 
                            ref={loadingRef} 
                            className="h-10 flex items-center justify-center"
                        >
                            {loadingMore && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                                    <span className="text-sm">Loading more dashboards...</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!loading && dashboards.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <LuChartNoAxesCombined className="mx-auto h-16 w-16" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No dashboards found
                    </h3>
                    <p className="text-gray-600">
                        Try adjusting your search criteria or filters.
                    </p>
                </div>
            )}
        </div>
    </>
    );
};

export default DashboardPowerBI;