import { MdClose, MdOutlineFileDownload, MdOutlineDescription } from 'react-icons/md';

interface ResumeModalProps {
    url: string;
    candidateName: string;
    onClose: () => void;
}

export function ResumeModal({ url, candidateName, onClose }: ResumeModalProps) {
    const downloadUrl = url.startsWith('http') ? `${url}/download` : url;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E9F0]">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1F2430]">
                        <MdOutlineDescription size={16} /> Resume &mdash; {candidateName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={downloadUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E7E9F0] text-[#5B6480] hover:bg-[#F5F6F8]"
                        >
                            <MdOutlineFileDownload size={14} /> Download
                        </a>
                        <button onClick={onClose} title="Close" className="p-2 rounded-full hover:bg-[#F5F6F8] text-[#9AA2BA]">
                            <MdClose size={16} />
                        </button>
                    </div>
                </div>
                <iframe title="resume-preview" src={downloadUrl} className="flex-1 w-full border-0" />
            </div>
        </div>
    );
}
