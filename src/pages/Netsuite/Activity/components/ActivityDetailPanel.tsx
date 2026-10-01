import { memo } from 'react';
import { ActivityItem } from '../types/activity';
import { getRecordCount } from '../utils/activityFormat';
import JsonPanel from './JsonPanel';

interface ActivityDetailPanelProps {
    data?: ActivityItem;
    width?: number;
    loading?: boolean;
    error?: string | null;
}

const ActivityDetailPanel = ({ data, width, loading, error }: ActivityDetailPanelProps) => {
    const recordCount = data ? getRecordCount(data) : null;

    return (
        <div
            style={width ? { width: `${width}px` } : undefined}
            className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 p-3 bg-gray-50 border-t border-gray-200 sticky left-0"
        >
            {loading ? (
                <div className="col-span-full py-8 text-center text-sm text-gray-500">Loading activity detail...</div>
            ) : error ? (
                <div className="col-span-full py-8 text-center text-sm text-red-600">{error}</div>
            ) : data ? (
                <>
                    <JsonPanel
                        direction="request"
                        title="Request Payload"
                        value={data.payload}
                        copyLabel="Copy Payload"
                    />
                    <JsonPanel
                        direction="response"
                        title="Response Body"
                        summary={recordCount === null ? undefined : `${recordCount} records`}
                        value={data.response}
                        copyLabel="Copy Response"
                    />
                </>
            ) : null}
        </div>
    );
};

export default memo(ActivityDetailPanel);
