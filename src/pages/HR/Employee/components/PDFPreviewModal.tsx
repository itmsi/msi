import { MdClose, MdOutlineFileDownload, MdOutlinePictureAsPdf } from 'react-icons/md';

interface PDFPreviewModalProps {
    url: string;
    fileName: string;
    title: string;
    onClose: () => void;
}

export function PDFPreviewModal({ url, fileName, title, onClose }: PDFPreviewModalProps) {
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
                        <MdOutlinePictureAsPdf size={16} /> {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            download={fileName}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E7E9F0] text-[#5B6480] hover:bg-[#F5F6F8]"
                        >
                            <MdOutlineFileDownload size={14} /> Download
                        </a>
                        <button onClick={onClose} title="Close" className="p-2 rounded-full hover:bg-[#F5F6F8] text-[#9AA2BA]">
                            <MdClose size={16} />
                        </button>
                    </div>
                </div>
                <iframe title="pdf-preview" src={url} className="flex-1 w-full border-0" />
            </div>
        </div>
    );
}
