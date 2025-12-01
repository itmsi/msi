import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/powerbi/usePowerBI";
import { useEmployees } from "@/hooks/useAdministration";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { MdKeyboardArrowLeft, MdSave, MdAdd, MdEdit, MdDeleteOutline } from "react-icons/md";
import { PowerBIDashboard, EmployeeHasPowerBi } from "@/types/powerbi";
import { Employee } from "@/types/administration";
import { TableColumn } from "react-data-table-component";
import CustomSelect from "@/components/form/select/CustomSelect";
import CustomDataTable from "@/components/ui/table";
import WysiwygEditor from "@/components/form/editor";

interface PowerBiFormProps {
    mode: 'create' | 'edit';
    dashboardId?: string;
}

export default function PowerBiForm({ mode, dashboardId }: PowerBiFormProps) {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const {
        loading,
        categoryOptions,
        createDashboard,
        updateDashboard,
        fetchCategories
    } = useDashboard(false);

    const {
        employees,
        isLoading: employeeLoading,
        fetchEmployees
    } = useEmployees(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        category_name: '',
        link: '',
        status: 'active' as 'active' | 'inactive',
        employeeHasPowerBi: [] as EmployeeHasPowerBi[]
    });

    const [currentDashboard, setCurrentDashboard] = useState<PowerBIDashboard | null>(null);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [isMobile] = useState<boolean>(window.innerWidth < 768);

    const isEditMode = mode === 'edit';
    const pageTitle = isEditMode ? 'Edit Dashboard' : 'Create New Dashboard';
    const buttonText = isEditMode ? 'Update Dashboard' : 'Create Dashboard';
    const loadingText = isEditMode ? 'Updating...' : 'Creating...';

    useEffect(() => {
        fetchCategories(1, 100);
        fetchEmployees(1, 1000);
    }, []);

    // Auto-assign current user untuk mode create
    useEffect(() => {
        if (!isEditMode && authState.user?.employee_id) {
            const currentUserId = authState.user.employee_id;
            
            // Check apakah current user sudah ada di access list
            const userExists = formData.employeeHasPowerBi.some(emp => emp.employee_id === currentUserId);
            
            if (!userExists) {
                setFormData(prev => ({
                    ...prev,
                    employeeHasPowerBi: [
                        ...prev.employeeHasPowerBi,
                        { employee_id: currentUserId }
                    ]
                }));
            }
        }
    }, [isEditMode, authState.user?.employee_id]);

    useEffect(() => {
        if (isEditMode && dashboardId) {
            const fetchDashboardData = async () => {
                try {
                    setLoadingDashboard(true);
                    const { dashboardService } = await import('@/services/powerbiService');
                    const response = await dashboardService.getDashboardById(dashboardId);
                    
                    if (response.success && response.data) {
                        const dashboard = response.data;
                        setCurrentDashboard(dashboard);
                        setFormData({
                            title: dashboard.title,
                            description: dashboard.description,
                            category_id: dashboard.category_id,
                            category_name: dashboard.category_name,
                            link: dashboard.link,
                            status: dashboard.status,
                            employeeHasPowerBi: dashboard.employeeHasPowerBi || []
                        });
                    } else {
                        setCurrentDashboard(null);
                    }
                } catch (error) {
                    setCurrentDashboard(null);
                } finally {
                    setLoadingDashboard(false);
                }
            };

            fetchDashboardData();
        }
    }, [isEditMode, dashboardId]);

    // Function untuk memastikan current user otomatis memiliki access
    const ensureCurrentUserAccess = (employeeAccess: EmployeeHasPowerBi[]): EmployeeHasPowerBi[] => {
        const currentUserId = authState.user?.employee_id;
        
        if (!currentUserId) {
            return employeeAccess;
        }

        // Check apakah current user sudah ada dalam access list
        const currentUserExists = employeeAccess.some(emp => emp.employee_id === currentUserId);
        
        if (!currentUserExists) {
            // Auto-assign current user ke access list
            return [
                ...employeeAccess,
                { employee_id: currentUserId }
            ];
        }
        
        return employeeAccess;
    };

    const handleSubmit = async () => {
        // Pastikan current user otomatis memiliki access
        const finalEmployeeAccess = ensureCurrentUserAccess(formData.employeeHasPowerBi);
        
        if (isEditMode && dashboardId) {
            const result = await updateDashboard(dashboardId, {
                title: formData.title,
                description: formData.description,
                category_id: formData.category_id,
                link: formData.link,
                status: formData.status,
                employeeHasPowerBi: finalEmployeeAccess
            });

            if (result.success) {
                navigate('/power-bi/manage');
            }
        } else {
            const result = await createDashboard({
                title: formData.title,
                description: formData.description,
                category_id: formData.category_id,
                link: formData.link,
                status: formData.status,
                employeeHasPowerBi: finalEmployeeAccess
            });

            if (result.success) {
                navigate('/power-bi/manage');
            }
        }
    };

    // Functions for managing employees
    const handleAddEmployee = (selectedOption: { value: string; label: string; } | null) => {
        if (selectedOption && selectedOption.value) {
            const employeeExists = formData.employeeHasPowerBi.some(emp => emp.employee_id === selectedOption.value);
            if (!employeeExists) {
                setFormData(prev => ({
                    ...prev,
                    employeeHasPowerBi: [
                        ...prev.employeeHasPowerBi,
                        { employee_id: selectedOption.value }
                    ]
                }));
            }
        }
    };

    const handleRemoveEmployee = (employeeId: string) => {
        const currentUserId = authState.user?.employee_id;
        
        // Mencegah current user menghapus dirinya sendiri
        if (employeeId === currentUserId) {
            alert('You cannot remove yourself from the access list. You are automatically assigned as the creator.');
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            employeeHasPowerBi: prev.employeeHasPowerBi.filter(emp => emp.employee_id !== employeeId)
        }));
    };

    // Get employees that have access (for table display)
    const getEmployeesWithAccess = () => {
        return formData.employeeHasPowerBi.map(empAccess => {
            const employee = employees.find(emp => emp.employee_id === empAccess.employee_id);
            return employee || null;
        }).filter(Boolean) as Employee[];
    };

    // Get available employees for dropdown (exclude already added)
    const getAvailableEmployees = () => {
        return employees.filter(emp => 
            !formData.employeeHasPowerBi.some(access => access.employee_id === emp.employee_id)
        ).map(emp => ({
            value: emp.employee_id,
            label: emp.employee_name
        }));
    };

    // Show loading state when fetching dashboard data in edit mode
    if (isEditMode && loadingDashboard) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
                    <p className="text-gray-600">Please wait while we fetch the dashboard data...</p>
                </div>
            </div>
        );
    }

    // Show not found for edit mode when dashboard doesn't exist
    if (isEditMode && dashboardId && currentDashboard === null && !loadingDashboard) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Dashboard not found</h2>
                    <p className="text-gray-600 mb-4">The dashboard you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => navigate('/power-bi/manage')}>
                        Back to Manage
                    </Button>
                </div>
            </div>
        );
    }
    
    const columns: TableColumn<Employee>[] = [
        {
            name: 'Employee Name',
            selector: row => row.employee_name,
            grow: 2,
        },
        {
            name: 'Position',
            selector: row => row.title_name || 'N/A',
            omit: isMobile && true
        },
        {
            name: 'Company',
            selector: row => row.company_name || 'N/A',
        },
        {
            name: 'Actions',
            cell: (row: Employee) => {
                const isCurrentUser = row.employee_id === authState.user?.employee_id;
                
                return (
                    <div className="flex items-center gap-2">
                        {isCurrentUser ? (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md font-medium">
                                Creator
                            </span>
                        ) : (
                            <button
                                onClick={() => handleRemoveEmployee(row.employee_id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Remove Access"
                            >
                                <MdDeleteOutline className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            },
            ignoreRowClick: true,
        },
    ];
    return (
        <div className="bg-gray-50 overflow-auto">
            <div className="mx-auto px-4 sm:px-3">
                
                {/* HEADER */}
                <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/power-bi/manage')}
                            className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                        >
                            <MdKeyboardArrowLeft size={20} />
                        </Button>
                        <div className="border-l border-gray-300 h-6 mx-3"></div>
                        {isEditMode ? <MdEdit size={20} className="text-primary" /> : <MdAdd size={20} className="text-green-600" />}
                        <h1 className="ms-2 font-primary-bold font-normal text-xl">{pageTitle}</h1>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-2xl shadow-sm grid lg:grid-cols-3 gap-2 md:gap-2">
                    <div className="lg:col-span-1 p-8 relative space-y-8">
                        <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <CustomSelect
                                    value={categoryOptions.find(option => option.value === formData.category_id) || null}
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            setFormData({
                                                ...formData, 
                                                category_id: selectedOption.value,
                                                category_name: selectedOption.label
                                            });
                                        } else {
                                            setFormData({
                                                ...formData, 
                                                category_id: '',
                                                category_name: ''
                                            });
                                        }
                                    }}
                                    options={categoryOptions.filter(option => option.value !== '')}
                                    className="w-full"
                                    placeholder="Select Category"
                                    isClearable={false}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-700 mb-2">
                                    Title *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Enter title"
                                    className="w-full"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <WysiwygEditor
                                    id="wysiwyg-editor"
                                    label={'Description'}
                                    value={formData.description}
                                    onChange={(content) => setFormData({...formData, description: content})}
                                    placeholder="Select a term condition or start typing..."
                                    minHeight="200px"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PowerBI Dashboard URL *
                                </label>
                                <Input
                                    value={formData.link}
                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                    placeholder="https://app.powerbi.com/view?r=..."
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the public PowerBI dashboard embed URL
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                    Status *
                                </label>
                                <CustomSelect
                                    value={{ 
                                        value: formData.status, 
                                        label: formData.status === 'active' ? 'Active' : 'Inactive' 
                                    }}
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            setFormData({
                                                ...formData, 
                                                status: selectedOption.value as 'active' | 'inactive'
                                            });
                                        }
                                    }}
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' }
                                    ]}
                                    className="w-full"
                                    placeholder="Select Status"
                                    isClearable={false}
                                    isSearchable={false}
                                />
                            </div>
                            
                        </div>
                        <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 mx-3 hidden lg:block"></div>
                    </div>
                    <div className="lg:col-span-2 p-8 lg:ps-0 relative">
                        <div className="space-y-8">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">User Access</h2>
                            
                            {/* Auto-access notification */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 text-sm">ℹ</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Automatic Access Assignment</p>
                                        <p className="mt-1">You will automatically have access to this dashboard as the creator. You cannot remove yourself from the access list.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add Employee
                                </label>
                                <CustomSelect
                                    value={null}
                                    onChange={handleAddEmployee}
                                    options={getAvailableEmployees()}
                                    className="w-full"
                                    placeholder={getAvailableEmployees().length > 0 ? "Select Employee" : "No employees available"}
                                    isClearable={true}
                                    isDisabled={getAvailableEmployees().length === 0}
                                />
                            </div>
                            <div>
                                <h3 className="text-md font-medium text-gray-900 mb-4">Employees with Access ({formData.employeeHasPowerBi.length})</h3>
                                {formData.employeeHasPowerBi.length > 0 ? (
                                    <div className="font-secondary">
                                    <CustomDataTable
                                        columns={columns}
                                        data={getEmployeesWithAccess()}
                                        loading={employeeLoading}
                                        pagination={false}
                                        
                                    />
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <div className="text-gray-400 mb-2">
                                            <MdAdd size={48} className="mx-auto mb-2" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No employees with access</p>
                                        <p className="text-gray-400 text-sm">Add employees from the dropdown above to grant dashboard access</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex md:col-span-3 justify-end gap-4 p-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/power-bi/manage')}
                            className="px-6 rounded-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!formData.title || !formData.category_id || !formData.link || loading}
                            className="px-6 flex items-center gap-2 rounded-full"
                        >
                            <MdSave size={20} />
                            {loading ? loadingText : buttonText}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}