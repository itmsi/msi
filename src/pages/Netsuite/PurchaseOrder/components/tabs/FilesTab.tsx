import React, { useMemo, useState } from 'react';
import { AttachFileItem, PurchaseOrderForm } from '../../types/purchaseorder';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import { FaExternalLinkAlt, FaPaperclip, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';

interface AttachFileItemLocal extends AttachFileItem {
    isNew?: boolean;
    isEdited?: boolean;
}

interface FilesTabProps {
    formData: PurchaseOrderForm;
    fileList: AttachFileItem[];
    pendingFiles?: AttachFileItem[];
    deletedFileUrls?: string[];
    isLoading: boolean;
    onAddFiles?: (files: AttachFileItem[]) => void;
}

const emptyEntry: AttachFileItem = { fileUrl: '', fileName: '' };

const FilesTab: React.FC<FilesTabProps> = ({
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

    const handleAddEntry = () => {
        if (!entry.fileUrl.trim()) {
            setEntryError('File URL is required');
            return;
        }
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

        if (editingFile) {
            // Mode edit: ganti entry lama
            if (editingFile.isNew) {
                const updated = newFiles.map(dataAttach =>
                    dataAttach.fileUrl === editingFile.fileUrl && dataAttach.fileName === editingFile.fileName
                        ? { ...entry }
                        : dataAttach
                );
                setNewFiles(updated);
                notifyParent(updated, deletedUrls);
            } else {
                // File existing: hapus yang lama, tambahkan sebagai entry baru
                const updatedDeleted = new Set(deletedUrls).add(editingFile.fileUrl);
                const updated = [...newFiles, { ...entry, isEdited: true }];
                setDeletedUrls(updatedDeleted);
                setNewFiles(updated);
                notifyParent(updated, updatedDeleted);
            }
            setEditingFile(null);
        } else {
            const updated = [...newFiles, { ...entry }];
            setNewFiles(updated);
            notifyParent(updated, deletedUrls);
        }

        setEntry(emptyEntry);
        setEntryError('');
    };

    const handleEdit = (row: AttachFileItemLocal) => {
        setEditingFile(row);
        setEntry({ fileUrl: row.fileUrl, fileName: row.fileName });
        setShowForm(true);
        setEntryError('');
    };

    const handleCancelEdit = () => {
        setEditingFile(null);
        setEntry(emptyEntry);
        setEntryError('');
    };

    const handleDelete = (row: AttachFileItemLocal) => {
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
                <div className="mb-4 p-4 border border-blue-200 rounded-xl bg-blue-50">
                    <p className="text-xs font-medium text-blue-700 mb-3">
                        {editingFile ? 'Edit file link' : 'Add file link'}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="flex-1">
                            <input
                                type="url"
                                placeholder="https://..."
                                value={entry.fileUrl}
                                onChange={e => {
                                    setEntry(prev => ({ ...prev, fileUrl: e.target.value }));
                                    if (entryError) setEntryError('');
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
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
                                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-white  min-h-[38px]"
                            >
                                <FaPlus size={10} /> {editingFile ? 'Save' : 'Add'}
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
