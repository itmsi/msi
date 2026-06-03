import React, { useMemo, useRef, useState } from 'react';
import { AttachFileItem, PurchaseOrderForm } from '../../types/purchaseorder';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import { FaExternalLinkAlt, FaPaperclip, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router';
import Button from '@/components/ui/button/Button';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { PurchaseOrderService } from '../../services/purchaseOrderService';
import toast from 'react-hot-toast';

import { FaFileExcel, FaFilePowerpoint, FaFileWord, FaRegFile, FaRegFilePdf } from 'react-icons/fa6';

interface AttachFileItemLocal extends AttachFileItem {
    isNew?: boolean;
    isEdited?: boolean;
}

interface FilesTabProps {
    formData: PurchaseOrderForm;
    poId?: string | number;
    fileList: AttachFileItem[];
    pendingFiles?: AttachFileItem[];
    deletedFileUrls?: string[];
    isLoading: boolean;
    onAddFiles?: (files: AttachFileItem[]) => void;
}

const emptyEntry: AttachFileItem = { po_id: '', fileUrl: '', fileName: '' };

// Get document icon based on file type
const getDocumentIcon = (fileName: string) => {
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.endsWith('.pdf')) {
        return <FaRegFilePdf />;
    } else if (lowerFileName.endsWith('.doc') || lowerFileName.endsWith('.docx')) {
        return <FaFileWord />;
    } else if (lowerFileName.endsWith('.xls') || lowerFileName.endsWith('.xlsx')) {
        return <FaFileExcel />;
    } else if (lowerFileName.endsWith('.ppt') || lowerFileName.endsWith('.pptx')) {
        return <FaFilePowerpoint />;
    } else {
        return <FaRegFile />;
    }
};
const FilesTab: React.FC<FilesTabProps> = ({
    poId,
    fileList,
    pendingFiles = [],
    deletedFileUrls = [],
    isLoading,
    onAddFiles,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [newFiles, setNewFiles] = useState<AttachFileItemLocal[]>(pendingFiles);
    const [deletedUrls, setDeletedUrls] = useState<Set<string>>(new Set(deletedFileUrls));
    const [entry, setEntry] = useState<AttachFileItem>(emptyEntry);
    const [editingFile, setEditingFile] = useState<AttachFileItemLocal | null>(null);
    const [entryError, setEntryError] = useState('');

    const fileAttachRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.doc', '.docx', '.pdf'];
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
        if (!allowedExtensions.includes(ext)) {
            setEntryError(`Format tidak didukung. Gunakan: ${allowedExtensions.join(', ')}`);
            e.target.value = '';
            return;
        }

        if (file.size > maxFileSize) {
            setEntryError('Ukuran file maksimal 50MB');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setFileName(file.name);
        setEntryError('');
    };

    // Gabungkan file dari server (minus yang dihapus) + file baru dengan flag isNew
    const allFiles: AttachFileItemLocal[] = useMemo(() => [
        ...fileList.filter(f => !deletedUrls.has(f.fileUrl)).map(f => ({ ...f, isNew: false })),
        ...newFiles.map(f => ({ ...f, isNew: true })),
    ], [fileList, newFiles, deletedUrls]);

    // Helper: kirim list lengkap (existing non-deleted + new) ke parent
    const notifyParent = (updatedNewFiles: AttachFileItem[], updatedDeletedUrls: Set<string>) => {
        const existingFiles = fileList.filter(f => !updatedDeletedUrls.has(f.fileUrl));
        onAddFiles?.([...existingFiles, ...updatedNewFiles]);
    };

    const handleAddEntry = async () => {
        if (!entry.fileName.trim()) {
            setEntryError('File Name is required');
            return;
        }

        // Cek duplikat: fileUrl dan fileName sama dengan yang sudah ada
        const isDuplicate = allFiles.some(
            f => f.fileUrl === entry.fileUrl.trim() && f.fileName === entry.fileName.trim()
                && !(editingFile && f.fileUrl === editingFile.fileUrl && f.fileName === editingFile.fileName)
        );
        if (isDuplicate) {
            setEntryError('A file with the same URL and name already exists');
            return;
        }

        // Cek nama file sudah dipakai
        const isDuplicateName = allFiles.some(
            f => f.fileName.trim().toLowerCase() === entry.fileName.trim().toLowerCase()
                && !(editingFile && f.fileUrl === editingFile.fileUrl && f.fileName === editingFile.fileName)
        );
        if (isDuplicateName) {
            setEntryError('File Name already in use, please choose a different name');
            return;
        }


        if (!selectedFile) {
            setEntryError('Pilih file terlebih dahulu');
            return;
        }

        setIsUploading(true);
        try {
            if (poId && editingFile) {
                // Mode edit file yang sudah ada di server
                const res = await PurchaseOrderService.attachFilePOUpdate({
                    file: selectedFile,
                    poId: String(poId),
                    file_name: entry.fileName,
                    fileUrl: editingFile.fileUrl ?? 'kosong',
                });

                if (res.success) {
                    const updatedEntry: AttachFileItem = {
                        po_id: String(poId),
                        fileUrl: res.data.fileUrl,
                        fileName: res.data.fileName,
                    };
                    if (editingFile.isEdited) {
                        // Edit ulang file yang sudah di-edit sebelumnya (ada di newFiles)
                        const updated = newFiles.map(item =>
                            item.fileUrl === editingFile.fileUrl && item.fileName === editingFile.fileName
                                ? { ...updatedEntry, isEdited: true }
                                : item
                        );
                        setNewFiles(updated);
                        notifyParent(updated, deletedUrls);
                    } else {
                        // Edit file dari server: tandai url lama sebagai deleted, masukkan yang baru ke newFiles
                        const updatedDeleted = new Set(deletedUrls).add(editingFile.fileUrl ?? '');
                        const updated = [...newFiles, { ...updatedEntry, isEdited: true }];
                        setDeletedUrls(updatedDeleted);
                        setNewFiles(updated);
                        notifyParent(updated, updatedDeleted);
                    }
                    toast.success('File berhasil diupdate');
                    setShowForm(false);
                    setEntryError('');
                    setFileName('');
                } else {
                    toast.error(res.message || 'Gagal mengupdate file');
                }
                setEditingFile(null);
            } else {
                // Mode tambah file baru (dengan atau tanpa poId)
                const res = await PurchaseOrderService.attachFilePO({
                    file: selectedFile,
                    file_name: entry.fileName,
                    po_id: String(poId ?? 'temp-' + Date.now()),
                });

                if (res.success) {
                    const uploadedEntry: AttachFileItem = {
                        po_id: res.poId,
                        fileUrl: res.fileUrl,
                        fileName: res.fileName,
                    };
                    const updated = [...newFiles, { ...uploadedEntry, isNew: true }];
                    setNewFiles(updated);
                    notifyParent(updated, deletedUrls);
                    setSelectedFile(null);
                    setFileName('');
                    if (fileAttachRef.current) fileAttachRef.current.value = '';
                    toast.success('File berhasil diupload');
                    setShowForm(false);
                    setEntryError('');
                    setFileName('');
                } else {
                    toast.error(res.message || 'Gagal mengupload file');
                }
            }
        } finally {
            setIsUploading(false);
        }

        setEntry(emptyEntry);
        setEntryError('');
    };

    const handleEdit = (row: AttachFileItemLocal) => {
        setEditingFile(row);
        setEntry({ po_id: row.po_id ?? '', fileUrl: row.fileUrl, fileName: row.fileName });
        setShowForm(true);
        setEntryError('');
    };

    const handleCancelEdit = () => {
        setEditingFile(null);
        setEntry(emptyEntry);
        setEntryError('');
    };

    const handleDelete = async (row: AttachFileItemLocal) => {
        setLoadingDelete(true);
        try {
            const res = await PurchaseOrderService.attachFilePODelete({ fileUrl: row.fileUrl });
            if (res.success) {
                if (row.isNew) {
                    const updated = newFiles.filter(
                        f => !(f.fileUrl === row.fileUrl && f.fileName === row.fileName)
                    );
                    setNewFiles(updated);
                    notifyParent(updated, deletedUrls);
                } else {
                    const updatedDeleted = new Set(deletedUrls).add(row.fileUrl);
                    setDeletedUrls(updatedDeleted);
                    notifyParent(newFiles, updatedDeleted);
                }
                toast.success('File berhasil dihapus');
                setLoadingDelete(false);
            } else {
                toast.error(res.message || 'Gagal menghapus file');
            }
        } catch {
            toast.error('Gagal menghapus file');
        }
    };

    const columns: TableColumn<AttachFileItemLocal>[] = [
        {
            name: 'File Name',
            selector: row => row.fileName || '-',
            cell: row => (
                <div className="flex items-center gap-2 py-1">
                    <Link
                        to={row.fileUrl}
                        target="_blank"
                        className="flex text-blue-400 hover:underline items-center"
                    >
                        <FaExternalLinkAlt className='me-1' size={12} /> {row.fileName || '-'}
                    </Link>
                    {row.isNew && !row.isEdited && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                            New
                        </span>
                    )}
                    {row.isEdited && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                            Edited
                        </span>
                    )}
                </div>
            ),
            wrap: true,
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEdit,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Hapus',
                permission: 'delete',
                width: '150px',
                disable: () => loadingDelete
            }
        ])
    ];

    return (
        <div className="p-6 font-secondary">
            <Button
                onClick={() => setShowForm(prev => !prev)}
                type="button"
                className="flex items-center gap-2 bg-blue-500 hover:text-white hover:bg-blue-600 ring-blue-800 rounded-xl text-xs p-3 mb-4"
            >
                <FaPaperclip />
                <span>Attach Files</span>
            </Button>

            {showForm && (
                <div className={`mb-4 p-4 border rounded-xl ${editingFile ? 'bg-yellow-50 border-amber-200' : 'border-blue-200 bg-blue-50'}`}>
                    <p className="text-xs font-medium text-blue-700 mb-3">
                        {editingFile ? 'Edit file link' : 'Add file link'}
                    </p>
                    {/* fileUrl — tampil sebagai link saat mode edit */}
                    {editingFile && entry.fileUrl && (
                        <div className="flex gap-1 mb-2">
                            <span className="text-xs text-gray-500">File saat ini</span>
                            <a
                                href={entry.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-500 hover:underline truncate max-w-[200px]"
                                title={entry.fileUrl}
                            >
                                <FaExternalLinkAlt size={10} />
                                <span className="truncate">{entry.fileName || entry.fileUrl}</span>
                            </a>
                        </div>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        
                        {/* File picker — selalu tampil, baik add maupun edit */}
                        <div className="flex flex-col gap-1">
                            <input
                                ref={fileAttachRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="po-file-upload"
                            />
                            <label
                                htmlFor="po-file-upload"
                                className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 min-h-[38px]"
                            >
                                <FaPaperclip size={12} />
                                <span className="truncate max-w-[160px]">
                                    {fileName || 'Pilih file...'}
                                </span>
                            </label>
                            {fileName && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="text-lg">{getDocumentIcon(fileName)}</span>
                                    <span className="truncate max-w-[160px]" title={fileName}>{fileName}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="File Name"
                                value={entry.fileName}
                                onChange={e => {
                                    setEntry(prev => ({ ...prev, fileName: e.target.value }));
                                    if (entryError) setEntryError('');
                                }}
                                onKeyDown={e => e.key === 'Enter' && handleAddEntry()}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex gap-1 self-start">
                            <Button
                                type="button"
                                onClick={handleAddEntry}
                                disabled={isUploading}
                                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-white min-h-[38px] disabled:opacity-60"
                            >
                                <FaPlus size={10} /> {isUploading ? 'Uploading...' : editingFile ? 'Save' : 'Add'}
                            </Button>
                            {editingFile && (
                                <Button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-gray-300 min-h-[38px]"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                    {entryError && (
                        <p className="mt-1 text-xs text-red-500">{entryError}</p>
                    )}
                </div>
            )}

            <CustomDataTable
                columns={columns}
                data={allFiles}
                pagination={false}
                loading={isLoading}
                fixedHeader
                fixedHeaderScrollHeight="500px"
                highlightOnHover
                persistTableHead
                responsive
                borderRadius="8px"
            />
        </div>
    );
};

export default FilesTab;
