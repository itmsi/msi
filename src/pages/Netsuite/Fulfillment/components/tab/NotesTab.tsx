import { FulfillmentUserNote } from '../../types/fulfillment';

interface NotesTabProps {
    notes: FulfillmentUserNote[];
}

export default function NotesTab({ notes }: NotesTabProps) {
    return (
        <div className="p-6 space-y-4">
            {notes.length > 0 ? notes.map((note, idx) => (
                <div key={idx} className="text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{note.author || '-'}</span>
                        <span className="text-xs text-gray-500">{note.date || '-'}</span>
                    </div>
                    <p className="mt-1 text-gray-600">{note.note || '-'}</p>
                </div>
            )) : (
                <div className="text-center py-8 text-gray-500">No notes found</div>
            )}
        </div>
    );
}
