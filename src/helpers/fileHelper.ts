import toast from 'react-hot-toast';

/**
 * Downloads a file from the server with authentication
 * @param fileName - Name of the file to download
 * @param filePath - Optional custom file path (defaults to 'uploads/documents')
 * @returns Promise<boolean> - Success status
 */
export const downloadFile = async (
    fileName: string, 
    filePath: string = 'uploads/documents'
): Promise<boolean> => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error('Authentication required');
            return false;
        }
        
        // Show loading toast
        const loadingToast = toast.loading('Preparing download...');
        
        // Fetch file with authentication
        const response = await fetch(`${API_BASE_URL}/${filePath}/${fileName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the blob data
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        // Show success message
        toast.success('File downloaded successfully', { id: loadingToast });
        
        return true;
        
    } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('Failed to download file. Please try again.');
        return false;
    }
};

/**
 * Opens a file in a new tab for viewing
 * @param fileName - Name of the file to view
 * @param filePath - Optional custom file path (defaults to 'uploads/documents')
 * @returns boolean - Success status
 */
export const viewFile = (
    fileName: string, 
    filePath: string = 'uploads/documents'
): boolean => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error('Authentication required');
            return false;
        }
        
        // For viewing, we'll open in new tab with token in URL params for simple cases
        // Note: For production, you might want to use a more secure method
        const fileUrl = `${API_BASE_URL}/${filePath}/${fileName}?token=${token}`;
        
        // Open file in new tab for viewing
        const newWindow = window.open(fileUrl, '_blank');
        
        if (!newWindow) {
            toast.error('Please allow pop-ups to view files');
            return false;
        }
        
        toast.success('File opened in new tab');
        return true;
        
    } catch (error) {
        console.error('Error viewing file:', error);
        toast.error('Failed to view file. Please try again.');
        return false;
    }
};

/**
 * Downloads multiple files as a zip
 * @param fileNames - Array of file names to download
 * @param zipName - Name for the zip file (optional)
 * @returns Promise<boolean> - Success status
 */
export const downloadMultipleFiles = async (
    fileNames: string[],
    zipName?: string
): Promise<boolean> => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error('Authentication required');
            return false;
        }
        
        if (fileNames.length === 0) {
            toast.error('No files selected');
            return false;
        }
        
        // Show loading toast
        const loadingToast = toast.loading('Preparing files for download...');
        
        // Create request body
        const requestBody = {
            files: fileNames,
            zipName: zipName || `files_${Date.now()}.zip`
        };
        
        // Request zip creation from server
        const response = await fetch(`${API_BASE_URL}/api/files/download-zip`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the zip blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = requestBody.zipName;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        // Show success message
        toast.success(`${fileNames.length} files downloaded successfully`, { id: loadingToast });
        
        return true;
        
    } catch (error) {
        console.error('Error downloading multiple files:', error);
        toast.error('Failed to download files. Please try again.');
        return false;
    }
};

/**
 * Checks if a file exists on the server
 * @param fileName - Name of the file to check
 * @param filePath - Optional custom file path (defaults to 'uploads/documents')
 * @returns Promise<boolean> - File exists status
 */
export const checkFileExists = async (
    fileName: string,
    filePath: string = 'uploads/documents'
): Promise<boolean> => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        
        if (!token) {
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/${filePath}/${fileName}`, {
            method: 'HEAD',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        return response.ok;
        
    } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
    }
};
