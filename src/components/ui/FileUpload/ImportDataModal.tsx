// import React, { useState } from 'react';
// import FileUpload from '@/components/ui/FileUpload/FileUpload';
// import Button from '@/components/ui/button/Button';
// import { MdDownload, MdUpload } from 'react-icons/md';
// import toast from 'react-hot-toast';

// interface ImportDataModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onImport: (file: File) => void;
//     title: string;
//     entityType: string;
// }

// const ImportDataModal: React.FC<ImportDataModalProps> = ({
//     isOpen,
//     onClose,
//     onImport,
//     title,
//     entityType
// }) => {
//     const [importFile, setImportFile] = useState<File | null>(null);
//     const [loading, setLoading] = useState(false);

//     if (!isOpen) return null;

//     const handleImport = async () => {
//         if (!importFile) {
//             toast.error('Please select a file to import');
//             return;
//         }

//         setLoading(true);
//         try {
//             await onImport(importFile);
//             toast.success(`${entityType} data imported successfully!`);
//             setImportFile(null);
//             onClose();
//         } catch (error) {
//             toast.error(`Failed to import ${entityType} data`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const downloadTemplate = () => {
//         // Create sample CSV template
//         const headers = ['name_en', 'name_cn', 'description'];
//         const sampleData = [
//             ['Sample Name EN', 'Sample Name CN', 'Sample description'],
//             ['Another Name EN', 'Another Name CN', 'Another description']
//         ];
        
//         const csvContent = [
//             headers.join(','),
//             ...sampleData.map(row => row.join(','))
//         ].join('\n');

//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `${entityType.toLowerCase()}_template.csv`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);
        
//         toast.success('Template downloaded successfully!');
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 text-2xl"
//                     >
//                         ×
//                     </button>
//                 </div>

//                 <div className="space-y-4">
//                     {/* Download Template */}
//                     <div className="bg-blue-50 p-4 rounded-lg">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h3 className="text-sm font-medium text-blue-900">
//                                     Download Template
//                                 </h3>
//                                 <p className="text-xs text-blue-700 mt-1">
//                                     Get the CSV template with the correct format
//                                 </p>
//                             </div>
//                             <Button
//                                 onClick={downloadTemplate}
//                                 variant="outline"
//                                 size="sm"
//                                 className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-100"
//                             >
//                                 <MdDownload className="w-4 h-4" />
//                                 Template
//                             </Button>
//                         </div>
//                     </div>

//                     {/* File Upload */}
//                     <FileUpload
//                         id="import_file"
//                         name="import_file"
//                         label={`Upload ${entityType} Data`}
//                         accept=".csv"
//                         icon="upload"
//                         acceptedFormats={['csv', '.csv']}
//                         maxSize={5}
//                         currentFile={importFile}
//                         onFileChange={setImportFile}
//                         required
//                         description={`CSV file containing ${entityType.toLowerCase()} data`}
//                         className="mt-4"
//                     />

//                     {/* File Analysis */}
//                     {importFile && (
//                         <div className="bg-green-50 p-4 rounded-lg">
//                             <h3 className="text-sm font-medium text-green-900 mb-2">
//                                 File Analysis
//                             </h3>
//                             <div className="space-y-1 text-xs text-green-700">
//                                 <p>• File size: {(importFile.size / 1024).toFixed(1)} KB</p>
//                                 <p>• File type: {importFile.type || 'text/csv'}</p>
//                                 <p>• Last modified: {new Date(importFile.lastModified).toLocaleDateString()}</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Action Buttons */}
//                     <div className="flex gap-3 pt-4">
//                         <Button
//                             onClick={onClose}
//                             variant="outline"
//                             className="flex-1"
//                             disabled={loading}
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             onClick={handleImport}
//                             disabled={!importFile || loading}
//                             className="flex-1 flex items-center justify-center gap-2"
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                     Importing...
//                                 </>
//                             ) : (
//                                 <>
//                                     <MdUpload className="w-4 h-4" />
//                                     Import Data
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ImportDataModal;