import { useState, useEffect } from 'react';
import { candidateService, hrCompanyService, hrDepartmentService, hrJobTitleService } from './services/hrService';
import type { Candidate, Company, Department, JobTitle } from './types/hr';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

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
    candidate_title: '',
    cum_title_id: '',
    candidate_company: '',
    cum_companies_id: '',
    candidate_department: '',
    cum_departement_id: '',
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
  });

  const [fileNamePhoto, setFileNamePhoto] = useState('');
  const [fileNameCV, setFileNameCV] = useState('');

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
      candidate_name: initialData.name || '',
      candidate_email: initialData.email || '',
      candidate_phone: initialData?.personal_information?.[0]?.candidate_phone || '',
      candidate_title: initialData.position || '',
      cum_title_id: initialData.position_id || '',
      candidate_company: initialData.company || '',
      cum_companies_id: initialData.company_id || '',
      candidate_department: initialData.department || '',
      cum_departement_id: initialData.department_id || '',
      candidate_nationality: initialData?.personal_information?.[0]?.candidate_nationality || '',
      candidate_gender: initialData?.personal_information?.[0]?.candidate_gender || '',
      candidate_religion: initialData?.personal_information?.[0]?.candidate_religion || '',
      candidate_date_birth: initialData?.personal_information?.[0]?.candidate_date_birth
        ? new Date(initialData.personal_information[0].candidate_date_birth)
        : null,
      candidate_age: initialData.age || '',
      candidate_marital_status: initialData?.personal_information?.[0]?.candidate_marital_status || '',
      candidate_address: initialData?.address_information?.[0]?.candidate_address || '',
      candidate_city: initialData?.address_information?.[0]?.candidate_city || '',
      candidate_state: initialData?.address_information?.[0]?.candidate_state || '',
      candidate_country: initialData?.address_information?.[0]?.candidate_country || '',
      candidate_foto: initialData.image || null,
      candidate_resume: initialData.resume || null,
    }));

    if (initialData.image) {
      setFileNamePhoto(typeof initialData.image === 'string' ? 'Current Photo' : '');
    }
    if (initialData.resume) {
      setFileNameCV(typeof initialData.resume === 'string' ? 'Current Resume' : '');
    }
  }, [initialData]);

  // Load departments & job titles when editing
  useEffect(() => {
    if (!initialData || !initialData.company || companies.length === 0 || loadingCompany) return;

    const selectedCompany = companies.find((c) => c.company_name === initialData.company);
    if (!selectedCompany) return;

    const companyId = selectedCompany.company_id;
    setForm((prev) => ({ ...prev, cum_companies_id: companyId }));

    setLoadingDept(true);
    hrDepartmentService
      .getList(companyId)
      .then((result) => {
        setDepartments(result.data || []);
        const selectedDept = result.data?.find(
          (d) => d.departement_name === initialData.department
        );
        if (selectedDept) {
          setForm((prev) => ({ ...prev, cum_departement_id: selectedDept.departement_id }));
          return hrJobTitleService.getList(selectedDept.departement_id);
        }
        return null;
      })
      .then((jobResult) => {
        if (jobResult) {
          setJobTitles(jobResult.response?.result || []);
        }
      })
      .catch(() => toast.error('Failed to load dependent data'))
      .finally(() => setLoadingDept(false));
  }, [initialData, companies, loadingCompany]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'candidate_company' && {
        candidate_department: '',
        candidate_title: '',
        cum_departement_id: '',
        cum_title_id: '',
      }),
      ...(name === 'candidate_department' && {
        candidate_title: '',
        cum_title_id: '',
      }),
    }));

    // Load departments when company changes
    if (name === 'candidate_company' && value) {
      const selected = companies.find((c) => c.company_name === value);
      if (selected) {
        setForm((prev) => ({ ...prev, cum_companies_id: selected.company_id }));
        setLoadingDept(true);
        hrDepartmentService
          .getList(selected.company_id)
          .then((result) => setDepartments(result.data || []))
          .catch(() => setDepartments([]))
          .finally(() => setLoadingDept(false));
      }
    }

    // Load job titles when department changes
    if (name === 'candidate_department' && value) {
      const selected = departments.find((d) => d.departement_name === value);
      if (selected) {
        setForm((prev) => ({ ...prev, cum_departement_id: selected.departement_id }));
        setLoadingJob(true);
        hrJobTitleService
          .getList(selected.departement_id)
          .then((result) => setJobTitles(result.response?.result || []))
          .catch(() => setJobTitles([]))
          .finally(() => setLoadingJob(false));
      }
    }

    // Store title ID when title changes
    if (name === 'candidate_title' && value) {
      const selected = jobTitles.find((j) => j.job_title_name === value);
      if (selected) {
        setForm((prev) => ({ ...prev, cum_title_id: selected.job_title_id }));
      }
    }
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

      const hasFile = form.candidate_foto instanceof File || form.candidate_resume instanceof File;

      if (isEdit) {
        await candidateService.updateMultipart(initialData!.id, buildFormData(submitData));
        toast.success('Candidate updated successfully!');
      } else {
        if (hasFile) {
          await candidateService.createMultipart(buildFormData(submitData));
        } else {
          const payload = Object.entries(submitData).reduce(
            (acc, [key, val]) => {
              if (val !== null && val !== undefined && val !== '' && !(val instanceof File)) {
                acc[key] = val as string;
              }
              return acc;
            },
            {} as Record<string, string>
          );
          await candidateService.create(payload);
        }
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
      className={`${!isEdit ? 'p-6 bg-gray-50 rounded-xl border border-gray-200' : ''} ${
        validated ? 'was-validated' : ''
      }`}
    >
      {!isEdit && <h2 className="text-lg font-semibold mb-4">Create New Candidate</h2>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="candidate_name"
            value={form.candidate_name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="candidate_email"
            value={form.candidate_email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            name="candidate_phone"
            value={form.candidate_phone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '');
              setForm((prev) => ({ ...prev, candidate_phone: value }));
            }}
            maxLength={13}
            required
            placeholder="08xxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Religion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
          <input
            type="text"
            name="candidate_religion"
            value={form.candidate_religion}
            onChange={handleChange}
            placeholder="Enter religion"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <select
            name="candidate_company"
            value={form.candidate_company}
            onChange={handleChange}
            required
            disabled={loadingCompany}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">
              {loadingCompany ? 'Loading companies...' : '-- Choose Company --'}
            </option>
            {!loadingCompany &&
              [...companies]
                .sort((a, b) => a.company_name.localeCompare(b.company_name))
                .map((comp) => (
                  <option key={comp.company_id} value={comp.company_name}>
                    {comp.company_name}
                  </option>
                ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            name="candidate_department"
            value={form.candidate_department}
            onChange={handleChange}
            required
            disabled={loadingDept || !form.candidate_company}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">
              {!form.candidate_company
                ? 'Select a company first'
                : loadingDept
                  ? 'Loading departments...'
                  : '-- Choose Department --'}
            </option>
            {form.candidate_company &&
              !loadingDept &&
              [...departments]
                .sort((a, b) => a.departement_name.localeCompare(b.departement_name))
                .map((dept) => (
                  <option key={dept.departement_id} value={dept.departement_name}>
                    {dept.departement_name}
                  </option>
                ))}
          </select>
        </div>

        {/* Position / Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select
            name="candidate_title"
            value={form.candidate_title}
            onChange={handleChange}
            required
            disabled={loadingJob || !form.candidate_department}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">
              {!form.candidate_department
                ? 'Select a department first'
                : loadingJob
                  ? 'Loading positions...'
                  : '-- Choose Position --'}
            </option>
            {form.candidate_department &&
              !loadingJob &&
              [...jobTitles]
                .sort((a, b) => a.job_title_name.localeCompare(b.job_title_name))
                .map((job) => (
                  <option key={job.job_title_id} value={job.job_title_name}>
                    {job.job_title_name}
                  </option>
                ))}
          </select>
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
          <input
            type="text"
            name="candidate_nationality"
            value={form.candidate_nationality}
            onChange={handleChange}
            placeholder="Enter nationality"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="candidate_gender"
            value={form.candidate_gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Choose Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="candidate_date_birth"
            value={
              form.candidate_date_birth instanceof Date
                ? form.candidate_date_birth.toISOString().split('T')[0]
                : ''
            }
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                candidate_date_birth: e.target.value ? new Date(e.target.value) : null,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            name="candidate_age"
            value={form.candidate_age}
            onChange={handleChange}
            placeholder="Enter age"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
          <select
            name="candidate_marital_status"
            value={form.candidate_marital_status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Choose --</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="candidate_address"
            value={form.candidate_address}
            onChange={handleChange}
            rows={2}
            placeholder="Enter address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* City, State, Country row */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="candidate_city"
            value={form.candidate_city}
            onChange={handleChange}
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="candidate_state"
            value={form.candidate_state}
            onChange={handleChange}
            placeholder="State"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="candidate_country"
            value={form.candidate_country}
            onChange={handleChange}
            placeholder="Country"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            <p className="text-xs text-gray-400 mt-1">{fileNamePhoto}</p>
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
            <p className="text-xs text-gray-400 mt-1">{fileNameCV}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Candidate' : 'Create Candidate'}
        </button>
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
