import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/select/CustomSelect";
import { MdArrowBack, MdEdit, MdKeyboardArrowLeft, MdSave, MdExpandMore, MdExpandLess } from "react-icons/md";
import LoadingSpinner from "@/components/common/Loading";
import PageMeta from "@/components/common/PageMeta";
import { useDropdownData, useEmployeeDetail } from "@/hooks/useAdministration";
import { EmployeePermissionDetail, EmployeeMenuPermission, EmployeeSystemPermission } from "@/types/administration";
import Switch from "@/components/form/switch/Switch";
import TextArea from "@/components/form/input/TextArea";

export default function EditEmployee() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // Hooks for employee detail
    const { 
        employee, 
        setEmployee,
        isLoading, 
        error, 
        fetchEmployee,
        updateEmployee,
        formData,
        setFormData,
        validationErrors,
        isUpdating
    } = useEmployeeDetail();

    // Hooks for dropdown options
    const { 
        companies, 
        fetchCompanies,
        departments, 
        fetchDepartmentsByCompany,
        positions, 
        fetchPositionsByDepartment 
    } = useDropdownData();

    // State for dropdown options
    const [departmentOptions, setDepartmentOptions] = useState<Array<{value: string, label: string}>>([]);
    const [positionOptions, setPositionOptions] = useState<Array<{value: string, label: string}>>([]);
    const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);
    
    // State for accordion expansion
    const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());
    const [hasInitiallyExpanded, setHasInitiallyExpanded] = useState(false);

    // Fetch employee details on component mount
    useEffect(() => {
        if (id) {
            fetchEmployee(id);
        }
    }, [id]);

    // Auto-expand first system when employee data loads (only once)
    useEffect(() => {
        if (employee && employee.permission_detail && employee.permission_detail.length > 0 && !hasInitiallyExpanded) {
            const firstSystemId = employee.permission_detail[0].system_id;
            setExpandedSystems(new Set([firstSystemId]));
            setHasInitiallyExpanded(true);
        }
    }, [employee?.permission_detail, hasInitiallyExpanded]);

    // Load companies when component mounts
    useEffect(() => {
        fetchCompanies(1, 1000);
    }, [fetchCompanies]);

    // Fetch departments when company is selected
    useEffect(() => {
        if (formData.company_id) {
            fetchDepartmentsByCompany(formData.company_id);
        } else {
            setDepartmentOptions([]);
        }
    }, [formData.company_id, fetchDepartmentsByCompany]);

    // Fetch positions when department is selected
    useEffect(() => {
        if (formData.department_id) {
            fetchPositionsByDepartment(formData.department_id);
        } else {
            setPositionOptions([]);
        }
    }, [formData.department_id, fetchPositionsByDepartment]);

    // Update company options when companies data changes
    useEffect(() => {
        const options = companies.map(company => ({
            value: company.company_id.toString(),
            label: company.company_name
        }));
        setCompanyOptions(options);
    }, [companies]);

    // Update department options when departments data changes
    useEffect(() => {
        const options = departments.map(dept => ({
            value: dept.department_id.toString(),
            label: dept.department_name
        }));
        setDepartmentOptions(options);
    }, [departments]);

    // Update position options when positions data changes
    useEffect(() => {
        const options = positions.map(position => ({
            value: position.title_id.toString(),
            label: position.title_name
        }));
        setPositionOptions(options);
    }, [positions]);

    // Form input handlers
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));

        // Clear department and position when company changes
        if (field === 'company_id') {
            setFormData((prev: any) => ({
                ...prev,
                [field]: value,
                department_id: '',
                title_id: ''
            }));
        }

        // Clear position when department changes
        if (field === 'department_id') {
            setFormData((prev: any) => ({
                ...prev,
                [field]: value,
                title_id: ''
            }));
        }
    };

    // Function to filter and sort permissions by CRUD order only
    const sortPermissionsByCRUD = (permissions: EmployeePermissionDetail[]) => {
        // Define CRUD order mapping - only include CRUD permissions
        const crudOrderMap: { [key: string]: number } = {
            'write': 1,     // Create
            'create': 1,    // Create alternative
            'read': 2,      // Read
            'view': 2,      // Read alternative
            'edit': 3,      // Update
            'update': 3,    // Update alternative
            'delete': 4,    // Delete
            'remove': 4     // Delete alternative
        };
        
        // First filter to only include CRUD permissions
        const crudPermissions = permissions.filter(permission => {
            const permissionName = permission.permission_name.toLowerCase();
            return Object.keys(crudOrderMap).some(key => permissionName.includes(key));
        });
        
        // Then sort the filtered CRUD permissions
        return crudPermissions.sort((a, b) => {
            // Get priority for permission a
            let aPriority = 999;
            for (const [key, priority] of Object.entries(crudOrderMap)) {
                if (a.permission_name.toLowerCase().includes(key)) {
                    aPriority = priority;
                    break;
                }
            }
            
            // Get priority for permission b
            let bPriority = 999;
            for (const [key, priority] of Object.entries(crudOrderMap)) {
                if (b.permission_name.toLowerCase().includes(key)) {
                    bPriority = priority;
                    break;
                }
            }
            
            // If priorities are different, sort by priority
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            // If same priority, sort alphabetically
            return a.permission_name.localeCompare(b.permission_name);
        });
    };

    // Toggle accordion expansion
    const toggleSystemExpansion = (systemId: string) => {
        setExpandedSystems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(systemId)) {
                newSet.delete(systemId);
            } else {
                newSet.add(systemId);
            }
            return newSet;
        });
    };

    // Check if all permissions in system are checked
    const isSystemAllChecked = (systemId: string): boolean => {
        if (!employee) return false;
        
        const system = employee.permission_detail.find(sys => sys.system_id === systemId);
        if (!system) return false;

        return system.permission_detail.every(menu => 
            menu.permission_detail.every(permission => permission.permission_status)
        );
    };

    // Toggle all permissions in a system
    const toggleSystemAllPermissions = (systemId: string, checked?: boolean) => {
        if (!employee) return;

        const newStatus = checked !== undefined ? checked : !isSystemAllChecked(systemId);

        const updatedEmployee = {
            ...employee,
            permission_detail: employee.permission_detail.map((system: EmployeeSystemPermission) => {
                if (system.system_id === systemId) {
                    return {
                        ...system,
                        permission_detail: system.permission_detail.map((menu: EmployeeMenuPermission) => ({
                            ...menu,
                            permission_detail: menu.permission_detail.map((permission: EmployeePermissionDetail) => ({
                                ...permission,
                                permission_status: newStatus
                            }))
                        }))
                    };
                }
                return system;
            })
        };

        setEmployee(updatedEmployee);
    };

    // Permission change handler with CRUD logic
    const handlePermissionChange = (systemId: string, menuId: string, permissionId: string, checked: boolean) => {
        if (!employee) return;

        // Find the system, menu, and permission
        const currentSystem = employee.permission_detail.find(system => system.system_id === systemId);
        const currentMenu = currentSystem?.permission_detail.find(menu => menu.menu_id === menuId);
        const currentPermission = currentMenu?.permission_detail.find(perm => perm.permission_id === permissionId);
        
        if (!currentPermission) return;

        const permissionName = currentPermission.permission_name.toLowerCase();
        
        // Determine if this is a CRUD permission
        const isCUD = permissionName.includes('write') || permissionName.includes('create') || 
                     permissionName.includes('edit') || permissionName.includes('update') || 
                     permissionName.includes('delete') || permissionName.includes('remove');
        
        const isRead = permissionName.includes('read') || permissionName.includes('view');

        // Update the employee's permission_detail
        const updatedEmployee = {
            ...employee,
            permission_detail: employee.permission_detail.map((system: EmployeeSystemPermission) => {
                if (system.system_id === systemId) {
                    return {
                        ...system,
                        permission_detail: system.permission_detail.map((menu: EmployeeMenuPermission) => {
                            if (menu.menu_id === menuId) {
                                let updatedPermissions = menu.permission_detail.map((permission: EmployeePermissionDetail) => {
                                    if (permission.permission_id === permissionId) {
                                        return {
                                            ...permission,
                                            permission_status: checked
                                        };
                                    }
                                    return permission;
                                });

                                // Apply CRUD logic
                                if (checked && isCUD) {
                                    // If checking Create/Update/Delete, automatically check Read
                                    updatedPermissions = updatedPermissions.map(permission => {
                                        const pName = permission.permission_name.toLowerCase();
                                        if (pName.includes('read') || pName.includes('view')) {
                                            return {
                                                ...permission,
                                                permission_status: true
                                            };
                                        }
                                        return permission;
                                    });
                                } else if (!checked && isRead) {
                                    // If unchecking Read, automatically uncheck Create/Update/Delete
                                    updatedPermissions = updatedPermissions.map(permission => {
                                        const pName = permission.permission_name.toLowerCase();
                                        if (pName.includes('write') || pName.includes('create') || 
                                            pName.includes('edit') || pName.includes('update') || 
                                            pName.includes('delete') || pName.includes('remove')) {
                                            return {
                                                ...permission,
                                                permission_status: false
                                            };
                                        }
                                        return permission;
                                    });
                                }

                                return {
                                    ...menu,
                                    permission_detail: updatedPermissions
                                };
                            }
                            return menu;
                        })
                    };
                }
                return system;
            })
        };

        // Update the employee state with new permissions
        setEmployee(updatedEmployee);
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id || !employee) return;

        // Combine form data with permission data
        const submitData = {
            ...formData,
            permission_detail: employee.permission_detail
        };

        await updateEmployee(id, submitData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link to="/employees">
                        <Button variant="outline">
                            <MdArrowBack className="w-4 h-4 mr-2" />
                            Back to Employees
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">Employee Not Found</h2>
                    <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
                    <Link to="/employees">
                        <Button variant="outline">
                            <MdArrowBack className="w-4 h-4 mr-2" />
                            Back to Employees
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Edit Employee - ${employee.employee_name} | MSI`}
                description={`Edit employee information for ${employee.employee_name}`}
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/employees">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Employee</h1>
                        </div>
                    </div>


                    {/* Employee Information */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        
                        {/* PROFILE HEADER */}
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex flex-col items-center gap-6 sm:flex-row">
                                <div className="relative">
                                    <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full bg-gray-100">
                                        {employee.employee_foto && (
                                            <img 
                                                src={employee.employee_foto} 
                                                alt="Profile Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-primary-bold text-gray-900 mb-2">
                                        {employee?.employee_name}
                                    </h2>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p className="font-medium">{employee?.title_name}</p>
                                        <p>{employee?.department_name} • {employee?.company_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                    {/* Employee Name */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_name">Name</Label>
                                        <Input
                                            id="employee_name"
                                            type="text"
                                            value={formData.employee_name}
                                            onChange={(e) => handleInputChange('employee_name', e.target.value)}
                                            placeholder="Enter employee name"
                                            error={!!validationErrors.employee_name}
                                        />
                                        {validationErrors.employee_name && (
                                            <span className="text-sm text-red-500">{validationErrors.employee_name}</span>
                                        )}
                                    </div>

                                    {/* Employee Email */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_email">Email</Label>
                                        <Input
                                            id="employee_email"
                                            type="email"
                                            value={formData.employee_email || ''}
                                            onChange={(e) => handleInputChange('employee_email', e.target.value)}
                                            placeholder="Enter employee email"
                                            error={!!validationErrors.employee_email}
                                        />
                                        {validationErrors.employee_email && (
                                            <span className="text-sm text-red-500">{validationErrors.employee_email}</span>
                                        )}
                                    </div>

                                    {/* Company */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="company_id">Company *</Label>
                                        <CustomSelect
                                            options={companyOptions}
                                            value={companyOptions.find(option => option.value === formData.company_id) || null}
                                            onChange={(option) => handleInputChange('company_id', option?.value || '')}
                                            placeholder="Select Company"
                                            isClearable={false}
                                            isSearchable={true}
                                        />
                                        {validationErrors.company_id && (
                                            <span className="text-sm text-red-500">{validationErrors.company_id}</span>
                                        )}
                                    </div>

                                    {/* Department */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="department_id">Department *</Label>
                                        <CustomSelect
                                            options={departmentOptions}
                                            value={departmentOptions.find(option => option.value === formData.department_id) || null}
                                            onChange={(option) => handleInputChange('department_id', option?.value || '')}
                                            placeholder="Select Company first"
                                            isClearable={false}
                                            isSearchable={true}
                                            disabled={!formData.company_id}
                                        />
                                        {validationErrors.department_id && (
                                            <span className="text-sm text-red-500">{validationErrors.department_id}</span>
                                        )}
                                    </div>

                                    {/* Position */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="title_id">Position *</Label>
                                        <CustomSelect
                                            options={positionOptions}
                                            value={positionOptions.find(option => option.value === formData.title_id) || null}
                                            onChange={(option) => handleInputChange('title_id', option?.value || '')}
                                            placeholder="Select Department first"
                                            isClearable={false}
                                            isSearchable={true}
                                            disabled={!formData.department_id}
                                        />
                                        {validationErrors.title_id && (
                                            <span className="text-sm text-red-500">{validationErrors.title_id}</span>
                                        )}
                                    </div>

                                    {/* Employee Mobile */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_mobile">Mobile Phone</Label>
                                        <Input
                                            id="employee_mobile"
                                            type="tel"
                                            value={formData.employee_mobile || ''}
                                            onChange={(e) => handleInputChange('employee_mobile', e.target.value)}
                                            placeholder="Enter mobile phone"
                                        />
                                    </div>

                                    {/* Employee Office Number */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_office_number">Office Phone</Label>
                                        <Input
                                            id="employee_office_number"
                                            type="tel"
                                            value={formData.employee_office_number || ''}
                                            onChange={(e) => handleInputChange('employee_office_number', e.target.value)}
                                            placeholder="Enter office phone"
                                        />
                                    </div>

                                    {/* Employee Address */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_address">Address</Label>
                                        <TextArea
                                            value={formData.employee_address || ''}
                                            onChange={(e) => handleInputChange('employee_address', e.target.value)}
                                            placeholder="Enter employee address"
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>

                            {/* Permissions Section - Accordion with Select All */}
                            {employee && employee.permission_detail && employee.permission_detail.length > 0 && (
                                <div className="md:col-span-2 p-8 lg:ps-0">
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Permission</h2>
                                    <div className="space-y-4 max-h-[770px] overflow-y-auto">
                                        {employee.permission_detail.map((system: EmployeeSystemPermission) => {
                                            const isExpanded = expandedSystems.has(system.system_id);
                                            const isAllChecked = isSystemAllChecked(system.system_id);
                                            
                                            return (
                                                <div key={system.system_id} className="border border-gray-300 rounded-lg overflow-hidden">
                                                    {/* Accordion Header */}
                                                    <div className="bg-gray-50 border-b border-gray-200">
                                                        <div className="flex items-center justify-between p-4">
                                                            <div className="flex items-center gap-3">
                                                                {/* Select All Switch */}
                                                                <div onClick={(e) => e.stopPropagation()}>
                                                                    <Switch
                                                                        label="Select All"
                                                                        checked={isAllChecked}
                                                                        className="capitalize font-secondary font-normal"
                                                                        onChange={(checked) => toggleSystemAllPermissions(system.system_id, checked)}
                                                                    />
                                                                </div>
                                                                
                                                                {/* Clickable System Name Area */}
                                                                <div 
                                                                    className="flex items-center cursor-pointer hover:text-primary transition-colors"
                                                                    onClick={() => toggleSystemExpansion(system.system_id)}
                                                                >
                                                                    {/* System Name */}
                                                                    <h4 className="font-semibold text-lg text-gray-900">
                                                                        {system.system_name}
                                                                    </h4>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Expand/Collapse Button */}
                                                            <div
                                                                onClick={() => toggleSystemExpansion(system.system_id)}
                                                                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <MdExpandLess className="w-6 h-6" />
                                                                ) : (
                                                                    <MdExpandMore className="w-6 h-6" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Accordion Content */}
                                                    {isExpanded && (
                                                        <div className="p-6">
                                                            <div className="space-y-4">
                                                                {system.permission_detail.map((menu: EmployeeMenuPermission) => (
                                                                    <div key={menu.menu_id} className="border border-gray-200 rounded-lg p-4">
                                                                        <h5 className="font-medium text-gray-900 mb-3">{menu.menu_name}</h5>
                                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                                            {sortPermissionsByCRUD(menu.permission_detail).map((permission: EmployeePermissionDetail) => (
                                                                                <div key={permission.permission_id}>
                                                                                    <Switch
                                                                                        label={permission.permission_name}
                                                                                        checked={permission.permission_status || false}
                                                                                        className="capitalize font-secondary font-normal"
                                                                                        onChange={(checked) => handlePermissionChange(system.system_id, menu.menu_id, permission.permission_id, checked)}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/employees')}
                                    className="px-6 rounded-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave size={20} />
                                    {isUpdating ? 'Saving...' : 'Update Employee'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}