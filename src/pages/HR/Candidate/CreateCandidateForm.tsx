import { useState, useEffect } from 'react';
import { candidateService, hrCompanyService, hrDepartmentService, hrJobTitleService, hrGroupService } from './services/hrService';
import type { Candidate, Company, Department, JobTitle, Group } from './types/hr';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import DatePicker from '@/components/form/date-picker';

interface CreateCandidateFormProps {
  initialData?: Candidate | null;
  onSave: (data?: Candidate) => void;
  onCancel: () => void;
}

const CreateCandidateForm = ({ initialData, onSave, onCancel }: CreateCandidateFormProps) => {
  const isEdit = !!initialData;
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const [form, setForm] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    title_id: '',
    company_id: '',
    department_id: '',
    candidate_nationality: '',
    candidate_gender: '',
    candidate_religion: '',
    candidate_date_birth: null as Date | null,
    candidate_age: '',
    candidate_marital_status: '',
    candidate_address: '',
    candidate_city: '',
    candidate_state: '',
    candidate_country: '',
    candidate_foto: null as File | string | null,
    candidate_resume: null as File | string | null,
    ptk_date: null as Date | null,
    offering_letter: null as Date | null,
    remark: '',
    group_id: '',
  });

  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [selectedTitleName, setSelectedTitleName] = useState('');

  const [fileNamePhoto, setFileNamePhoto] = useState('');
  const [fileNameCV, setFileNameCV] = useState('');

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

    if (initialData.candidate_foto) {
      setFileNamePhoto('Current Photo');
    }
    if (initialData.candidate_resume) {
      setFileNameCV('Current Resume');
    }
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
    if (name === 'candidate_company') {
      setSelectedCompanyName(value);
      setSelectedDeptName('');
      setSelectedTitleName('');
      setForm((prev) => ({ ...prev, department_id: '', title_id: '' }));
      const selected = companies.find((c) => c.company_name === value);
      if (selected) {
        setForm((prev) => ({ ...prev, company_id: selected.company_id }));
        setLoadingDept(true);
        hrDepartmentService.getList(selected.company_id)
          .then((result) => setDepartments(result.data || []))
          .catch(() => setDepartments([]))
          .finally(() => setLoadingDept(false));
      }
      return;
    }
    if (name === 'candidate_department') {
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
      return;
    }
    if (name === 'candidate_title') {
      setSelectedTitleName(value);
      const selected = jobTitles.find((j) => j.title_name === value);
      if (selected) setForm((prev) => ({ ...prev, title_id: selected.title_id }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;

    if (name === 'candidate_foto') {
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be under 2MB');
        return;
      }
      setFileNamePhoto(file.name);
    }

    if (name === 'candidate_resume') {
      if (file.type !== 'application/pdf') {
        toast.error('Resume must be a PDF file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Resume size must be under 2MB');
        return;
      }
      setFileNameCV(file.name);
    }

    setForm((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;

    if (!formEl.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
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

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={`${!isEdit ? 'p-6 bg-gray-50 rounded-xl border border-gray-200' : ''} ${validated ? 'was-validated' : ''
        }`}
    >
      {!isEdit && <h2 className="text-lg font-semibold mb-4">Create New Candidate</h2>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <Input
            type="text"
            name="candidate_name"
            value={form.candidate_name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="required-field"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input
            type="email"
            name="candidate_email"
            value={form.candidate_email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="required-field"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <Input
            type="text"
            name="candidate_phone"
            value={form.candidate_phone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '');
              setForm((prev) => ({ ...prev, candidate_phone: value }));
            }}
            maxLength={13}
            placeholder="08xxxxxxxxxx"
            className="required-field"
          />
        </div>

        {/* Religion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
          <Input
            type="text"
            name="candidate_religion"
            value={form.candidate_religion}
            onChange={handleChange}
            placeholder="Enter religion"
          />
        </div>

        {/* Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
          <CustomSelect
            name="group_id"
            value={selectedGroupName ? { value: form.group_id, label: selectedGroupName } : null}
            onChange={(opt) => {
              const value = opt?.value || '';
              const label = opt?.label || '';
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
            }}
            options={[...groups].sort((a, b) => a.group_name.localeCompare(b.group_name)).map((g) => ({ value: g.group_id, label: g.group_name }))}
            placeholder={loadingGroup ? 'Loading groups...' : '-- Choose Group --'}
            disabled={loadingGroup}
            isSearchable
            isClearable
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <CustomSelect
            name="candidate_company"
            value={selectedCompanyName ? { value: selectedCompanyName, label: selectedCompanyName } : null}
            onChange={(opt) => {
              const value = opt?.value || '';
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
            }}
            options={[...companies].sort((a, b) => a.company_name.localeCompare(b.company_name)).map((c) => ({ value: c.company_name, label: c.company_name }))}
            placeholder={!selectedGroupName ? 'Select group first' : loadingCompany ? 'Loading companies...' : '-- Choose Company --'}
            disabled={loadingCompany || !selectedGroupName}
            isSearchable
            isClearable
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <CustomSelect
            name="candidate_department"
            value={selectedDeptName ? { value: selectedDeptName, label: selectedDeptName } : null}
            onChange={(opt) => {
              const value = opt?.value || '';
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
            }}
            options={[...departments].sort((a, b) => (a.department_name || '').localeCompare(b.department_name || '')).map((d) => ({ value: d.department_name, label: d.department_name }))}
            placeholder={!selectedCompanyName ? 'Select a company first' : loadingDept ? 'Loading departments...' : '-- Choose Department --'}
            disabled={loadingDept || !selectedCompanyName}
            isSearchable
            isClearable
          />
        </div>

        {/* Position / Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <CustomSelect
            name="candidate_title"
            value={selectedTitleName ? { value: selectedTitleName, label: selectedTitleName } : null}
            onChange={(opt) => {
              const value = opt?.value || '';
              setSelectedTitleName(value);
              const selected = jobTitles.find((j) => j.title_name === value);
              if (selected) setForm((prev) => ({ ...prev, title_id: selected.title_id }));
            }}
            options={[...jobTitles].sort((a, b) => (a.title_name || '').localeCompare(b.title_name || '')).map((j) => ({ value: j.title_name, label: j.title_name }))}
            placeholder={!selectedDeptName ? 'Select a department first' : loadingJob ? 'Loading positions...' : '-- Choose Position --'}
            disabled={loadingJob || !selectedDeptName}
            isSearchable
            isClearable
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
          <Input
            type="text"
            name="candidate_nationality"
            value={form.candidate_nationality}
            onChange={handleChange}
            placeholder="Enter nationality"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <CustomSelect
            name="candidate_gender"
            value={form.candidate_gender ? { value: form.candidate_gender, label: form.candidate_gender } : null}
            onChange={(opt) => setForm((prev) => ({ ...prev, candidate_gender: opt?.value || '' }))}
            options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
            placeholder="-- Choose Gender --"
            isSearchable={false}
            isClearable
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <DatePicker
            id="candidate_date_birth"
            placeholder="Select date of birth"
            defaultDate={form.candidate_date_birth || undefined}
            isStatic={true}
            onChange={(dates) =>
              setForm((prev) => ({
                ...prev,
                candidate_date_birth: dates && dates.length > 0 ? dates[0] : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PTK Date</label>
          <DatePicker
            id="ptk_date"
            placeholder="Select PTK date"
            defaultDate={form.ptk_date || undefined}
            isStatic={true}
            onChange={(dates) =>
              setForm((prev) => ({
                ...prev,
                ptk_date: dates && dates.length > 0 ? dates[0] : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Offering Letter Date</label>
          <DatePicker
            id="offering_letter"
            placeholder="Select offering letter date"
            defaultDate={form.offering_letter || undefined}
            isStatic={true}
            onChange={(dates) =>
              setForm((prev) => ({
                ...prev,
                offering_letter: dates && dates.length > 0 ? dates[0] : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
          <TextArea
            name="remark"
            value={form.remark}
            onChange={handleChange}
            rows={3}
            placeholder="Enter remark"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <Input
            type="number"
            name="candidate_age"
            value={form.candidate_age}
            onChange={handleChange}
            placeholder="Enter age"
          />
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
          <CustomSelect
            name="candidate_marital_status"
            value={form.candidate_marital_status ? { value: form.candidate_marital_status, label: form.candidate_marital_status } : null}
            onChange={(opt) => setForm((prev) => ({ ...prev, candidate_marital_status: opt?.value || '' }))}
            options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }]}
            placeholder="-- Choose --"
            isSearchable={false}
            isClearable
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <TextArea
            name="candidate_address"
            value={form.candidate_address}
            onChange={handleChange}
            rows={2}
            placeholder="Enter address"
          />
        </div>

        {/* City, State, Country row */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <Input
            type="text"
            name="candidate_city"
            value={form.candidate_city}
            onChange={handleChange}
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <Input
            type="text"
            name="candidate_state"
            value={form.candidate_state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <Input
            type="text"
            name="candidate_country"
            value={form.candidate_country}
            onChange={handleChange}
            placeholder="Country"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
          <input
            type="file"
            name="candidate_foto"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileNamePhoto && (
            <p className="text-xs text-gray-400 mt-1">
              {fileNamePhoto}
              {isEdit && typeof initialData?.candidate_foto === 'string' && initialData.candidate_foto.startsWith('http') && (
                <a href={initialData.candidate_foto + '/download'} target="_blank" rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-700 underline">View</a>
              )}
            </p>
          )}
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
          <input
            type="file"
            name="candidate_resume"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileNameCV && (
            <p className="text-xs text-gray-400 mt-1">
              {fileNameCV}
              {isEdit && typeof initialData?.candidate_resume === 'string' && initialData.candidate_resume.startsWith('http') && (
                <a href={initialData.candidate_resume + '/download'} target="_blank" rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-700 underline">Download</a>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Candidate' : 'Create Candidate'}
        </Button>
      </div>
    </form>
  );
};

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

export default CreateCandidateForm;
