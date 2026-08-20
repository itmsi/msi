import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import {
    candidateService,
    hrCompanyService,
    hrDepartmentService,
    hrJobTitleService,
    hrGroupService,
} from '../services/hrService';
import type { Candidate, Company, Department, JobTitle, Group } from '../types/hr';

interface CandidateFormValues {
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    title_id: string;
    company_id: string;
    department_id: string;
    candidate_nationality: string;
    candidate_gender: string;
    candidate_religion: string;
    candidate_date_birth: Date | null;
    candidate_age: string;
    candidate_marital_status: string;
    candidate_address: string;
    candidate_city: string;
    candidate_state: string;
    candidate_country: string;
    candidate_foto: File | string | null;
    candidate_resume: File | string | null;
    candidate_resume_path: File | string | null;
    ptk_date: Date | null;
    offering_letter: Date | null;
    remark: string;
    group_id: string;
}

const INITIAL_FORM: CandidateFormValues = {
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    title_id: '',
    company_id: '',
    department_id: '',
    candidate_nationality: '',
    candidate_gender: '',
    candidate_religion: '',
    candidate_date_birth: null,
    candidate_age: '',
    candidate_marital_status: '',
    candidate_address: '',
    candidate_city: '',
    candidate_state: '',
    candidate_country: '',
    candidate_foto: null,
    candidate_resume: null,
    candidate_resume_path: null,
    ptk_date: null,
    offering_letter: null,
    remark: '',
    group_id: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SelectOption = { value: string; label: string } | null;

interface UseCandidateFormArgs {
    initialData?: Candidate | null;
    onSave: (data?: Candidate) => void;
}

export function useCandidateForm({ initialData, onSave }: UseCandidateFormArgs) {
    const isEdit = !!initialData;
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dropdown data
    const [groups, setGroups] = useState<Group[]>([]);
    const [loadingGroup, setLoadingGroup] = useState(true);
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDept, setLoadingDept] = useState(false);
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [loadingJob, setLoadingJob] = useState(false);

    const [form, setForm] = useState<CandidateFormValues>(INITIAL_FORM);

    const [selectedCompanyName, setSelectedCompanyName] = useState('');
    const [selectedDeptName, setSelectedDeptName] = useState('');
    const [selectedTitleName, setSelectedTitleName] = useState('');

    const clearError = (field: string) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};

        if (!form.candidate_name.trim()) next.candidate_name = 'Name is required';
        if (!form.candidate_email.trim()) {
            next.candidate_email = 'Email is required';
        } else if (!EMAIL_PATTERN.test(form.candidate_email.trim())) {
            next.candidate_email = 'Enter a valid email address';
        }
        if (!form.candidate_phone.trim()) next.candidate_phone = 'Phone number is required';
        if (!form.candidate_age.trim()) next.candidate_age = 'Age is required';
        if (!form.group_id) next.group_id = 'Group is required';
        if (!form.company_id) next.company_id = 'Company is required';
        if (!form.department_id) next.department_id = 'Department is required';
        if (!form.title_id) next.title_id = 'Position is required';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // Load groups on mount
    useEffect(() => {
        hrGroupService
            .getList({
                page: 1,
                limit: 10,
                search: '',
                sort_by: 'created_at',
                sort_order: 'desc',
            })
            .then((result) => setGroups(result.data || []))
            .catch(() => toast.error('Failed to load groups'))
            .finally(() => setLoadingGroup(false));
    }, []);

    // Load companies on mount
    useEffect(() => {
        hrCompanyService
            .getList()
            .then((result) => setCompanies(result.data || []))
            .catch(() => toast.error('Failed to load companies'))
            .finally(() => setLoadingCompany(false));
    }, []);

    // Load initial data for edit mode
    useEffect(() => {
        if (!initialData) return;

        setForm((prev) => ({
            ...prev,
            candidate_name: initialData.candidate_name || '',
            candidate_email: initialData.candidate_email || '',
            candidate_phone: initialData.candidate_phone || '',
            title_id: initialData.title_id || '',
            company_id: initialData.company_id || '',
            department_id: initialData.department_id || '',
            candidate_nationality: initialData.candidate_nationality || '',
            candidate_gender: initialData.candidate_gender || '',
            candidate_religion: initialData.candidate_religion || '',
            candidate_date_birth: initialData.candidate_date_birth
                ? new Date(initialData.candidate_date_birth)
                : null,
            candidate_age: String(initialData.candidate_age ?? ''),
            candidate_marital_status: initialData.candidate_marital_status || '',
            candidate_address: initialData.candidate_address || '',
            candidate_city: initialData.candidate_city || '',
            candidate_state: initialData.candidate_state || '',
            candidate_country: initialData.candidate_country || '',
            candidate_foto: initialData.candidate_foto || null,
            candidate_resume: initialData.candidate_resume || null,
            ptk_date: initialData.ptk_date ? new Date(initialData.ptk_date) : null,
            offering_letter: initialData.offering_letter ? new Date(initialData.offering_letter) : null,
            remark: initialData.remark || '',
            group_id: initialData.group_id || '',
        }));
        setSelectedGroupName(initialData.group_name || '');
        setSelectedCompanyName(initialData.company_name || '');
        setSelectedDeptName(initialData.department_name || '');
        setSelectedTitleName(initialData.title_name || '');
    }, [initialData]);

    // Load departments & job titles when editing
    useEffect(() => {
        if (!initialData || !initialData.company_name || companies.length === 0 || loadingCompany) return;

        const selectedCompany = companies.find((c) => c.company_name === initialData.company_name);
        if (!selectedCompany) return;

        const companyId = selectedCompany.company_id;
        setForm((prev) => ({ ...prev, company_id: companyId }));

        setLoadingDept(true);
        hrDepartmentService
            .getList(companyId)
            .then((result) => {
                setDepartments(result.data || []);
                const selectedDept = result.data?.find(
                    (d) => d.department_name === initialData.department_name
                );
                if (selectedDept) {
                    setForm((prev) => ({ ...prev, department_id: selectedDept.department_id }));
                    return hrJobTitleService.getList(selectedDept.department_id);
                }
                return null;
            })
            .then((jobResult) => {
                if (jobResult) {
                    setJobTitles(jobResult.data || []);
                }
            })
            .catch(() => toast.error('Failed to load dependent data'))
            .finally(() => setLoadingDept(false));
    }, [initialData, companies, loadingCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        clearError(name);
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        clearError('candidate_phone');
        setForm((prev) => ({ ...prev, candidate_phone: value }));
    };

    // FileUpload validates size/format itself (maxSize + acceptedFormats props); by the
    // time onFileChange fires the file has already passed that check.
    const handlePhotoChange = (files: File | File[] | null) => {
        const file = Array.isArray(files) ? files[0] ?? null : files;
        setForm((prev) => ({ ...prev, candidate_foto: file }));
    };

    const handleResumeChange = (files: File | File[] | null) => {
        const file = Array.isArray(files) ? files[0] ?? null : files;
        setForm((prev) => ({ ...prev, candidate_resume: file }));
    };

    const handleGenderChange = (opt: SelectOption) => {
        setForm((prev) => ({ ...prev, candidate_gender: opt?.value || '' }));
    };

    const handleMaritalStatusChange = (opt: SelectOption) => {
        setForm((prev) => ({ ...prev, candidate_marital_status: opt?.value || '' }));
    };

    const handleGroupChange = (opt: SelectOption) => {
        const value = opt?.value || '';
        const label = opt?.label || '';
        clearError('group_id');
        setSelectedGroupName(label);
        setSelectedCompanyName('');
        setSelectedDeptName('');
        setSelectedTitleName('');
        setForm((prev) => ({
            ...prev,
            group_id: value,
            company_id: '',
            department_id: '',
            title_id: '',
        }));
        setDepartments([]);
        setJobTitles([]);
    };

    const handleCompanyChange = (opt: SelectOption) => {
        const value = opt?.value || '';
        clearError('company_id');
        setSelectedCompanyName(value);
        setSelectedDeptName('');
        setSelectedTitleName('');
        setForm((prev) => ({ ...prev, company_id: '', department_id: '', title_id: '' }));
        const selected = companies.find((c) => c.company_name === value);
        if (selected) {
            setForm((prev) => ({ ...prev, company_id: selected.company_id }));
            setLoadingDept(true);
            hrDepartmentService.getList(selected.company_id)
                .then((result) => setDepartments(result.data || []))
                .catch(() => setDepartments([]))
                .finally(() => setLoadingDept(false));
        }
    };

    const handleDepartmentChange = (opt: SelectOption) => {
        const value = opt?.value || '';
        clearError('department_id');
        setSelectedDeptName(value);
        setSelectedTitleName('');
        setForm((prev) => ({ ...prev, title_id: '' }));
        const selected = departments.find((d) => d.department_name === value);
        if (selected) {
            setForm((prev) => ({ ...prev, department_id: selected.department_id }));
            setLoadingJob(true);
            hrJobTitleService.getList(selected.department_id)
                .then((result) => setJobTitles(result.data || []))
                .catch(() => setJobTitles([]))
                .finally(() => setLoadingJob(false));
        }
    };

    const handleTitleChange = (opt: SelectOption) => {
        const value = opt?.value || '';
        clearError('title_id');
        setSelectedTitleName(value);
        const selected = jobTitles.find((j) => j.title_name === value);
        if (selected) setForm((prev) => ({ ...prev, title_id: selected.title_id }));
    };

    const handleDateBirthChange = (dates: Date[]) => {
        setForm((prev) => ({
            ...prev,
            candidate_date_birth: dates && dates.length > 0 ? dates[0] : null,
        }));
    };

    const handlePtkDateChange = (dates: Date[]) => {
        setForm((prev) => ({
            ...prev,
            ptk_date: dates && dates.length > 0 ? dates[0] : null,
        }));
    };

    const handleOfferingLetterChange = (dates: Date[]) => {
        setForm((prev) => ({
            ...prev,
            offering_letter: dates && dates.length > 0 ? dates[0] : null,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget;

        const isValid = validate();

        if (!formEl.checkValidity() || !isValid) {
            e.stopPropagation();
            setValidated(true);
            if (!isValid) toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const submitData = { ...form };
            if (submitData.candidate_date_birth) {
                submitData.candidate_date_birth = dayjs(submitData.candidate_date_birth).format('YYYY-MM-DD') as unknown as Date;
            }
            if (submitData.ptk_date) {
                submitData.ptk_date = dayjs(submitData.ptk_date).format('YYYY-MM-DD') as unknown as Date;
            }
            if (submitData.offering_letter) {
                submitData.offering_letter = dayjs(submitData.offering_letter).format('YYYY-MM-DD') as unknown as Date;
            }

            if (isEdit) {
                await candidateService.updateMultipart(initialData!.candidate_id, buildFormData(submitData));
                toast.success('Candidate updated successfully!');
            } else {
                await candidateService.createMultipart(buildFormData(submitData));
                toast.success('Candidate created successfully!');
            }

            onSave();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Operation failed';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        isEdit,
        validated,
        submitting,
        errors,
        form,

        groups,
        loadingGroup,
        selectedGroupName,
        companies,
        loadingCompany,
        selectedCompanyName,
        departments,
        loadingDept,
        selectedDeptName,
        jobTitles,
        loadingJob,
        selectedTitleName,

        handleChange,
        handlePhoneChange,
        handlePhotoChange,
        handleResumeChange,
        handleGenderChange,
        handleMaritalStatusChange,
        handleGroupChange,
        handleCompanyChange,
        handleDepartmentChange,
        handleTitleChange,
        handleDateBirthChange,
        handlePtkDateChange,
        handleOfferingLetterChange,
        handleSubmit,
    };
}

// Helper to build FormData from form state
function buildFormData(form: Record<string, unknown>): FormData {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
        if (key === 'candidate_foto' || key === 'candidate_resume') {
            if (value instanceof File) {
                fd.append(key, value);
            }
        } else if (value !== null && value !== undefined && value !== '') {
            fd.append(key, String(value));
        }
    });
    return fd;
}
