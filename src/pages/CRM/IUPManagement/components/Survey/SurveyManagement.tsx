import React, { useRef, useEffect } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import SurveySummarySection from './SurveySummarySection';
import { useIupSurvey } from '../../hooks/useIupSurvey';
import { SkeletonCard } from './DriveImage';
import { classifyEntry, TYPE_CONFIG, formatDateHeading } from './Surveyutils';
import SurveyEntryCard from './Surveyentrycard';
import Input from '@/components/form/input/InputField';

const SurveyManagement: React.FC = () => {
    const {
        surveys,
        groupedSurveys,
        searchInput,
        setSearchInput,
        handleKeyPress,
        handleClearSearch,
        hasMore,
        loadMore,
        loading,
        loadingMore,
    } = useIupSurvey();

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (observed) => {
                if (observed[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { rootMargin: '250px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, loadMore]);

    return (
    <div className="space-y-6 relative">
        <div className="divide-y divide-slate-300">
            <SurveySummarySection
                surveys={surveys}
                iupId={surveys[0]?.iup_id || ''}
            />
        </div>

        <div className="w-full rounded-2xl bg-white shadow-sm">
            <div className="rounded-t-2xl border-b-2 border-slate-200 px-5 py-4">
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="font-primary-bold text-md tracking-wide">Survey</h2>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                        List of surveys conducted by contractors related to this IUP.
                    </p>
                </div>

                {/* <div className="mt-3 flex max-w-[420px] items-center gap-2 rounded-lg border  bg-white px-3 py-2 shadow-inner">
                    <LuSearch
                        size={15}
                        className="cursor-pointer text-slate-400"
                        onClick={executeSearch}
                    /> */}
                    
                <div className="relative flex-1 mt-3 ">
                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search sales name or report content, then press Enter…"
                        className={`pl-10 py-2 w-full ${searchInput ? 'pr-10' : 'pr-4'}`}
                    />
                    {searchInput && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            type="button"
                        >
                            <LuX className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="relative rounded-b-2xl px-5 py-4">
                    {loading && (
                        <div className="space-y-4 pl-6">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    )}

                    {!loading && groupedSurveys.length === 0 && (
                        <div className="py-16 text-center text-sm text-slate-400">
                            {searchInput ? `No entries match "${searchInput}".` : 'No survey entries yet.'}
                        </div>
                    )}

                    {!loading &&
                        groupedSurveys.map(([dateKey, dayEntries]) => (
                            <div key={dateKey} className="mb-8">
                                <div className="sticky top-0 z-10 mb-3 inline-flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-xs font-secondary font-medium text-white">
                                    {formatDateHeading(dayEntries[0].chat_date)}
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-slate-300" />
                                    <div className="space-y-4">
                                        {dayEntries.map((entry) => {
                                            const cfg = TYPE_CONFIG[classifyEntry(entry)];
                                            return (
                                                <div key={entry.iup_survey_id} className="relative">
                                                    <div
                                                        className={`absolute left-[-21px] top-4 h-[10px] w-[10px] rounded-full border-2 border-white shadow ring-1 ring-slate-300 ${cfg.dot}`}
                                                    />
                                                    <SurveyEntryCard entry={entry} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                    {/* sentinel: triggers fetching the next page when it enters the viewport */}
                    {!loading && <div ref={sentinelRef} style={{ height: 1 }} />}

                    {loadingMore && (
                        <div className="mt-2 space-y-4 pl-6">
                            <SkeletonCard />
                        </div>
                    )}

                    {!loading && !hasMore && surveys.length > 0 && (
                        <div className="py-6 text-center text-xs text-slate-400">— All entries shown —</div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default SurveyManagement;