export function CandidateCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[#EEF0F5]" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 rounded bg-[#EEF0F5]" />
                    <div className="h-2.5 w-1/3 rounded bg-[#EEF0F5]" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-2.5 w-full rounded bg-[#EEF0F5]" />
                <div className="h-2.5 w-4/5 rounded bg-[#EEF0F5]" />
                <div className="h-2.5 w-3/5 rounded bg-[#EEF0F5]" />
            </div>
            <div className="h-8 w-full rounded-lg bg-[#EEF0F5]" />
        </div>
    );
}